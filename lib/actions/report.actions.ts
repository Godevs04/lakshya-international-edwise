"use server";

import { getReportData, exportToCSV, type ReportType } from "@/lib/services/report.service";
import type { DateRangePreset } from "@/lib/utils/format";
import { exportToExcel, exportToPdf } from "@/lib/utils/report-export";
import { getSessionUser } from "@/lib/auth/auth";
import { requirePermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { runLogged } from "@/lib/action-utils";

async function getAuthorizedReportData(
  preset: DateRangePreset,
  reportType: ReportType
): Promise<Record<string, string | number>[]> {
  const user = await getSessionUser();
  requirePermission(user, PERMISSIONS.REPORTS_READ);
  return getReportData(preset, reportType);
}

export async function getReportAction(
  preset: DateRangePreset,
  reportType: ReportType
) {
  return runLogged("getReportAction", async () => {
    return getAuthorizedReportData(preset, reportType);
  });
}

export async function exportReportCSVAction(
  preset: DateRangePreset,
  reportType: ReportType
): Promise<string> {
  return runLogged("exportReportCSVAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.REPORTS_EXPORT);
    const data = await getAuthorizedReportData(preset, reportType);
    return exportToCSV(data);
  });
}

export async function exportReportExcelAction(
  preset: DateRangePreset,
  reportType: ReportType
): Promise<string> {
  return runLogged("exportReportExcelAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.REPORTS_EXPORT);
    const data = await getAuthorizedReportData(preset, reportType);
    const buffer = exportToExcel(data);
    return buffer.toString("base64");
  });
}

export async function exportReportPdfAction(
  preset: DateRangePreset,
  reportType: ReportType
): Promise<string> {
  return runLogged("exportReportPdfAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.REPORTS_EXPORT);
    const data = await getAuthorizedReportData(preset, reportType);
    const pdf = exportToPdf(data, `Report — ${reportType} (${preset})`);
    return Buffer.from(pdf).toString("base64");
  });
}
