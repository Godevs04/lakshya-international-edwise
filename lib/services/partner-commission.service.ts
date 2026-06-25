import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import { Partner } from "@/models/Partner";
import { Student } from "@/models/Student";
import { roundMoney } from "@/lib/utils/format";
import type { CommissionStatusFilter } from "@/lib/constants/commission-status";
import {
  filterCommissionRows,
  matchesCommissionStatusFilter,
} from "@/lib/utils/commission-status-filter";
import {
  resolvePartnerSharePercent,
  calculateExpectedCommission,
  calculatePartnerShareExpected,
  calculatePendingReceived,
  calculatePendingShared,
  calculateNetEarned,
  calculateProjectedNetEarned,
} from "@/lib/utils/commission-calculations";

export {
  resolvePartnerSharePercent,
  calculateExpectedCommission,
  calculatePartnerShareExpected,
  calculatePendingReceived,
  calculatePendingShared,
  calculateNetEarned,
  calculateProjectedNetEarned,
};

/** @deprecated use resolvePartnerSharePercent */
export const resolveCommissionPercent = resolvePartnerSharePercent;

/** @deprecated use calculateExpectedCommission */
export function calculateCommissionPayout(
  totalDisbursed: number,
  commissionPercent: number
): number {
  return calculateExpectedCommission(totalDisbursed, commissionPercent);
}

/** @deprecated use calculatePendingShared */
export function calculatePendingCommission(
  commissionEarned: number,
  commissionSettled: number
): number {
  return calculatePendingShared(commissionEarned, commissionSettled);
}

export interface PartnerCommissionSummary {
  totalDisbursed: number;
  disbursedStudentCount: number;
  partnerSharePercent: number;
  commissionExpected: number;
  commissionReceived: number;
  pendingReceived: number;
  partnerShareExpected: number;
  commissionShared: number;
  pendingShared: number;
  projectedNetEarned: number;
  commissionEarned: number;
  /** @deprecated use partnerSharePercent */
  commissionPercent: number;
  /** @deprecated use commissionShared */
  commissionSettled: number;
  /** @deprecated use pendingShared */
  commissionPending: number;
}

export interface StudentCommissionRow {
  studentDbId: string;
  studentId: string;
  studentName: string;
  status: string;
  disbursed: number;
  disbursedAt?: Date | string | null;
  ourCommissionPercent: number;
  partnerSharePercent: number;
  partnerSharePercentOverride?: number | null;
  commissionExpected: number;
  commissionReceived: number;
  pendingReceived: number;
  partnerShareExpected: number;
  commissionShared: number;
  pendingShared: number;
  projectedNetEarned: number;
  commissionEarned: number;
  /** @deprecated use partnerSharePercent */
  commissionPercent: number;
  /** @deprecated use partnerSharePercentOverride */
  commissionPercentOverride?: number | null;
  /** @deprecated use commissionExpected */
  commissionEarnedGross?: number;
  /** @deprecated use commissionShared */
  commissionSettled: number;
  /** @deprecated use pendingShared */
  commissionPending: number;
}

export interface PartnerCommissionOverviewRow {
  partnerId: string;
  companyName: string;
  owner?: string;
  partnerSharePercent: number;
  studentsCount: number;
  disbursedStudentCount: number;
  totalDisbursed: number;
  commissionExpected: number;
  commissionReceived: number;
  pendingReceived: number;
  partnerShareExpected: number;
  commissionShared: number;
  pendingShared: number;
  projectedNetEarned: number;
  commissionEarned: number;
  /** @deprecated */
  commissionPercent: number;
  /** @deprecated */
  commissionEarnedGross?: number;
  /** @deprecated */
  commissionSettled: number;
  /** @deprecated */
  commissionPending: number;
}

export interface CommissionLedgerEntry {
  id: string;
  type: "expected" | "received" | "shared" | "earned" | "settlement";
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
  expectedInMonth: number;
  receivedInMonth: number;
  sharedInMonth: number;
  earnedInMonth: number;
  settledInMonth: number;
  commissionExpectedTotal: number;
  commissionReceivedTotal: number;
  pendingReceivedTotal: number;
  partnerShareExpectedTotal: number;
  commissionSharedTotal: number;
  pendingSharedTotal: number;
  commissionEarnedTotal: number;
  /** @deprecated */
  commissionSettledTotal: number;
  /** @deprecated */
  commissionPendingTotal: number;
}

