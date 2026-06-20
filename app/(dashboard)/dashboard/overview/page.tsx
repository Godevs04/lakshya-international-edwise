import { auth } from "@/lib/auth/auth";
import { getGreeting, formatCurrency } from "@/lib/utils/format";
import { getOverviewDashboardAction } from "@/lib/actions/dashboard.actions";
import { MetricCardsGrid, type MetricIconName } from "@/components/cards/metric-card";
import { GlassCard } from "@/components/cards/glass-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Timeline } from "@/components/ui/timeline";
import { EmptyState } from "@/components/ui/empty-state";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { StudentListCard } from "@/components/cards/student-list-card";
import { FollowUpCards } from "@/components/cards/follow-up-card";
import {
  LoanStatusPieChart,
  MonthlyStudentsAreaChart,
  LoanAmountBarChart,
  TopPartnersBarChart,
} from "@/components/charts/dashboard-charts";
import Link from "next/link";
import { Handshake } from "lucide-react";
import type { StudentStatus } from "@/lib/constants/statuses";

export default async function OverviewPage() {
  const session = await auth();
  const {
    metrics,
    loanStatus,
    monthlyStudents,
    loanAmount,
    topPartners,
    activities,
    latestStudents,
    latestPartners,
    followups,
  } = await getOverviewDashboardAction();

  const metricCards: Array<{ title: string; value: string | number; icon: MetricIconName; trend?: string; trendUp?: boolean }> = [
    { title: "Total Students", value: metrics.totalStudents, icon: "users", trend: "↑ 24%", trendUp: true },
    { title: "New Students Today", value: metrics.newStudentsToday, icon: "user-plus", trend: "↑ 12%", trendUp: true },
    { title: "Partners", value: metrics.totalPartners, icon: "handshake", trend: "↑ 8%", trendUp: true },
    { title: "Pending Applications", value: metrics.pendingApplications, icon: "clock", trend: "↓ 5%", trendUp: false },
    { title: "Sanctioned", value: metrics.sanctioned, icon: "check-circle", trend: "↑ 18%", trendUp: true },
    { title: "Disbursed", value: metrics.disbursed, icon: "banknote", trend: "↑ 32%", trendUp: true },
    { title: "Rejected", value: metrics.rejected, icon: "x-circle", trend: "↓ 3%", trendUp: false },
    { title: "Loan Amount", value: formatCurrency(metrics.totalLoanAmount), icon: "indian-rupee", trend: "↑ 41%", trendUp: true },
    { title: "Today's Collection", value: formatCurrency(metrics.todaysCollection), icon: "wallet", trend: "↑ 15%", trendUp: true },
  ];

  return (
    <div className="space-y-8">
      <DashboardHero
        greeting={getGreeting(session?.user?.name ?? "User")}
        userName={session?.user?.name ?? "User"}
      />

      <MetricCardsGrid cards={metricCards} />

      <div className="grid gap-6 lg:grid-cols-2">
        {loanStatus.length > 0 ? (
          <LoanStatusPieChart data={loanStatus} />
        ) : (
          <GlassCard className="p-8"><EmptyState title="No loan data yet" description="Add students to see loan status distribution." /></GlassCard>
        )}
        {monthlyStudents.length > 0 ? (
          <MonthlyStudentsAreaChart data={monthlyStudents} />
        ) : (
          <GlassCard className="p-8"><EmptyState title="No student trends yet" /></GlassCard>
        )}
        {loanAmount.length > 0 ? (
          <LoanAmountBarChart data={loanAmount} />
        ) : (
          <GlassCard className="p-8"><EmptyState title="No loan amount data yet" /></GlassCard>
        )}
        {topPartners.length > 0 ? (
          <TopPartnersBarChart data={topPartners} />
        ) : (
          <GlassCard className="p-8"><EmptyState title="No partner data yet" /></GlassCard>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard className="p-6 lg:col-span-1">
          <h3 className="mb-5 text-base font-bold">Recent Activity</h3>
          {activities.length > 0 ? (
            <Timeline
              items={activities.map((a) => ({
                id: a._id.toString(),
                title: a.description,
                description: a.action,
                timestamp: a.createdAt,
              }))}
            />
          ) : (
            <EmptyState title="No activity yet" description="Actions will appear here." />
          )}
        </GlassCard>

        <GlassCard className="p-6">
          {latestStudents.length > 0 ? (
            <StudentListCard
              students={latestStudents.map((s) => ({
                id: s._id.toString(),
                firstName: s.firstName,
                lastName: s.lastName,
                studentId: s.studentId,
                status: s.status as StudentStatus,
              }))}
            />
          ) : (
            <>
              <h3 className="mb-4 text-base font-bold">Latest Students</h3>
              <EmptyState title="No students yet" />
            </>
          )}
        </GlassCard>

        <GlassCard className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold">Latest Partners</h3>
            <Link href="/dashboard/partners" className="text-xs font-semibold text-[#6D5EF7] hover:underline">
              View all →
            </Link>
          </div>
          {latestPartners.length > 0 ? (
            <div className="space-y-3">
              {latestPartners.map((p) => (
                <Link key={p._id.toString()} href={`/dashboard/partners/${p._id}`}>
                  <div className="group flex items-center gap-3 rounded-2xl bg-[#6D5EF7]/4 p-3 transition-all hover:translate-x-1 hover:bg-[#6D5EF7]/8">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] shadow-md">
                      <Handshake className="h-4 w-4 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{p.companyName}</p>
                      <p className="text-xs text-muted-foreground">{p.studentsCount} students</p>
                    </div>
                    <StatusBadge status={p.status} type="partner" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="No partners yet" />
          )}
        </GlassCard>
      </div>

      {followups.length > 0 && (
        <GlassCard className="p-6">
          <FollowUpCards
            followups={followups.map((f: { _id: string; studentId: string; firstName: string; lastName: string; note: string; dueDate: Date }) => ({
              id: f._id,
              firstName: f.firstName,
              lastName: f.lastName,
              note: f.note,
              dueDate: f.dueDate,
            }))}
          />
        </GlassCard>
      )}
    </div>
  );
}
