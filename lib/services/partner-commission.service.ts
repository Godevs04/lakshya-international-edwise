import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import { Partner } from "@/models/Partner";
import { Student } from "@/models/Student";
import { roundMoney } from "@/lib/utils/format";

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
  disbursedAt?: Date | string | null;
  commissionPercent: number;
  commissionPercentOverride?: number | null;
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

export interface CommissionLedgerEntry {
  id: string;
  type: "earned" | "settlement";
  date: Date;
  month: string;
  studentDbId?: string;
  studentId?: string;
  studentName?: string;
  amount: number;
  note?: string;
  settledByName?: string;
}

export interface PartnerCommissionLedger {
  entries: CommissionLedgerEntry[];
  earnedInMonth: number;
  settledInMonth: number;
  commissionEarnedTotal: number;
  commissionSettledTotal: number;
  commissionPendingTotal: number;
}

export function resolveCommissionPercent(
  partnerPercent: number,
  studentOverride?: number | null
): number {
  if (studentOverride != null && !Number.isNaN(studentOverride)) {
    return studentOverride;
  }
  return partnerPercent;
}

export function calculateCommissionPayout(
  totalDisbursed: number,
  commissionPercent: number
): number {
  if (totalDisbursed <= 0 || commissionPercent <= 0) {
    return 0;
  }
  return roundMoney((totalDisbursed * commissionPercent) / 100);
}

export function calculatePendingCommission(
  commissionEarned: number,
  commissionSettled: number
): number {
  return Math.max(0, commissionEarned - Math.max(0, commissionSettled));
}

export function formatCommissionMonth(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/** Legacy proportional split when partner-level settlements predate per-student tracking. */
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
      : roundMoney((row.commissionEarned / totalEarned) * settledCap);
    allocated += settled;
    result.set(row.id, {
      settled,
      pending: Math.max(0, row.commissionEarned - settled),
    });
  });

  return result;
}

function buildStudentCommissionBaseRows(
  students: Array<{
    _id: Types.ObjectId;
    studentId: string;
    firstName: string;
    lastName: string;
    status: string;
    loan?: { disbursed?: number; disbursedAt?: Date };
    commissionPercentOverride?: number;
    commissionSettled?: number;
  }>,
  partnerPercent: number
) {
  return students.map((student) => {
    const disbursed = student.loan?.disbursed ?? 0;
    const effectivePercent = resolveCommissionPercent(
      partnerPercent,
      student.commissionPercentOverride
    );
    const commissionEarned = calculateCommissionPayout(disbursed, effectivePercent);

    return {
      studentDbId: student._id.toString(),
      studentId: student.studentId,
      studentName: `${student.firstName} ${student.lastName}`.trim(),
      status: student.status,
      disbursed,
      disbursedAt: student.loan?.disbursedAt ?? null,
      commissionPercent: effectivePercent,
      commissionPercentOverride: student.commissionPercentOverride ?? null,
      commissionEarned,
      commissionSettledStored: Math.max(0, student.commissionSettled ?? 0),
    };
  });
}

function applyStudentSettlements(
  baseRows: ReturnType<typeof buildStudentCommissionBaseRows>,
  partnerSettledFallback: number
): StudentCommissionRow[] {
  const studentSettledTotal = baseRows.reduce(
    (sum, row) => sum + row.commissionSettledStored,
    0
  );
  const useLegacyAllocation =
    studentSettledTotal <= 0 && partnerSettledFallback > 0;

  const legacyAllocation = useLegacyAllocation
    ? allocateSettledToStudents(
        baseRows.map((row) => ({ id: row.studentDbId, commissionEarned: row.commissionEarned })),
        partnerSettledFallback
      )
    : null;

  return baseRows.map((row) => {
    const commissionSettled = useLegacyAllocation
      ? legacyAllocation?.get(row.studentDbId)?.settled ?? 0
      : row.commissionSettledStored;

    return {
      studentDbId: row.studentDbId,
      studentId: row.studentId,
      studentName: row.studentName,
      status: row.status,
      disbursed: row.disbursed,
      disbursedAt: row.disbursedAt,
      commissionPercent: row.commissionPercent,
      commissionPercentOverride: row.commissionPercentOverride,
      commissionEarned: row.commissionEarned,
      commissionSettled,
      commissionPending: calculatePendingCommission(row.commissionEarned, commissionSettled),
    };
  });
}

