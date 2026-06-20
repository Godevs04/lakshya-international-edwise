"use server";

import { getSessionUser } from "@/lib/auth/auth";
import { requireAnyPermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/constants/permissions";
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
import { runLogged } from "@/lib/action-utils";

const OVERVIEW_PERMISSIONS = [
  PERMISSIONS.STUDENTS_READ,
  PERMISSIONS.PARTNERS_READ,
  PERMISSIONS.APPLICATIONS_READ,
  PERMISSIONS.ANALYTICS_READ,
  PERMISSIONS.REPORTS_READ,
];

export async function getOverviewDashboardAction() {
  return runLogged("getOverviewDashboardAction", async () => {
    const user = await getSessionUser();
    requireAnyPermission(user, OVERVIEW_PERMISSIONS);

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

    return {
      metrics,
      loanStatus,
      monthlyStudents,
      loanAmount,
      topPartners,
      activities,
      latestStudents,
      latestPartners,
      followups,
    };
  });
}
