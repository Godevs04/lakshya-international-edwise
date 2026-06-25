import dynamic from "next/dynamic";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { getAnalyticsDashboardAction } from "@/lib/actions/analytics.actions";
import { requireModuleEnabled } from "@/lib/auth/module-guard";
import { requirePagePermission } from "@/lib/auth/page-access";
import { PERMISSIONS } from "@/lib/constants/permissions";

const AnalyticsKpiCards = dynamic(
  () => import("@/components/charts/analytics-charts").then((m) => m.AnalyticsKpiCards),
  { loading: () => <Skeleton className="h-24 rounded-[20px] bg-[#E8952E]/8" /> }
);
const VisualFunnelChart = dynamic(
  () => import("@/components/charts/analytics-charts").then((m) => m.VisualFunnelChart),
  { loading: () => <Skeleton className="h-96 rounded-[20px] bg-[#E8952E]/8" /> }
);
const AnalyticsTrendChart = dynamic(
  () => import("@/components/charts/analytics-charts").then((m) => m.AnalyticsTrendChart),
  { loading: () => <Skeleton className="h-80 rounded-[20px] bg-[#E8952E]/8" /> }
);
const AnalyticsRevenueChart = dynamic(
  () => import("@/components/charts/analytics-charts").then((m) => m.AnalyticsRevenueChart),
  { loading: () => <Skeleton className="h-80 rounded-[20px] bg-[#E8952E]/8" /> }
);
const AnalyticsPartnersChart = dynamic(
  () => import("@/components/charts/analytics-charts").then((m) => m.AnalyticsPartnersChart),
  { loading: () => <Skeleton className="h-80 rounded-[20px] bg-[#E8952E]/8" /> }
);
const DemographicsBarChart = dynamic(
  () => import("@/components/charts/analytics-charts").then((m) => m.DemographicsBarChart),
  { loading: () => <Skeleton className="h-80 rounded-[20px] bg-[#E8952E]/8" /> }
);
const LoanRangeChart = dynamic(
  () => import("@/components/charts/analytics-charts").then((m) => m.LoanRangeChart),
  { loading: () => <Skeleton className="h-80 rounded-[20px] bg-[#E8952E]/8" /> }
);
const CourseBarChart = dynamic(
  () => import("@/components/charts/analytics-charts").then((m) => m.CourseBarChart),
  { loading: () => <Skeleton className="h-80 rounded-[20px] bg-[#E8952E]/8" /> }
);
const LenderBarChart = dynamic(
  () => import("@/components/charts/analytics-charts").then((m) => m.LenderBarChart),
  { loading: () => <Skeleton className="h-80 rounded-[20px] bg-[#E8952E]/8" /> }
);
const AnalyticsHeatMap = dynamic(
  () => import("@/components/charts/analytics-charts").then((m) => m.AnalyticsHeatMap),
  { loading: () => <Skeleton className="h-64 rounded-[20px] bg-[#E8952E]/8" /> }
);

export default async function AnalyticsPage() {
  await requireModuleEnabled("analytics");
  await requirePagePermission(PERMISSIONS.ANALYTICS_READ);

  const {
    summary,
    appPipeline,
    funnel,
    trends,
    revenue,
    demographics,
    heatmap,
    partners,
    loanDist,
    lenderDist,
  } = await getAnalyticsDashboardAction();

  const partnerChart = partners.map((p) => ({
    name: p.companyName,
    value: p.performance?.disbursementTotal ?? 0,
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics"
        description="Business intelligence — conversion funnels, demographics, and performance trends"
        badge="Insights"
      />

      <AnalyticsKpiCards summary={summary} />

      <div className="grid gap-6 lg:grid-cols-2">
        {appPipeline.some((f) => f.value > 0) ? (
          <VisualFunnelChart
            data={appPipeline}
            title="Application Pipeline"
            subtitle="Students at each application stage (Docs Pending → Disbursed)"
            linkMode="workflow"
            delay={0.05}
          />
        ) : (
          <EmptyState title="No application pipeline data" description="Add students to see the funnel." />
        )}
        {funnel.some((f) => f.value > 0) ? (
          <VisualFunnelChart
            data={funnel}
            title="Student Lifecycle Funnel"
            subtitle="Progress from New lead through to Disbursed"
            linkMode="status"
            delay={0.1}
          />
        ) : (
          <EmptyState title="No lifecycle funnel data" description="Student status updates will populate this chart." />
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {trends.length > 0 ? (
          <AnalyticsTrendChart data={trends} delay={0.12} />
        ) : (
          <EmptyState title="No trend data" />
        )}
        {revenue.length > 0 ? (
          <AnalyticsRevenueChart data={revenue} delay={0.14} />
        ) : (
          <EmptyState title="No disbursement data" />
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {partnerChart.some((p) => p.value > 0) ? (
          <AnalyticsPartnersChart data={partnerChart} delay={0.16} />
        ) : (
          <EmptyState title="No partner performance data" />
        )}
        {demographics.courses.length > 0 ? (
          <CourseBarChart data={demographics.courses} delay={0.18} />
        ) : (
          <EmptyState title="No course data" />
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {demographics.gender.length > 0 && (
          <DemographicsBarChart
            data={demographics.gender}
            title="Gender Distribution"
            subtitle="Share of students by gender"
            drillDownKind="gender"
            delay={0.2}
          />
        )}
        {demographics.states.length > 0 && (
          <DemographicsBarChart
            data={demographics.states}
            title="State Distribution"
            subtitle="Top states by student count"
            drillDownKind="state"
            delay={0.22}
          />
        )}
        {loanDist.some((l) => l.value > 0) && (
          <LoanRangeChart data={loanDist} delay={0.24} />
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {lenderDist.length > 0 ? (
          <LenderBarChart data={lenderDist} delay={0.26} />
        ) : (
          <EmptyState title="No lender data" description="Assign lenders on student profiles to see the mix." />
        )}
        {heatmap.length > 0 && <AnalyticsHeatMap data={heatmap} delay={0.28} />}
      </div>
    </div>
  );
}