export async function getPartnerStudentCommissions(
  partnerId: string,
  partnerPercent?: number,
  partnerSettledFallback = 0
): Promise<StudentCommissionRow[]> {
  await connectDB();

  let defaultPercent = partnerPercent;
  let legacySettled = partnerSettledFallback;

  if (defaultPercent == null) {
    const partner = await Partner.findById(partnerId)
      .select("commissionPercent performance.commissionSettled")
      .lean();
    defaultPercent = partner?.commissionPercent ?? 0;
    legacySettled = partner?.performance?.commissionSettled ?? 0;
  }

  const students = await Student.find({ partnerId: new Types.ObjectId(partnerId) })
    .select(
      "studentId firstName lastName status loan.disbursed loan.disbursedAt commissionPercentOverride commissionSettled"
    )
    .sort({ "loan.disbursed": -1, createdAt: -1 })
    .lean();

  const baseRows = buildStudentCommissionBaseRows(students, defaultPercent ?? 0);
  return applyStudentSettlements(baseRows, legacySettled);
}

export async function getPartnerCommissionSummary(
  partnerId: string,
  partnerPercent?: number,
  partnerSettledFallback?: number
): Promise<PartnerCommissionSummary> {
  await connectDB();

  let defaultPercent = partnerPercent;
  let legacySettled = partnerSettledFallback;

  if (defaultPercent == null || legacySettled == null) {
    const partner = await Partner.findById(partnerId)
      .select("commissionPercent performance.commissionSettled")
      .lean();
    defaultPercent ??= partner?.commissionPercent ?? 0;
    legacySettled ??= partner?.performance?.commissionSettled ?? 0;
  }

  const rows = await getPartnerStudentCommissions(
    partnerId,
    defaultPercent,
    legacySettled ?? 0
  );

  const totalDisbursed = rows.reduce((sum, row) => sum + row.disbursed, 0);
  const disbursedStudentCount = rows.filter((row) => row.disbursed > 0).length;
  const commissionEarned = rows.reduce((sum, row) => sum + row.commissionEarned, 0);
  const commissionSettled = rows.reduce((sum, row) => sum + row.commissionSettled, 0);

  return {
    totalDisbursed,
    disbursedStudentCount,
    commissionPercent: defaultPercent ?? 0,
    commissionEarned,
    commissionSettled,
    commissionPending: calculatePendingCommission(commissionEarned, commissionSettled),
  };
}

export async function getPartnersCommissionOverview(): Promise<PartnerCommissionOverviewRow[]> {
  await connectDB();

  const partners = await Partner.find()
    .select("companyName owner commissionPercent studentsCount performance.commissionSettled")
    .lean();

  const summaries = await Promise.all(
    partners.map(async (partner) => {
      const partnerId = partner._id.toString();
      const summary = await getPartnerCommissionSummary(
        partnerId,
        partner.commissionPercent ?? 0,
        partner.performance?.commissionSettled ?? 0
      );

      const studentCount = await Student.countDocuments({
        partnerId: partner._id,
      });

      return {
        partnerId,
        companyName: partner.companyName,
        owner: partner.owner,
        commissionPercent: partner.commissionPercent ?? 0,
        studentsCount: studentCount || partner.studentsCount || 0,
        disbursedStudentCount: summary.disbursedStudentCount,
        totalDisbursed: summary.totalDisbursed,
        commissionEarned: summary.commissionEarned,
        commissionSettled: summary.commissionSettled,
        commissionPending: summary.commissionPending,
      };
    })
  );

  return summaries.sort(
    (a, b) => b.commissionPending - a.commissionPending || b.commissionEarned - a.commissionEarned
  );
}

