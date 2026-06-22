import { connectDB } from "@/lib/db/mongoose";
import { Student } from "@/models/Student";
import { Partner } from "@/models/Partner";
import type { DateRangePreset } from "@/lib/utils/format";
import { getDateRange } from "@/lib/utils/format";
import { formatReportRows, type ReportSourceRow } from "@/lib/utils/report-format";
import { getPartnerCommissionPayouts } from "@/lib/services/partner-commission.service";

export type ReportType = "partner" | "student" | "loan";

export async function getReportData(
  preset: DateRangePreset,
  reportType: ReportType
): Promise<Record<string, string | number>[]> {
  await connectDB();
  const { start, end } = getDateRange(preset);
  const dateFilter = { createdAt: { $gte: start, $lte: end } };

  switch (reportType) {
    case "partner": {
      const partners = await Partner.aggregate([
        { $match: dateFilter },
        {
          $project: {
            _id: 1,
            companyName: 1,
            studentsCount: 1,
            totalLoanValue: 1,
            commissionPercent: 1,
            commissionSettled: "$performance.commissionSettled",
            status: 1,
          },
        },
        { $sort: { totalLoanValue: -1 } },
      ]);

      const commissionMap = new Map<string, number>();
      if (partners.length > 0) {
        const percentByPartner = new Map(
          partners.map((partner) => [
            String(partner._id),
            Number(partner.commissionPercent ?? 0),
          ])
        );
        const payouts = await getPartnerCommissionPayouts(
          partners.map((partner) => String(partner._id)),
          percentByPartner
        );
        payouts.forEach((value, key) => commissionMap.set(key, value));
      }

      const rows = partners.map((partner) => ({
        ...partner,
        commissionEarned: commissionMap.get(String(partner._id)) ?? 0,
        commissionSettled: Number(partner.commissionSettled ?? 0),
      }));

      return formatReportRows(reportType, rows);
    }

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
