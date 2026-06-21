import { connectDB } from "@/lib/db/mongoose";
import { Student } from "@/models/Student";
import { Partner } from "@/models/Partner";
import type { DateRangePreset } from "@/lib/utils/format";
import { getDateRange } from "@/lib/utils/format";
import { formatReportRows, type ReportSourceRow } from "@/lib/utils/report-format";

export type ReportType = "partner" | "student" | "loan";

export async function getReportData(
  preset: DateRangePreset,
  reportType: ReportType
): Promise<Record<string, string | number>[]> {
  await connectDB();
  const { start, end } = getDateRange(preset);
  const dateFilter = { createdAt: { $gte: start, $lte: end } };

  switch (reportType) {
    case "partner":
      return formatReportRows(
        reportType,
        await Partner.aggregate([
          { $match: dateFilter },
          {
            $project: {
              companyName: 1,
              studentsCount: 1,
              totalLoanValue: 1,
              commissionPercent: 1,
              status: 1,
              commissionEarned: "$performance.commissionEarned",
            },
          },
          { $sort: { totalLoanValue: -1 } },
        ])
      );

    case "student":
      return formatReportRows(
        reportType,
        (await Student.find(dateFilter)
          .populate("partnerId", "companyName")
          .sort({ createdAt: -1 })
          .lean()) as unknown as ReportSourceRow[]
      );

    case "loan":
      return formatReportRows(
        reportType,
        await Student.aggregate([
          { $match: dateFilter },
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
              totalRequested: { $sum: { $ifNull: ["$loan.requested", 0] } },
              totalSanctioned: { $sum: { $ifNull: ["$loan.sanctioned", 0] } },
              totalDisbursed: { $sum: { $ifNull: ["$loan.disbursed", 0] } },
            },
          },
          { $sort: { count: -1 } },
        ])
      );
  }
}

export function exportToCSV(data: Record<string, string | number>[]): string {
  if (data.length === 0) return "";
  const headers = Object.keys(data[0] ?? {});
  const rows = data.map((row) =>
    headers.map((h) => {
      const val = row[h];
      const str = val === null || val === undefined ? "" : String(val);
      return `"${str.replace(/"/g, '""')}"`;
    }).join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}
