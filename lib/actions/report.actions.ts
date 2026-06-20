"use server";

import { getReportData, exportToCSV, type ReportType } from "@/lib/services/report.service";
import type { DateRangePreset } from "@/lib/utils/format";
import { serializeRowsForClient } from "@/lib/utils/serialize";
import { getSessionUser } from "@/lib/auth/auth";
import { requirePermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { runLogged } from "@/lib/action-utils";

export async function getReportAction(
  preset: DateRangePreset,
  reportType: ReportType
) {
  return runLogged("getReportAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.REPORTS_READ);
    const data = await getReportData(preset, reportType);
    return serializeRowsForClient(data);
  });
}

export async function exportReportCSVAction(
  preset: DateRangePreset,
  reportType: ReportType
): Promise<string> {
  return runLogged("exportReportCSVAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.REPORTS_EXPORT);
    const data = await getReportAction(preset, reportType);
    return exportToCSV(data as Record<string, unknown>[]);
  });
}
