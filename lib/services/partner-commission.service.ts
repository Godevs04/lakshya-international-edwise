import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import { Partner } from "@/models/Partner";
import { Student } from "@/models/Student";

export interface PartnerCommissionSummary {
  totalDisbursed: number;
  disbursedStudentCount: number;
  commissionPercent: number;
  commissionEarned: number;
  commissionSettled: number;
  commissionPending: number;
}

export interface StudentCommissionRow {
  studentDbId: string;
  studentId: string;
  studentName: string;
  status: string;
  disbursed: number;
  commissionEarned: number;
  commissionSettled: number;
  commissionPending: number;
}

export interface PartnerCommissionOverviewRow {
  partnerId: string;
  companyName: string;
  owner?: string;
  commissionPercent: number;
  studentsCount: number;
  disbursedStudentCount: number;
  totalDisbursed: number;
  commissionEarned: number;
  commissionSettled: number;
  commissionPending: number;
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

export function calculatePendingCommission(
  commissionEarned: number,
  commissionSettled: number
): number {
  return Math.max(0, commissionEarned - Math.max(0, commissionSettled));
}

/** Split partner-level settlements across students proportionally by earned commission. */
export function allocateSettledToStudents(
  rows: Array<{ id: string; commissionEarned: number }>,
  totalSettled: number
): Map<string, { settled: number; pending: number }> {
  const result = new Map<string, { settled: number; pending: number }>();
  const settledCap = Math.max(0, totalSettled);
  const totalEarned = rows.reduce((sum, row) => sum + row.commissionEarned, 0);

  if (rows.length === 0) {
    return result;
  }

  if (totalEarned <= 0) {
    for (const row of rows) {
      result.set(row.id, { settled: 0, pending: 0 });
    }
    return result;
  }

  let allocated = 0;
  const sorted = [...rows].sort((a, b) => b.commissionEarned - a.commissionEarned);

  sorted.forEach((row, index) => {
    const isLast = index === sorted.length - 1;
    const settled = isLast
      ? Math.max(0, settledCap - allocated)
      : Math.round((row.commissionEarned / totalEarned) * settledCap);
    allocated += settled;
    result.set(row.id, {
      settled,
      pending: Math.max(0, row.commissionEarned - settled),
    });
  });

  return result;
}

export async function getPartnerStudentCommissions(
  partnerId: string,
  commissionPercent: number,
  commissionSettled = 0
): Promise<StudentCommissionRow[]> {
  await connectDB();

  const students = await Student.find({ partnerId: new Types.ObjectId(partnerId) })
    .select("studentId firstName lastName status loan.disbursed")
    .sort({ "loan.disbursed": -1, createdAt: -1 })
    .lean();

  const baseRows = students.map((student) => {
    const disbursed = student.loan?.disbursed ?? 0;
    const commissionEarned = calculateCommissionPayout(disbursed, commissionPercent);

    return {
      studentDbId: student._id.toString(),
      studentId: student.studentId,
      studentName: `${student.firstName} ${student.lastName}`.trim(),
      status: student.status,
      disbursed,
      commissionEarned,
    };
  });

  const allocation = allocateSettledToStudents(
    baseRows.map((row) => ({ id: row.studentDbId, commissionEarned: row.commissionEarned })),
    commissionSettled
  );

  return baseRows.map((row) => ({
    ...row,
    commissionSettled: allocation.get(row.studentDbId)?.settled ?? 0,
    commissionPending: allocation.get(row.studentDbId)?.pending ?? 0,
  }));
}

export async function getPartnersCommissionOverview(): Promise<PartnerCommissionOverviewRow[]> {
  await connectDB();

  const [partners, disbursementByPartner] = await Promise.all([
    Partner.find().select("companyName owner commissionPercent studentsCount performance.commissionSettled").lean(),
    Student.aggregate<{
      _id: Types.ObjectId;
      totalDisbursed: number;
      disbursedStudentCount: number;
      studentCount: number;
    }>([
      { $match: { partnerId: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: "$partnerId",
          totalDisbursed: { $sum: { $ifNull: ["$loan.disbursed", 0] } },
          disbursedStudentCount: {
            $sum: {
              $cond: [{ $gt: [{ $ifNull: ["$loan.disbursed", 0] }, 0] }, 1, 0],
            },
          },
          studentCount: { $sum: 1 },
        },
      },
    ]),
  ]);

  const disbursementMap = new Map(
    disbursementByPartner.map((row) => [row._id.toString(), row])
  );

  return partners
    .map((partner) => {
      const partnerId = partner._id.toString();
      const stats = disbursementMap.get(partnerId);
      const totalDisbursed = stats?.totalDisbursed ?? 0;
      const commissionPercent = partner.commissionPercent ?? 0;
      const commissionEarned = calculateCommissionPayout(totalDisbursed, commissionPercent);
      const commissionSettled = Math.max(0, partner.performance?.commissionSettled ?? 0);

      return {
        partnerId,
        companyName: partner.companyName,
        owner: partner.owner,
        commissionPercent,
        studentsCount: stats?.studentCount ?? partner.studentsCount ?? 0,
        disbursedStudentCount: stats?.disbursedStudentCount ?? 0,
        totalDisbursed,
        commissionEarned,
        commissionSettled,
        commissionPending: calculatePendingCommission(commissionEarned, commissionSettled),
      };
    })
    .sort((a, b) => b.commissionPending - a.commissionPending || b.commissionEarned - a.commissionEarned);
}

export async function getPartnerCommissionSummary(
  partnerId: string,
  commissionPercent: number,
  commissionSettled = 0
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
  const commissionEarned = calculateCommissionPayout(totalDisbursed, commissionPercent);
  const settled = Math.max(0, commissionSettled);

  return {
    totalDisbursed,
    disbursedStudentCount,
    commissionPercent,
    commissionEarned,
    commissionSettled: settled,
    commissionPending: calculatePendingCommission(commissionEarned, settled),
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