export { matchesCommissionStatusFilter, filterCommissionRows as filterStudentCommissionRows };

export function formatCommissionMonth(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/** Legacy proportional split when partner-level settlements predate per-student tracking. */
export function allocateSettledToStudents(
  rows: Array<{ id: string; partnerShareExpected: number }>,
  totalSettled: number
): Map<string, { settled: number; pending: number }> {
  const result = new Map<string, { settled: number; pending: number }>();
  const settledCap = Math.max(0, totalSettled);
  const totalExpected = rows.reduce((sum, row) => sum + row.partnerShareExpected, 0);

  if (rows.length === 0) {
    return result;
  }

  if (totalExpected <= 0) {
    for (const row of rows) {
      result.set(row.id, { settled: 0, pending: 0 });
    }
    return result;
  }

  let allocated = 0;
  const sorted = [...rows].sort((a, b) => b.partnerShareExpected - a.partnerShareExpected);

  sorted.forEach((row, index) => {
    const isLast = index === sorted.length - 1;
    const settled = isLast
      ? Math.max(0, settledCap - allocated)
      : roundMoney((row.partnerShareExpected / totalExpected) * settledCap);
    allocated += settled;
    result.set(row.id, {
      settled,
      pending: Math.max(0, row.partnerShareExpected - settled),
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
    ourCommissionPercent?: number;
    commissionPercentOverride?: number;
    commissionReceived?: number;
    commissionSettled?: number;
  }>,
  partnerSharePercent: number
) {
  return students.map((student) => {
    const disbursed = student.loan?.disbursed ?? 0;
    const ourCommissionPercent = student.ourCommissionPercent ?? 0;
    const effectivePartnerShare = resolvePartnerSharePercent(
      partnerSharePercent,
      student.commissionPercentOverride
    );
    const commissionExpected = calculateExpectedCommission(disbursed, ourCommissionPercent);
    const partnerShareExpected = calculatePartnerShareExpected(
      disbursed,
      effectivePartnerShare
    );
    const commissionReceived = Math.max(0, student.commissionReceived ?? 0);

    return {
      studentDbId: student._id.toString(),
      studentId: student.studentId,
      studentName: `${student.firstName} ${student.lastName}`.trim(),
      status: student.status,
      disbursed,
      disbursedAt: student.loan?.disbursedAt ?? null,
      ourCommissionPercent,
      partnerSharePercent: effectivePartnerShare,
      partnerSharePercentOverride: student.commissionPercentOverride ?? null,
      commissionExpected,
      commissionReceived,
      pendingReceived: calculatePendingReceived(commissionExpected, commissionReceived),
      partnerShareExpected,
      commissionSharedStored: Math.max(0, student.commissionSettled ?? 0),
    };
  });
}

function applyStudentSettlements(
  baseRows: ReturnType<typeof buildStudentCommissionBaseRows>,
  partnerSettledFallback: number
): StudentCommissionRow[] {
  const studentSettledTotal = baseRows.reduce(
    (sum, row) => sum + row.commissionSharedStored,
    0
  );
  const useLegacyAllocation =
    studentSettledTotal <= 0 && partnerSettledFallback > 0;

  const legacyAllocation = useLegacyAllocation
    ? allocateSettledToStudents(
        baseRows.map((row) => ({
          id: row.studentDbId,
          partnerShareExpected: row.partnerShareExpected,
        })),
        partnerSettledFallback
      )
    : null;

  return baseRows.map((row) => {
    const commissionShared = useLegacyAllocation
      ? legacyAllocation?.get(row.studentDbId)?.settled ?? 0
      : row.commissionSharedStored;
    const pendingShared = calculatePendingShared(row.partnerShareExpected, commissionShared);
    const projectedNetEarned = calculateProjectedNetEarned(
      row.commissionExpected,
      row.partnerShareExpected
    );
    const commissionEarned = calculateNetEarned(row.commissionReceived, commissionShared);

    return {
      studentDbId: row.studentDbId,
      studentId: row.studentId,
      studentName: row.studentName,
      status: row.status,
      disbursed: row.disbursed,
      disbursedAt: row.disbursedAt,
      ourCommissionPercent: row.ourCommissionPercent,
      partnerSharePercent: row.partnerSharePercent,
      partnerSharePercentOverride: row.partnerSharePercentOverride,
      commissionExpected: row.commissionExpected,
      commissionReceived: row.commissionReceived,
      pendingReceived: row.pendingReceived,
      partnerShareExpected: row.partnerShareExpected,
      commissionShared,
      pendingShared,
      projectedNetEarned,
      commissionEarned,
      commissionPercent: row.partnerSharePercent,
      commissionPercentOverride: row.partnerSharePercentOverride,
      commissionEarnedGross: row.commissionExpected,
      commissionSettled: commissionShared,
      commissionPending: pendingShared,
    };
  });
}

function summarizeRows(
  rows: StudentCommissionRow[],
  partnerSharePercent: number
): PartnerCommissionSummary {
  const totalDisbursed = rows.reduce((sum, row) => sum + row.disbursed, 0);
  const disbursedStudentCount = rows.filter((row) => row.disbursed > 0).length;
  const commissionExpected = rows.reduce((sum, row) => sum + row.commissionExpected, 0);
  const commissionReceived = rows.reduce((sum, row) => sum + row.commissionReceived, 0);
  const pendingReceived = rows.reduce((sum, row) => sum + row.pendingReceived, 0);
  const partnerShareExpected = rows.reduce((sum, row) => sum + row.partnerShareExpected, 0);
  const commissionShared = rows.reduce((sum, row) => sum + row.commissionShared, 0);
  const pendingShared = rows.reduce((sum, row) => sum + row.pendingShared, 0);
  const projectedNetEarned = rows.reduce((sum, row) => sum + row.projectedNetEarned, 0);
  const commissionEarned = rows.reduce((sum, row) => sum + row.commissionEarned, 0);

  return {
    totalDisbursed,
    disbursedStudentCount,
    partnerSharePercent,
    commissionExpected,
    commissionReceived,
    pendingReceived,
    partnerShareExpected,
    commissionShared,
    pendingShared,
    projectedNetEarned,
    commissionEarned,
    commissionPercent: partnerSharePercent,
    commissionSettled: commissionShared,
    commissionPending: pendingShared,
  };
}

export async function getPartnerStudentCommissions(
  partnerId: string,
  partnerSharePercent?: number,
  partnerSettledFallback = 0
): Promise<StudentCommissionRow[]> {
  await connectDB();

  let defaultPercent = partnerSharePercent;
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
      "studentId firstName lastName status loan.disbursed loan.disbursedAt ourCommissionPercent commissionPercentOverride commissionReceived commissionSettled"
    )
    .sort({ "loan.disbursed": -1, createdAt: -1 })
    .lean();

  const baseRows = buildStudentCommissionBaseRows(students, defaultPercent ?? 0);
  return applyStudentSettlements(baseRows, legacySettled);
}

export async function getPartnerCommissionSummary(
  partnerId: string,
  partnerSharePercent?: number,
  partnerSettledFallback?: number
): Promise<PartnerCommissionSummary> {
  await connectDB();

  let defaultPercent = partnerSharePercent;
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

  return summarizeRows(rows, defaultPercent ?? 0);
}

export async function getPartnersCommissionOverview(
  statusFilter?: CommissionStatusFilter
): Promise<PartnerCommissionOverviewRow[]> {
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
        partnerSharePercent: partner.commissionPercent ?? 0,
        studentsCount: studentCount || partner.studentsCount || 0,
        disbursedStudentCount: summary.disbursedStudentCount,
        totalDisbursed: summary.totalDisbursed,
        commissionExpected: summary.commissionExpected,
        commissionReceived: summary.commissionReceived,
        pendingReceived: summary.pendingReceived,
        partnerShareExpected: summary.partnerShareExpected,
        commissionShared: summary.commissionShared,
        pendingShared: summary.pendingShared,
        projectedNetEarned: summary.projectedNetEarned,
        commissionEarned: summary.commissionEarned,
        commissionPercent: partner.commissionPercent ?? 0,
        commissionEarnedGross: summary.commissionExpected,
        commissionSettled: summary.commissionShared,
        commissionPending: summary.pendingShared,
      };
    })
  );

  const filtered =
    statusFilter && statusFilter !== "all"
      ? summaries.filter((row) => matchesCommissionStatusFilter(row, statusFilter))
      : summaries;

  return filtered.sort(
    (a, b) =>
      b.pendingShared - a.pendingShared ||
      b.pendingReceived - a.pendingReceived ||
      b.commissionEarned - a.commissionEarned
  );
}

