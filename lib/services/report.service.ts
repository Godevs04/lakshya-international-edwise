import { connectDB } from "@/lib/db/mongoose";
import { Student } from "@/models/Student";
import { Partner } from "@/models/Partner";
import type { DateRangePreset } from "@/lib/utils/format";
import { getDateRange } from "@/lib/utils/format";

export type ReportType = "partner" | "student" | "loan";

export async function getReportData(
  preset: DateRangePreset,
  reportType: ReportType
) {
  await connectDB();
  const { start, end } = getDateRange(preset);
  const dateFilter = { createdAt: { $gte: start, $lte: end } };

  switch (reportType) {
    case "partner":
      return Partner.aggregate([
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
      ]);

    case "student":
      return Student.find(dateFilter)
        .populate("partnerId", "companyName")
        .sort({ createdAt: -1 })
        .lean();

    case "loan":
      return Student.aggregate([
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
      ]);
  }
}

export function exportToCSV(data: Record<string, unknown>[]): string {
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
