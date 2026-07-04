import dynamic from "next/dynamic";
import { auth } from "@/lib/auth/auth";
import { formatCurrency } from "@/lib/utils/format";
import { getOverviewDashboardAction } from "@/lib/actions/dashboard.actions";
import { requireAnyPagePermission } from "@/lib/auth/page-access";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { MetricCardsGrid, type MetricIconName } from "@/components/cards/metric-card";
import type { MetricThemeKey } from "@/lib/design/metric-themes";
import { GlassCard } from "@/components/cards/glass-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Timeline } from "@/components/ui/timeline";
import { EmptyState } from "@/components/ui/empty-state";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { StudentListCard } from "@/components/cards/student-list-card";
import { FollowUpCards } from "@/components/cards/follow-up-card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Handshake, Globe } from "lucide-react";
import type { StudentStatus } from "@/lib/constants/statuses";
import type { MetricTrendInfo } from "@/lib/utils/metrics-trend";

const LoanStatusBarChart = dynamic(
  () => import("@/components/charts/dashboard-charts").then((m) => m.LoanStatusBarChart),
  { loading: () => <Skeleton className="h-80 rounded-[20px] bg-[#E8952E]/8" /> }
);
const MonthlyStudentsAreaChart = dynamic(
  () => import("@/components/charts/dashboard-charts").then((m) => m.MonthlyStudentsAreaChart),
  { loading: () => <Skeleton className="h-80 rounded-[20px] bg-[#E8952E]/8" /> }
);
const LoanAmountBarChart = dynamic(
  () => import("@/components/charts/dashboard-charts").then((m) => m.LoanAmountBarChart),
  { loading: () => <Skeleton className="h-80 rounded-[20px] bg-[#E8952E]/8" /> }
);
const TopPartnersBarChart = dynamic(
  () => import("@/components/charts/dashboard-charts").then((m) => m.TopPartnersBarChart),
  { loading: () => <Skeleton className="h-80 rounded-[20px] bg-[#E8952E]/8" /> }
);

function withTrend(
  title: string,
  value: string | number,
  icon: MetricIconName,
  trendInfo: MetricTrendInfo,
  theme: MetricThemeKey,
  href?: string
) {
  return {
    title,
    value,
    icon,
    trend: trendInfo.trend,
    trendUp: trendInfo.trendUp,
    theme,
    href,
  };
}

export default async function OverviewPage() {
  const session = await auth();

  await requireAnyPagePermission([
    PERMISSIONS.STUDENTS_READ,
    PERMISSIONS.PARTNERS_READ,
    PERMISSIONS.APPLICATIONS_READ,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.REPORTS_READ,
  ]);

  const {
    metrics,
    trends,
    loanStatus,
    monthlyStudents,
    loanAmount,
    topPartners,
    activities,
    latestStudents,
    latestPartners,
    followups,
    commissionTotals,
    siteLeadCounts,
  } = await getOverviewDashboardAction();

  const metricCards = [
    withTrend("Total Students", metrics.totalStudents, "users", trends.totalStudents, "purple", "/dashboard/students"),
    withTrend("New Students Today", metrics.newStudentsToday, "user-plus", trends.newStudentsToday, "blue", "/dashboard/students"),
    withTrend("Partners", metrics.totalPartners, "handshake", trends.totalPartners, "cyan", "/dashboard/partners"),
    withTrend("Pending Applications", metrics.pendingApplications, "clock", trends.pendingApplications, "amber", "/dashboard/students?workflow=docs_pending"),
    withTrend("Sanctioned", metrics.sanctioned, "check-circle", trends.sanctioned, "orange", "/dashboard/students?workflow=sanctioned"),
    withTrend("Disbursed", metrics.disbursed, "banknote", trends.disbursed, "green", "/dashboard/students?workflow=disbursed"),
    withTrend("Rejected", metrics.rejected, "x-circle", trends.rejected, "red", "/dashboard/students?status=rejected"),
    withTrend("Loan Amount", formatCurrency(metrics.totalLoanAmount), "indian-rupee", trends.totalLoanAmount, "indigo"),
    withTrend("Today's Collection", formatCurrency(metrics.todaysCollection), "wallet", trends.todaysCollection, "pink"),
    withTrend("Commission Received", formatCurrency(commissionTotals.commissionReceived), "wallet", { trend: "", trendUp: true }, "green", "/dashboard/partners/commissions"),
    withTrend("Commission Shared", formatCurrency(commissionTotals.commissionShared), "handshake", { trend: "", trendUp: true }, "cyan", "/dashboard/partners/commissions"),
    withTrend("Net Commission Earned", formatCurrency(commissionTotals.commissionEarned), "indian-rupee", { trend: "", trendUp: true }, "purple", "/dashboard/partners/commissions"),
    withTrend("Pending Received", formatCurrency(commissionTotals.pendingReceived), "clock", { trend: "", trendUp: false }, "amber", "/dashboard/partners/commissions?status=received_pending"),
    withTrend("Pending Shared", formatCurrency(commissionTotals.pendingShared), "clock", { trend: "", trendUp: false }, "orange", "/dashboard/partners/commissions?status=shared_pending"),
  ];

  return (
    <div className="space-y-8">
      <DashboardHero userName={session?.user?.name ?? "User"} />

      {siteLeadCounts.total > 0 ? (
        <GlassCard className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E8952E]/12">
              <Globe className="h-5 w-5 text-[#E8952E]" />
            </div>
            <div>
              <p className="font-semibold">
                {siteLeadCounts.total} lead{siteLeadCounts.total === 1 ? "" : "s"} awaiting review from site
              </p>
              <p className="text-sm text-muted-foreground">
                {siteLeadCounts.students} student · {siteLeadCounts.partners} partner
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {siteLeadCounts.students > 0 ? (
              <Link
                href="/dashboard/site-leads?tab=students"
                className="inline-flex items-center justify-center rounded-full border border-[#E8952E]/30 px-4 py-2 text-sm font-semibold text-[#E8952E] transition-colors hover:bg-[#E8952E]/10"
              >
                {siteLeadCounts.students} student lead{siteLeadCounts.students === 1 ? "" : "s"}
              </Link>
            ) : null}
            {siteLeadCounts.partners > 0 ? (
              <Link
                href="/dashboard/site-leads?tab=partners"
                className="inline-flex items-center justify-center rounded-full border border-[#E8952E]/30 px-4 py-2 text-sm font-semibold text-[#E8952E] transition-colors hover:bg-[#E8952E]/10"
              >
                {siteLeadCounts.partners} partner lead{siteLeadCounts.partners === 1 ? "" : "s"}
              </Link>
            ) : null}
            <Link
              href="/dashboard/site-leads"
              className="inline-flex items-center justify-center rounded-full bg-[#E8952E] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#E8952E]/90"
            >
              Review from site
            </Link>
          </div>
        </GlassCard>
      ) : null}

      <MetricCardsGrid cards={metricCards} />

      <div className="grid gap-6 lg:grid-cols-2">
        {loanStatus.length > 0 ? (
          <LoanStatusBarChart data={loanStatus} />
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
            <Link href="/dashboard/partners" className="text-xs font-semibold text-[#E8952E] hover:underline">
              View all →
            </Link>
          </div>
          {latestPartners.length > 0 ? (
            <div className="space-y-3">
              {latestPartners.map((p) => (
                <Link key={p._id.toString()} href={`/dashboard/partners/${p._id}`}>
                  <div className="group flex items-center gap-3 rounded-2xl bg-[#E8952E]/4 p-3 transition-all hover:translate-x-1 hover:bg-[#E8952E]/8">
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