export async function getGlobalCommissionTotals(): Promise<PartnerCommissionSummary> {
  const overview = await getPartnersCommissionOverview();
  const rows: StudentCommissionRow[] = overview.flatMap(() => []);
  void rows;

  return {
    totalDisbursed: overview.reduce((sum, row) => sum + row.totalDisbursed, 0),
    disbursedStudentCount: overview.reduce((sum, row) => sum + row.disbursedStudentCount, 0),
    partnerSharePercent: 0,
    commissionExpected: overview.reduce((sum, row) => sum + row.commissionExpected, 0),
    commissionReceived: overview.reduce((sum, row) => sum + row.commissionReceived, 0),
    pendingReceived: overview.reduce((sum, row) => sum + row.pendingReceived, 0),
    partnerShareExpected: overview.reduce((sum, row) => sum + row.partnerShareExpected, 0),
    commissionShared: overview.reduce((sum, row) => sum + row.commissionShared, 0),
    pendingShared: overview.reduce((sum, row) => sum + row.pendingShared, 0),
    projectedNetEarned: overview.reduce((sum, row) => sum + row.projectedNetEarned, 0),
    commissionEarned: overview.reduce((sum, row) => sum + row.commissionEarned, 0),
    commissionPercent: 0,
    commissionSettled: overview.reduce((sum, row) => sum + row.commissionShared, 0),
    commissionPending: overview.reduce((sum, row) => sum + row.pendingShared, 0),
  };
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
      expectedInMonth: 0,
      receivedInMonth: 0,
      sharedInMonth: 0,
      earnedInMonth: 0,
      settledInMonth: 0,
      commissionExpectedTotal: 0,
      commissionReceivedTotal: 0,
      pendingReceivedTotal: 0,
      partnerShareExpectedTotal: 0,
      commissionSharedTotal: 0,
      pendingSharedTotal: 0,
      commissionEarnedTotal: 0,
      commissionSettledTotal: 0,
      commissionPendingTotal: 0,
    };
  }

  const students = await Student.find({ partnerId: new Types.ObjectId(partnerId) })
    .select(
      "studentId firstName lastName commissionSettlements commissionReceipts loan.disbursedAt"
    )
    .lean();

  const expectedEntries: CommissionLedgerEntry[] = studentRows
    .filter((row) => row.commissionExpected > 0)
    .map((row) => {
      const earnedDate = row.disbursedAt ? new Date(row.disbursedAt) : new Date();
      return {
        id: `expected-${row.studentDbId}`,
        type: "expected" as const,
        date: earnedDate,
        month: formatCommissionMonth(earnedDate),
        studentDbId: row.studentDbId,
        studentId: row.studentId,
        studentName: row.studentName,
        amount: row.commissionExpected,
        note: `${row.ourCommissionPercent}% on ${row.disbursed.toLocaleString("en-IN")} disbursed`,
      };
    });

  const receivedEntries: CommissionLedgerEntry[] = [];
  for (const student of students) {
    for (const entry of student.commissionReceipts ?? []) {
      const receivedAt = entry.receivedAt ? new Date(entry.receivedAt) : new Date();
      receivedEntries.push({
        id: `received-${student._id}-${receivedAt.getTime()}`,
        type: "received",
        date: receivedAt,
        month: formatCommissionMonth(receivedAt),
        studentDbId: student._id.toString(),
        studentId: student.studentId,
        studentName: `${student.firstName} ${student.lastName}`.trim(),
        amount: entry.amount,
        note: entry.note,
        settledByName: entry.recordedByName,
      });
    }
  }

  const sharedEntries: CommissionLedgerEntry[] = [];

  for (const student of students) {
    for (const entry of student.commissionSettlements ?? []) {
      const settledAt = entry.settledAt ? new Date(entry.settledAt) : new Date();
      sharedEntries.push({
        id: `shared-${student._id}-${settledAt.getTime()}`,
        type: "shared",
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
    sharedEntries.push({
      id: `partner-shared-${settledAt.getTime()}-${entry.amount}`,
      type: "shared",
      date: settledAt,
      month: formatCommissionMonth(settledAt),
      amount: entry.amount,
      note: entry.note ?? "Partner-level settlement",
      settledByName: entry.settledByName,
    });
  }

  const allEntries = [...expectedEntries, ...receivedEntries, ...sharedEntries].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

  const filtered = month
    ? allEntries.filter((entry) => entry.month === month)
    : allEntries;

  const summary = await getPartnerCommissionSummary(partnerId);

  return {
    entries: filtered,
    expectedInMonth: filtered
      .filter((entry) => entry.type === "expected")
      .reduce((sum, entry) => sum + entry.amount, 0),
    receivedInMonth: filtered
      .filter((entry) => entry.type === "received")
      .reduce((sum, entry) => sum + entry.amount, 0),
    sharedInMonth: filtered
      .filter((entry) => entry.type === "shared")
      .reduce((sum, entry) => sum + entry.amount, 0),
    earnedInMonth: filtered
      .filter((entry) => entry.type === "expected")
      .reduce((sum, entry) => sum + entry.amount, 0),
    settledInMonth: filtered
      .filter((entry) => entry.type === "shared")
      .reduce((sum, entry) => sum + entry.amount, 0),
    commissionExpectedTotal: summary.commissionExpected,
    commissionReceivedTotal: summary.commissionReceived,
    pendingReceivedTotal: summary.pendingReceived,
    partnerShareExpectedTotal: summary.partnerShareExpected,
    commissionSharedTotal: summary.commissionShared,
    pendingSharedTotal: summary.pendingShared,
    commissionEarnedTotal: summary.commissionEarned,
    commissionSettledTotal: summary.commissionShared,
    commissionPendingTotal: summary.pendingShared,
  };
}

export function buildCommissionStatementRows(
  partnerName: string,
  partnerSharePercent: number,
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
    "Our Commission %": row.ourCommissionPercent,
    Expected: row.commissionExpected,
    Received: row.commissionReceived,
    "Pending Received": row.pendingReceived,
    "Partner Share %": row.partnerSharePercentOverride ?? partnerSharePercent,
    "Share Expected": row.partnerShareExpected,
    Shared: row.commissionShared,
    "Pending Shared": row.pendingShared,
    "Net Earned": row.commissionEarned,
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
        "Our Commission %": 0,
        Expected: ledger.commissionExpectedTotal,
        Received: ledger.commissionReceivedTotal,
        "Pending Received": ledger.pendingReceivedTotal,
        "Partner Share %": 0,
        "Share Expected": ledger.partnerShareExpectedTotal,
        Shared: ledger.commissionSharedTotal,
        "Pending Shared": ledger.pendingSharedTotal,
        "Net Earned": ledger.commissionEarnedTotal,
      },
      {
        Partner: partnerName,
        Month: month ?? "All",
        "Student ID": "",
        "Student Name": month ? `Received in ${month}` : "Received (filtered)",
        Status: "",
        Disbursed: 0,
        "Our Commission %": 0,
        Expected: 0,
        Received: ledger.receivedInMonth,
        "Pending Received": 0,
        "Partner Share %": 0,
        "Share Expected": 0,
        Shared: 0,
        "Pending Shared": 0,
        "Net Earned": 0,
      },
      {
        Partner: partnerName,
        Month: month ?? "All",
        "Student ID": "",
        "Student Name": month ? `Shared in ${month}` : "Shared (filtered)",
        Status: "",
        Disbursed: 0,
        "Our Commission %": 0,
        Expected: 0,
        Received: 0,
        "Pending Received": 0,
        "Partner Share %": 0,
        "Share Expected": 0,
        Shared: ledger.sharedInMonth,
        "Pending Shared": 0,
        "Net Earned": 0,
      }
    );
  }

  return exportRows;
}

export async function getPartnerCommissionPayouts(
  partnerIds: string[]
): Promise<Map<string, PartnerCommissionSummary>> {
  if (partnerIds.length === 0) {
    return new Map();
  }

  await connectDB();

  const payouts = new Map<string, PartnerCommissionSummary>();

  await Promise.all(
    partnerIds.map(async (partnerId) => {
      const summary = await getPartnerCommissionSummary(partnerId);
      payouts.set(partnerId, summary);
    })
  );

  return payouts;
}

export async function syncPartnerCommissionSettled(partnerId: string): Promise<number> {
  const rows = await getPartnerStudentCommissions(partnerId);
  const total = rows.reduce((sum, row) => sum + row.commissionShared, 0);

  await Partner.findByIdAndUpdate(partnerId, {
    $set: { "performance.commissionSettled": total },
  });

  return total;
}
