import { auth } from "@/lib/auth/auth";
import { getGreeting, formatCurrency, formatDate } from "@/lib/utils/format";
import {
  getDashboardMetrics,
  getLoanStatusChart,
  getMonthlyStudentsChart,
  getLoanAmountChart,
  getTopPartnersChart,
  getLatestStudents,
  getLatestPartners,
  getUpcomingFollowups,
} from "@/lib/services/dashboard.service";
import { getRecentActivities } from "@/lib/services/activity.service";
import { MetricCardsGrid, type MetricIconName } from "@/components/cards/metric-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { GlassCard } from "@/components/cards/glass-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Timeline } from "@/components/ui/timeline";
import { EmptyState } from "@/components/ui/empty-state";
import {
  LoanStatusPieChart,
  MonthlyStudentsAreaChart,
  LoanAmountBarChart,
  TopPartnersBarChart,
} from "@/components/charts/dashboard-charts";
import Link from "next/link";
import type { StudentStatus } from "@/lib/constants/statuses";

export default async function OverviewPage() {
  const session = await auth();
  const [
    metrics,
    loanStatus,
    monthlyStudents,
    loanAmount,
    topPartners,
    activities,
    latestStudents,
    latestPartners,
    followups,
  ] = await Promise.all([
    getDashboardMetrics(),
    getLoanStatusChart(),
    getMonthlyStudentsChart(),
    getLoanAmountChart(),
    getTopPartnersChart(),
    getRecentActivities(8),
    getLatestStudents(5),
    getLatestPartners(5),
    getUpcomingFollowups(5),
  ]);

  const metricCards: Array<{ title: string; value: string | number; icon: MetricIconName }> = [
    { title: "Total Students", value: metrics.totalStudents, icon: "users" },
    { title: "New Students Today", value: metrics.newStudentsToday, icon: "user-plus" },
    { title: "Partners", value: metrics.totalPartners, icon: "handshake" },
    { title: "Pending Applications", value: metrics.pendingApplications, icon: "clock" },
    { title: "Sanctioned", value: metrics.sanctioned, icon: "check-circle" },
    { title: "Disbursed", value: metrics.disbursed, icon: "banknote" },
    { title: "Rejected", value: metrics.rejected, icon: "x-circle" },
    { title: "Loan Amount", value: formatCurrency(metrics.totalLoanAmount), icon: "indian-rupee" },
    { title: "Today's Collection", value: formatCurrency(metrics.todaysCollection), icon: "wallet" },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title={getGreeting(session?.user?.name ?? "User")}
        description={`Today's Overview — ${formatDate(new Date())}`}
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
        <GlassCard className="p-5 lg:col-span-1">
          <h3 className="mb-4 text-sm font-semibold">Recent Activity</h3>
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

        <GlassCard className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Latest Students</h3>
            <Link href="/dashboard/students" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          {latestStudents.length > 0 ? (
            <div className="space-y-3">
              {latestStudents.map((s) => (
                <Link key={s._id.toString()} href={`/dashboard/students/${s._id}`} className="flex items-center justify-between rounded-lg p-2 hover:bg-muted/50">
                  <div>
                    <p className="text-sm font-medium">{s.firstName} {s.lastName}</p>
                    <p className="text-xs text-muted-foreground">{s.studentId}</p>
                  </div>
                  <StatusBadge status={s.status as StudentStatus} />
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="No students yet" />
          )}
        </GlassCard>

        <GlassCard className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Latest Partners</h3>
            <Link href="/dashboard/partners" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          {latestPartners.length > 0 ? (
            <div className="space-y-3">
              {latestPartners.map((p) => (
                <Link key={p._id.toString()} href={`/dashboard/partners/${p._id}`} className="flex items-center justify-between rounded-lg p-2 hover:bg-muted/50">
                  <div>
                    <p className="text-sm font-medium">{p.companyName}</p>
                    <p className="text-xs text-muted-foreground">{p.studentsCount} students</p>
                  </div>
                  <StatusBadge status={p.status} type="partner" />
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="No partners yet" />
          )}
        </GlassCard>
      </div>

      {followups.length > 0 && (
        <GlassCard className="p-5">
          <h3 className="mb-4 text-sm font-semibold">Upcoming Follow-ups</h3>
          <div className="space-y-3">
            {followups.map((f: { _id: string; studentId: string; firstName: string; lastName: string; note: string; dueDate: Date }) => (
              <div key={f._id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{f.firstName} {f.lastName}</p>
                  <p className="text-xs text-muted-foreground">{f.note}</p>
                </div>
                <p className="text-xs text-muted-foreground">{formatDate(f.dueDate)}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