export async function getPartnerCommissionLedger(
  partnerId: string,
  month?: string
): Promise<PartnerCommissionLedger> {
  await connectDB();

  const [partner, studentRows] = await Promise.all([
    Partner.findById(partnerId).select("companyName commissionSettlements").lean(),
    getPartnerStudentCommissions(partnerId),
  ]);

  if (!partner) {
    return {
      entries: [],
      earnedInMonth: 0,
      settledInMonth: 0,
      commissionEarnedTotal: 0,
      commissionSettledTotal: 0,
      commissionPendingTotal: 0,
    };
  }

  const students = await Student.find({ partnerId: new Types.ObjectId(partnerId) })
    .select("studentId firstName lastName commissionSettlements loan.disbursedAt")
    .lean();

  const earnedEntries: CommissionLedgerEntry[] = studentRows
    .filter((row) => row.commissionEarned > 0)
    .map((row) => {
      const earnedDate = row.disbursedAt ? new Date(row.disbursedAt) : new Date();
      return {
        id: `earned-${row.studentDbId}`,
        type: "earned" as const,
        date: earnedDate,
        month: formatCommissionMonth(earnedDate),
        studentDbId: row.studentDbId,
        studentId: row.studentId,
        studentName: row.studentName,
        amount: row.commissionEarned,
        note: `${row.commissionPercent}% on ${row.disbursed.toLocaleString("en-IN")} disbursed`,
      };
    });

  const settlementEntries: CommissionLedgerEntry[] = [];

  for (const student of students) {
    for (const entry of student.commissionSettlements ?? []) {
      const settledAt = entry.settledAt ? new Date(entry.settledAt) : new Date();
      settlementEntries.push({
        id: `student-settlement-${student._id}-${settledAt.getTime()}`,
        type: "settlement",
        date: settledAt,
        month: formatCommissionMonth(settledAt),
        studentDbId: student._id.toString(),
        studentId: student.studentId,
        studentName: `${student.firstName} ${student.lastName}`.trim(),
        amount: entry.amount,
        note: entry.note,
        settledByName: entry.settledByName,
      });
    }
  }

  for (const entry of partner.commissionSettlements ?? []) {
    if (entry.studentId) continue;
    const settledAt = entry.settledAt ? new Date(entry.settledAt) : new Date();
    settlementEntries.push({
      id: `partner-settlement-${settledAt.getTime()}-${entry.amount}`,
      type: "settlement",
      date: settledAt,
      month: formatCommissionMonth(settledAt),
      amount: entry.amount,
      note: entry.note ?? "Partner-level settlement",
      settledByName: entry.settledByName,
    });
  }

  const allEntries = [...earnedEntries, ...settlementEntries].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

  const filtered = month
    ? allEntries.filter((entry) => entry.month === month)
    : allEntries;

  const summary = await getPartnerCommissionSummary(partnerId);

  return {
    entries: filtered,
    earnedInMonth: filtered
      .filter((entry) => entry.type === "earned")
      .reduce((sum, entry) => sum + entry.amount, 0),
    settledInMonth: filtered
      .filter((entry) => entry.type === "settlement")
      .reduce((sum, entry) => sum + entry.amount, 0),
    commissionEarnedTotal: summary.commissionEarned,
    commissionSettledTotal: summary.commissionSettled,
    commissionPendingTotal: summary.commissionPending,
  };
}

export function buildCommissionStatementRows(
  partnerName: string,
  partnerPercent: number,
  rows: StudentCommissionRow[],
  ledger?: PartnerCommissionLedger,
  month?: string
): Record<string, string | number>[] {
  const exportRows = rows.map((row) => ({
    Partner: partnerName,
    Month: month ?? "All",
    "Student ID": row.studentId,
    "Student Name": row.studentName,
    Status: row.status.replace(/_/g, " "),
    Disbursed: row.disbursed,
    "Commission %": row.commissionPercentOverride ?? partnerPercent,
    "Rate Type": row.commissionPercentOverride != null ? "Custom" : "Default",
    "Commission Earned": row.commissionEarned,
    "Commission Settled": row.commissionSettled,
    "Commission Pending": row.commissionPending,
  }));

  if (ledger) {
    exportRows.push(
      {
        Partner: partnerName,
        Month: month ?? "All",
        "Student ID": "",
        "Student Name": "TOTALS",
        Status: "",
        Disbursed: 0,
        "Commission %": 0,
        "Rate Type": "",
        "Commission Earned": ledger.commissionEarnedTotal,
        "Commission Settled": ledger.commissionSettledTotal,
        "Commission Pending": ledger.commissionPendingTotal,
      },
      {
        Partner: partnerName,
        Month: month ?? "All",
        "Student ID": "",
        "Student Name": month ? `Earned in ${month}` : "Earned (filtered)",
        Status: "",
        Disbursed: 0,
        "Commission %": 0,
        "Rate Type": "",
        "Commission Earned": ledger.earnedInMonth,
        "Commission Settled": 0,
        "Commission Pending": 0,
      },
      {
        Partner: partnerName,
        Month: month ?? "All",
        "Student ID": "",
        "Student Name": month ? `Settled in ${month}` : "Settled (filtered)",
        Status: "",
        Disbursed: 0,
        "Commission %": 0,
        "Rate Type": "",
        "Commission Earned": 0,
        "Commission Settled": ledger.settledInMonth,
        "Commission Pending": 0,
      }
    );
  }

  return exportRows;
}

export async function getPartnerCommissionPayouts(
  partnerIds: string[],
  commissionByPartnerId: Map<string, number>
): Promise<Map<string, number>> {
  if (partnerIds.length === 0) {
    return new Map();
  }

  await connectDB();

  const payouts = new Map<string, number>();

  await Promise.all(
    partnerIds.map(async (partnerId) => {
      const summary = await getPartnerCommissionSummary(
        partnerId,
        commissionByPartnerId.get(partnerId) ?? 0
      );
      payouts.set(partnerId, summary.commissionEarned);
    })
  );

  return payouts;
}

export async function syncPartnerCommissionSettled(partnerId: string): Promise<number> {
  const rows = await getPartnerStudentCommissions(partnerId);
  const total = rows.reduce((sum, row) => sum + row.commissionSettled, 0);

  await Partner.findByIdAndUpdate(partnerId, {
    $set: { "performance.commissionSettled": total },
  });

  return total;
}
