import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import { Student } from "@/models/Student";

export interface PartnerCommissionSummary {
  totalDisbursed: number;
  disbursedStudentCount: number;
  commissionPercent: number;
  commissionPayout: number;
}

export function calculateCommissionPayout(
  totalDisbursed: number,
  commissionPercent: number
): number {
  if (totalDisbursed <= 0 || commissionPercent <= 0) {
    return 0;
  }
  return Math.round((totalDisbursed * commissionPercent) / 100);
}

export async function getPartnerCommissionSummary(
  partnerId: string,
  commissionPercent: number
): Promise<PartnerCommissionSummary> {
  await connectDB();

  const partnerObjectId = new Types.ObjectId(partnerId);
  const [aggregate] = await Student.aggregate<{
    totalDisbursed: number;
    disbursedStudentCount: number;
  }>([
    { $match: { partnerId: partnerObjectId } },
    {
      $group: {
        _id: null,
        totalDisbursed: { $sum: { $ifNull: ["$loan.disbursed", 0] } },
        disbursedStudentCount: {
          $sum: {
            $cond: [{ $gt: [{ $ifNull: ["$loan.disbursed", 0] }, 0] }, 1, 0],
          },
        },
      },
    },
  ]);

  const totalDisbursed = aggregate?.totalDisbursed ?? 0;
  const disbursedStudentCount = aggregate?.disbursedStudentCount ?? 0;

  return {
    totalDisbursed,
    disbursedStudentCount,
    commissionPercent,
    commissionPayout: calculateCommissionPayout(totalDisbursed, commissionPercent),
  };
}

export async function getPartnerCommissionPayouts(
  partnerIds: string[],
  commissionByPartnerId: Map<string, number>
): Promise<Map<string, number>> {
  if (partnerIds.length === 0) {
    return new Map();
  }

  await connectDB();

  const objectIds = partnerIds.map((id) => new Types.ObjectId(id));
  const rows = await Student.aggregate<{ _id: Types.ObjectId; totalDisbursed: number }>([
    { $match: { partnerId: { $in: objectIds } } },
    {
      $group: {
        _id: "$partnerId",
        totalDisbursed: { $sum: { $ifNull: ["$loan.disbursed", 0] } },
      },
    },
  ]);

  const payouts = new Map<string, number>();
  for (const row of rows) {
    const partnerId = row._id.toString();
    const percent = commissionByPartnerId.get(partnerId) ?? 0;
    payouts.set(partnerId, calculateCommissionPayout(row.totalDisbursed, percent));
  }

  return payouts;
}
