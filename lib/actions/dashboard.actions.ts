"use server";

import { unstable_cache } from "next/cache";
import { getSessionUser } from "@/lib/auth/auth";
import { requireAnyPermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/constants/permissions";
import {
  getDashboardCoreStats,
  getLoanStatusChart,
  getMonthlyStudentsChart,
  getLoanAmountChart,
  getTopPartnersChart,
  getLatestStudents,
  getLatestPartners,
  getUpcomingFollowups,
} from "@/lib/services/dashboard.service";
import { getGlobalCommissionTotals } from "@/lib/services/partner-commission.service";
import { getRecentActivities } from "@/lib/services/activity.service";
import { CACHE_TAGS } from "@/lib/cache/revalidate";
import { runLogged } from "@/lib/action-utils";

const OVERVIEW_PERMISSIONS = [
  PERMISSIONS.STUDENTS_READ,
  PERMISSIONS.PARTNERS_READ,
  PERMISSIONS.APPLICATIONS_READ,
  PERMISSIONS.ANALYTICS_READ,
  PERMISSIONS.REPORTS_READ,
];

const CACHE_SECONDS = 60;

const cachedDashboardCoreStats = unstable_cache(getDashboardCoreStats, ["dashboard-core-stats"], {
  revalidate: CACHE_SECONDS,
  tags: [CACHE_TAGS.dashboard],
});

const cachedLoanStatusChart = unstable_cache(getLoanStatusChart, ["dashboard-loan-status"], {
  revalidate: CACHE_SECONDS,
  tags: [CACHE_TAGS.dashboard],
});

const cachedMonthlyStudentsChart = unstable_cache(getMonthlyStudentsChart, ["dashboard-monthly-students"], {
  revalidate: CACHE_SECONDS,
  tags: [CACHE_TAGS.dashboard],
});

const cachedLoanAmountChart = unstable_cache(getLoanAmountChart, ["dashboard-loan-amount"], {
  revalidate: CACHE_SECONDS,
  tags: [CACHE_TAGS.dashboard],
});

const cachedTopPartnersChart = unstable_cache(getTopPartnersChart, ["dashboard-top-partners"], {
  revalidate: CACHE_SECONDS,
  tags: [CACHE_TAGS.dashboard],
});

const cachedRecentActivities = unstable_cache(
  () => getRecentActivities(8),
  ["dashboard-recent-activities"],
  { revalidate: CACHE_SECONDS, tags: [CACHE_TAGS.dashboard] }
);

const cachedLatestStudents = unstable_cache(
  () => getLatestStudents(5),
  ["dashboard-latest-students"],
  { revalidate: CACHE_SECONDS, tags: [CACHE_TAGS.dashboard] }
);

const cachedLatestPartners = unstable_cache(
  () => getLatestPartners(5),
  ["dashboard-latest-partners"],
  { revalidate: CACHE_SECONDS, tags: [CACHE_TAGS.dashboard] }
);

const cachedFollowups = unstable_cache(
  () => getUpcomingFollowups(5),
  ["dashboard-followups"],
  { revalidate: CACHE_SECONDS, tags: [CACHE_TAGS.dashboard] }
);

export async function getOverviewDashboardAction() {
  return runLogged("getOverviewDashboardAction", async () => {
    const user = await getSessionUser();
    requireAnyPermission(user, OVERVIEW_PERMISSIONS);

    const [
      { metrics, trends },
      loanStatus,
      monthlyStudents,
      loanAmount,
      topPartners,
      activities,
      latestStudents,
      latestPartners,
      followups,
      commissionTotals,
    ] = await Promise.all([
      cachedDashboardCoreStats(),
      cachedLoanStatusChart(),
      cachedMonthlyStudentsChart(),
      cachedLoanAmountChart(),
      cachedTopPartnersChart(),
      cachedRecentActivities(),
      cachedLatestStudents(),
      cachedLatestPartners(),
      cachedFollowups(),
      getGlobalCommissionTotals(),
    ]);

    return {
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
    };
  });
}
