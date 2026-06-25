import { connectDB } from "@/lib/db/mongoose";
import { Student } from "@/models/Student";
import { Partner } from "@/models/Partner";
import type { DateRangePreset } from "@/lib/utils/format";
import { getDateRange } from "@/lib/utils/format";
import { formatReportRows, type ReportSourceRow } from "@/lib/utils/report-format";
import { getPartnerCommissionPayouts, type PartnerCommissionSummary } from "@/lib/services/partner-commission.service";

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
            status: 1,
          },
        },
        { $sort: { totalLoanValue: -1 } },
      ]);

      const commissionMap = new Map<string, PartnerCommissionSummary>();
      if (partners.length > 0) {
        const payouts = await getPartnerCommissionPayouts(
          partners.map((partner) => String(partner._id))
        );
        payouts.forEach((summary, key) => commissionMap.set(key, summary));
      }

      const rows = partners.map((partner) => {
        const summary = commissionMap.get(String(partner._id));
        return {
          ...partner,
          commissionExpected: summary?.commissionExpected ?? 0,
          commissionReceived: summary?.commissionReceived ?? 0,
          pendingReceived: summary?.pendingReceived ?? 0,
          partnerShareExpected: summary?.partnerShareExpected ?? 0,
          commissionShared: summary?.commissionShared ?? 0,
          commissionEarned: summary?.commissionEarned ?? 0,
        };
      });

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
