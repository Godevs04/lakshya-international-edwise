"use server";

import { getReportData, type ReportType } from "@/lib/services/report.service";
import type { DateRangePreset } from "@/lib/utils/format";
import { exportToCsv, exportToExcel, exportToPdf } from "@/lib/utils/report-export";
import { getAppConfig } from "@/lib/config/app-config";
import { APP_TAGLINE } from "@/lib/brand/app-logo";
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

async function buildReportExportOptions(
  preset: DateRangePreset,
  reportType: ReportType,
  generatedBy: string
) {
  const config = await getAppConfig();
  return {
    title: `${reportType.charAt(0).toUpperCase()}${reportType.slice(1)} Report`,
    subtitle: `${preset.charAt(0).toUpperCase()}${preset.slice(1)} period`,
    companyName: config.company.name,
    tagline: APP_TAGLINE,
    logoSrc: config.company.logo,
    generatedBy,
    generatedAt: new Date(),
  };
}

export async function exportReportCSVAction(
  preset: DateRangePreset,
  reportType: ReportType
): Promise<string> {
  return runLogged("exportReportCSVAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.REPORTS_EXPORT);
    const [data, options] = await Promise.all([
      getAuthorizedReportData(preset, reportType),
      buildReportExportOptions(
        preset,
        reportType,
        user?.name ?? user?.email ?? "System"
      ),
    ]);
    return exportToCsv(data, options);
  });
}

export async function exportReportExcelAction(
  preset: DateRangePreset,
  reportType: ReportType
): Promise<string> {
  return runLogged("exportReportExcelAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.REPORTS_EXPORT);
    const [data, options] = await Promise.all([
      getAuthorizedReportData(preset, reportType),
      buildReportExportOptions(
        preset,
        reportType,
        user?.name ?? user?.email ?? "System"
      ),
    ]);
    const buffer = exportToExcel(data, options);
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
    const [data, options] = await Promise.all([
      getAuthorizedReportData(preset, reportType),
      buildReportExportOptions(
        preset,
        reportType,
        user?.name ?? user?.email ?? "System"
      ),
    ]);
    const pdf = await exportToPdf(data, options);
    return Buffer.from(pdf).toString("base64");
  });
}
