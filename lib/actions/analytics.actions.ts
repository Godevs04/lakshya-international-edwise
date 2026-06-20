"use server";

import { unstable_cache } from "next/cache";
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
import { CACHE_TAGS } from "@/lib/cache/revalidate";
import { runLogged } from "@/lib/action-utils";

const CACHE_SECONDS = 60;

const cachedConversionFunnel = unstable_cache(getConversionFunnel, ["analytics-funnel"], {
  revalidate: CACHE_SECONDS,
  tags: [CACHE_TAGS.analytics],
});

const cachedTrendData = unstable_cache(getTrendData, ["analytics-trends"], {
  revalidate: CACHE_SECONDS,
  tags: [CACHE_TAGS.analytics],
});

const cachedMonthlyRevenue = unstable_cache(getMonthlyRevenue, ["analytics-revenue"], {
  revalidate: CACHE_SECONDS,
  tags: [CACHE_TAGS.analytics],
});

const cachedStudentDemographics = unstable_cache(getStudentDemographics, ["analytics-demographics"], {
  revalidate: CACHE_SECONDS,
  tags: [CACHE_TAGS.analytics],
});

const cachedHeatMapData = unstable_cache(getHeatMapData, ["analytics-heatmap"], {
  revalidate: CACHE_SECONDS,
  tags: [CACHE_TAGS.analytics],
});

const cachedPartnerPerformance = unstable_cache(getPartnerPerformance, ["analytics-partners"], {
  revalidate: CACHE_SECONDS,
  tags: [CACHE_TAGS.analytics],
});

const cachedLoanDistribution = unstable_cache(getLoanDistribution, ["analytics-loan-dist"], {
  revalidate: CACHE_SECONDS,
  tags: [CACHE_TAGS.analytics],
});

export async function getAnalyticsDashboardAction() {
  return runLogged("getAnalyticsDashboardAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.ANALYTICS_READ);

    const [funnel, trends, revenue, demographics, heatmap, partners, loanDist] =
      await Promise.all([
        cachedConversionFunnel(),
        cachedTrendData(),
        cachedMonthlyRevenue(),
        cachedStudentDemographics(),
        cachedHeatMapData(),
        cachedPartnerPerformance(),
        cachedLoanDistribution(),
      ]);

    return { funnel, trends, revenue, demographics, heatmap, partners, loanDist };
  });
}
