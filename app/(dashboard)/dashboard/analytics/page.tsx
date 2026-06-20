import { PageHeader } from "@/components/dashboard/page-header";
import {
  ConversionFunnelChart,
  TrendLineChart,
  RevenueBarChart,
  DemographicsPieChart,
  HeatMapGrid,
  TopPartnersBarChart,
} from "@/components/charts/dashboard-charts";
import { EmptyState } from "@/components/ui/empty-state";
import {
  getConversionFunnel,
  getTrendData,
  getMonthlyRevenue,
  getStudentDemographics,
  getHeatMapData,
  getPartnerPerformance,
  getLoanDistribution,
} from "@/lib/services/analytics.service";

export default async function AnalyticsPage() {
  const [funnel, trends, revenue, demographics, heatmap, partners, loanDist] =
    await Promise.all([
      getConversionFunnel(),
      getTrendData(),
      getMonthlyRevenue(),
      getStudentDemographics(),
      getHeatMapData(),
      getPartnerPerformance(),
      getLoanDistribution(),
    ]);

  const partnerChart = partners.map((p) => ({
    name: p.companyName,
    value: p.performance?.disbursementTotal ?? 0,
  }));

  return (
    <div className="space-y-8">
      <PageHeader title="Analytics" description="Business intelligence and performance metrics" />

      <div className="grid gap-6 lg:grid-cols-2">
        {funnel.some((f) => f.value > 0) ? (
          <ConversionFunnelChart data={funnel} />
        ) : (
          <EmptyState title="No funnel data" />
        )}
        {trends.length > 0 ? (
          <TrendLineChart data={trends} />
        ) : (
          <EmptyState title="No trend data" />
        )}
        {revenue.length > 0 ? (
          <RevenueBarChart data={revenue} />
        ) : (
          <EmptyState title="No revenue data" />
        )}
        {partnerChart.length > 0 ? (
          <TopPartnersBarChart data={partnerChart} />
        ) : (
          <EmptyState title="No partner performance data" />
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {demographics.gender.length > 0 && (
          <DemographicsPieChart data={demographics.gender} title="Gender Distribution" />
        )}
        {demographics.states.length > 0 && (
          <DemographicsPieChart data={demographics.states} title="State Distribution" />
        )}
        {loanDist.some((l) => l.value > 0) && (
          <DemographicsPieChart data={loanDist} title="Loan Distribution" />
        )}
      </div>

      {heatmap.length > 0 && <HeatMapGrid data={heatmap} />}
    </div>
  );
}
