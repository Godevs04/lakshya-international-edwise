"use server";

import { getSessionUser } from "@/lib/auth/auth";
import { requirePermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/constants/permissions";
import {
  getConversionFunnel,
  getTrendData,
  getMonthlyRevenue,
  getStudentDemographics,
  getHeatMapData,
  getPartnerPerformance,
  getLoanDistribution,
} from "@/lib/services/analytics.service";
import { runLogged } from "@/lib/action-utils";

export async function getAnalyticsDashboardAction() {
  return runLogged("getAnalyticsDashboardAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.ANALYTICS_READ);

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

    return { funnel, trends, revenue, demographics, heatmap, partners, loanDist };
  });
}
