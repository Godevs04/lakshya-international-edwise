"use server";

import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { revalidateInsightCaches } from "@/lib/cache/revalidate";
import { connectDB } from "@/lib/db/mongoose";
import { Partner } from "@/models/Partner";
import { Student } from "@/models/Student";
import { getSessionUser } from "@/lib/auth/auth";
import { requirePermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { buildStudentVisibilityFilter } from "@/lib/services/student-visibility.service";
import { mergeMongoFilter } from "@/lib/utils/mongo-filter";
import { logActivity } from "@/lib/services/activity.service";
import {
  buildCommissionStatementRows,
  getPartnerCommissionLedger,
  getPartnerCommissionSummary,
  getPartnerStudentCommissions,
  getPartnersCommissionOverview,
} from "@/lib/services/partner-commission.service";
import {
  partnerSchema,
  commissionSettlementSchema,
  studentCommissionSettlementSchema,
  studentCommissionRateSchema,
  commissionLedgerFilterSchema,
  commissionReceiptSchema,
  commissionStatusFilterSchema,
} from "@/lib/validations/schemas";
import { exportToCsv, exportToPdf } from "@/lib/utils/report-export";
import { getAppConfig } from "@/lib/config/app-config";
import { APP_TAGLINE } from "@/lib/brand/app-logo";
import { sanitizeText, toSafeRegExp } from "@/lib/utils/sanitize";
import { encryptSensitiveField, maskBankAccount, safeDecrypt } from "@/lib/utils/pii";
import {
  getOptionalLinkUrlError,
  normalizeOptionalLinkUrl,
} from "@/lib/utils/document-url";
import {
  normalizeIfsc,
  normalizeIndianPhone,
} from "@/lib/validations/indian-fields";
import type { ActionResult, PaginatedResult, PartnerListItem } from "@/types";
import type { PartnerStatus } from "@/lib/constants/statuses";
import type { PartnerActionStatus } from "@/lib/constants/partner-action-statuses";
import { runLoggedMutation, runLoggedQuery, emptyPaginated } from "@/lib/action-utils";
import type { PartnerInput } from "@/lib/validations/schemas";

function buildPartnerContacts(data: PartnerInput) {
  const contacts = [];

  for (let index = 0; index < 3; index += 1) {
    const name = data[`contact${index}Name` as keyof PartnerInput] as string | undefined;
    const phone = data[`contact${index}Phone` as keyof PartnerInput] as string | undefined;
    const email = data[`contact${index}Email` as keyof PartnerInput] as string | undefined;
    const role = data[`contact${index}Role` as keyof PartnerInput] as string | undefined;

    if (name?.trim() || phone?.trim() || email?.trim() || role?.trim()) {
      contacts.push({
        name: name?.trim() ? sanitizeText(name) : undefined,
        phone: phone?.trim() ? normalizeIndianPhone(phone) : undefined,
        email: email?.trim() || undefined,
        role: role?.trim() ? sanitizeText(role) : undefined,
      });
    }
  }

  return contacts;
}

export async function getPartners(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  actionStatus?: string;
}): Promise<PaginatedResult<PartnerListItem>> {
  return runLoggedQuery("getPartners", async () => {
  const user = await getSessionUser();
  requirePermission(user, PERMISSIONS.PARTNERS_READ);

  await connectDB();
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const skip = (page - 1) * pageSize;

  const filter: Record<string, unknown> = {};
  if (params.search) {
    const regex = toSafeRegExp(params.search);
    filter.$or = [
      { companyName: regex },
      { owner: regex },
      { phone: regex },
      { email: regex },
    ];
  }
  if (params.status) filter.status = params.status;
  if (params.actionStatus) filter.actionStatus = params.actionStatus;

  const [data, total] = await Promise.all([
    Partner.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
    Partner.countDocuments(filter),
  ]);

  return {
    data: data.map((p) => ({
      _id: p._id.toString(),
      companyName: p.companyName,
      owner: p.owner,
      phone: p.phone,
      email: p.email,
      status: p.status as PartnerStatus,
      actionStatus: p.actionStatus as PartnerActionStatus,
      studentsCount: p.studentsCount,
      totalLoanValue: p.totalLoanValue,
      commissionPercent: p.commissionPercent,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
  }, emptyPaginated(params.page ?? 1, params.pageSize ?? 10));
}

export async function getPartnerById(id: string) {
  return runLoggedQuery("getPartnerById", async () => {
  const user = await getSessionUser();
  requirePermission(user, PERMISSIONS.PARTNERS_READ);

  await connectDB();
  const partner = await Partner.findById(id).lean();
  if (!partner) return null;

  return {
    ...partner,
    bankDetails: partner.bankDetails
      ? {
          ...partner.bankDetails,
          accountNumber: maskBankAccount(partner.bankDetails.accountNumber),
        }
      : partner.bankDetails,
  };
  }, null);
}

export async function getPartnerForEdit(id: string) {
  return runLoggedQuery("getPartnerForEdit", async () => {
  const user = await getSessionUser();
  requirePermission(user, PERMISSIONS.PARTNERS_WRITE);

  await connectDB();
  const partner = await Partner.findById(id).lean();
  if (!partner) return null;

  return {
    ...partner,
    bankDetails: partner.bankDetails
      ? {
          ...partner.bankDetails,
          accountNumber: safeDecrypt(partner.bankDetails.accountNumber) || undefined,
          ifsc: partner.bankDetails.ifsc
            ? normalizeIfsc(partner.bankDetails.ifsc)
            : undefined,
        }
      : partner.bankDetails,
  };
  }, null);
}

export async function getPartnerStudents(partnerId: string) {
  return runLoggedQuery("getPartnerStudents", async () => {
  const user = await getSessionUser();
  requirePermission(user, PERMISSIONS.PARTNERS_READ);

  await connectDB();
  const filter = mergeMongoFilter(
    { partnerId },
    buildStudentVisibilityFilter(user)
  );
  return Student.find(filter).sort({ createdAt: -1 }).limit(20).lean();
  }, []);
}

export async function getPartnersList() {
  return runLoggedQuery("getPartnersList", async () => {
  const user = await getSessionUser();
  requirePermission(user, PERMISSIONS.PARTNERS_READ);

  await connectDB();
  return Partner.find({ status: "active" })
    .select("companyName commissionPercent")
    .sort({ companyName: 1 })
    .lean();
  }, []);
}

export async function createPartnerAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  return runLoggedMutation("createPartnerAction", async () => {
  const user = await getSessionUser();
  requirePermission(user, PERMISSIONS.PARTNERS_WRITE);

  const raw = Object.fromEntries(formData.entries());
  const parsed = partnerSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  await connectDB();
  const data = parsed.data;

  const logoError = getOptionalLinkUrlError(data.companyLogo);
  if (logoError) {
    return { success: false, error: `Company logo link: ${logoError}` };
  }

  const partner = await Partner.create({
    companyName: sanitizeText(data.companyName),
    owner: data.owner ? sanitizeText(data.owner) : undefined,
    phone: data.phone?.trim() ? normalizeIndianPhone(data.phone) : undefined,
    email: data.email,
    address: data.address ? sanitizeText(data.address) : undefined,
    location: {
      address: data.locationAddress ? sanitizeText(data.locationAddress) : undefined,
      city: data.locationCity?.trim() || undefined,
      state: data.locationState?.trim() || undefined,
    },
    contacts: buildPartnerContacts(data),
    actionStatus: data.actionStatus ?? "active",
    gst: data.gst?.trim() ? data.gst.toUpperCase() : undefined,
    commissionPercent: data.commissionPercent ?? 0,
    bankDetails: {
      accountName: data.accountName,
      accountNumber: data.accountNumber?.trim()
        ? encryptSensitiveField(data.accountNumber.trim())
        : undefined,
      ifsc: data.ifsc?.trim() ? normalizeIfsc(data.ifsc) : undefined,
      bankName: data.bankName,
    },
    status: data.status ?? "active",
    photo: normalizeOptionalLinkUrl(data.photo),
    companyLogo: normalizeOptionalLinkUrl(data.companyLogo),
    agreementUrl: normalizeOptionalLinkUrl(data.agreementUrl),
    metadata: { createdBy: user?.id, createdByName: user?.name },
  });

  await logActivity({
    action: "partner.created",
    description: `Partner ${data.companyName} was created`,
    resourceType: "partner",
    resourceId: partner._id.toString(),
    userId: user?.id,
    userName: user?.name,
  });

  revalidatePath("/dashboard/partners");
  revalidateInsightCaches();
  return { success: true, data: { id: partner._id.toString() } };
  });
}

export async function updatePartnerAction(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  return runLoggedMutation("updatePartnerAction", async () => {
  const user = await getSessionUser();
  requirePermission(user, PERMISSIONS.PARTNERS_WRITE);

  const raw = Object.fromEntries(formData.entries());
  const parsed = partnerSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  await connectDB();
  const data = parsed.data;
  const existing = await Partner.findById(id);
  if (!existing) return { success: false, error: "Partner not found" };

  const logoError = getOptionalLinkUrlError(data.companyLogo);
  if (logoError) {
    return { success: false, error: `Company logo link: ${logoError}` };
  }

  const partner = await Partner.findByIdAndUpdate(
    id,
    {
      companyName: sanitizeText(data.companyName),
      owner: data.owner ? sanitizeText(data.owner) : undefined,
      phone: data.phone?.trim() ? normalizeIndianPhone(data.phone) : undefined,
      email: data.email,
      address: data.address ? sanitizeText(data.address) : undefined,
      location: {
        address: data.locationAddress ? sanitizeText(data.locationAddress) : undefined,
        city: data.locationCity?.trim() || undefined,
        state: data.locationState?.trim() || undefined,
      },
      contacts: buildPartnerContacts(data),
      actionStatus: data.actionStatus ?? existing.actionStatus,
      gst: data.gst?.trim() ? data.gst.toUpperCase() : undefined,
      commissionPercent: data.commissionPercent ?? 0,
      bankDetails: {
        accountName: data.accountName,
        accountNumber: data.accountNumber?.trim()
          ? encryptSensitiveField(data.accountNumber.trim())
          : raw.accountNumber === ""
            ? undefined
            : encryptSensitiveField(data.accountNumber, existing.bankDetails?.accountNumber) ??
              existing.bankDetails?.accountNumber,
        ifsc: data.ifsc?.trim() ? normalizeIfsc(data.ifsc) : undefined,
        bankName: data.bankName,
      },
      status: data.status,
      photo: normalizeOptionalLinkUrl(data.photo),
      companyLogo: normalizeOptionalLinkUrl(data.companyLogo),
      agreementUrl: normalizeOptionalLinkUrl(data.agreementUrl),
    },
    { new: true }
  );

  if (!partner) return { success: false, error: "Partner not found" };

  await logActivity({
    action: "partner.updated",
    description: `Partner ${data.companyName} was updated`,
    resourceType: "partner",
    resourceId: id,
    userId: user?.id,
    userName: user?.name,
  });

  revalidatePath("/dashboard/partners");
  revalidateInsightCaches();
  revalidatePath(`/dashboard/partners/${id}`);
  return { success: true };
  });
}

export async function deletePartnerAction(id: string): Promise<ActionResult> {
  return runLoggedMutation("deletePartnerAction", async () => {
  const user = await getSessionUser();
  requirePermission(user, PERMISSIONS.PARTNERS_DELETE);

  await connectDB();
  const partner = await Partner.findByIdAndDelete(id);
  if (!partner) return { success: false, error: "Partner not found" };

  await logActivity({
    action: "partner.deleted",
    description: `Partner ${partner.companyName} was deleted`,
    resourceType: "partner",
    resourceId: id,
    userId: user?.id,
    userName: user?.name,
  });

  revalidatePath("/dashboard/partners");
  revalidateInsightCaches();
  return { success: true };
  });
}

export async function getPartnerAnalytics(partnerId: string) {
  return runLoggedQuery("getPartnerAnalytics", async () => {
  const user = await getSessionUser();
  requirePermission(user, PERMISSIONS.PARTNERS_READ);

  await connectDB();
  const partner = await Partner.findById(partnerId).lean();
  if (!partner) return null;

  const statusCounts = await Student.aggregate([
    { $match: { partnerId: partner._id } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const total = statusCounts.reduce((acc, s) => acc + s.count, 0);
  const sanctioned = statusCounts.find((s) => s._id === "sanctioned")?.count ?? 0;
  const disbursed = statusCounts.find((s) => s._id === "disbursed")?.count ?? 0;

  const commission = await getPartnerCommissionSummary(partnerId);

  return {
    monthlyLeads: partner.performance.monthlyLeads,
    sanctionRate: total > 0 ? Math.round((sanctioned / total) * 100) : 0,
    disbursementTotal: commission.totalDisbursed,
    partnerSharePercent: commission.partnerSharePercent,
    commissionExpected: commission.commissionExpected,
    commissionReceived: commission.commissionReceived,
    pendingReceived: commission.pendingReceived,
    partnerShareExpected: commission.partnerShareExpected,
    commissionShared: commission.commissionShared,
    pendingShared: commission.pendingShared,
    projectedNetEarned: commission.projectedNetEarned,
    commissionEarned: commission.commissionEarned,
    commissionPercent: commission.commissionPercent,
    commissionSettled: commission.commissionSettled,
    commissionPending: commission.commissionPending,
    disbursedStudentCount: commission.disbursedStudentCount,
    statusCounts,
    disbursed,
    settlements: (partner.commissionSettlements ?? [])
      .slice()
      .sort((a, b) => new Date(b.settledAt ?? 0).getTime() - new Date(a.settledAt ?? 0).getTime())
      .slice(0, 20)
      .map((entry) => ({
        amount: entry.amount,
        note: entry.note,
        settledAt: entry.settledAt,
        settledByName: entry.settledByName,
        studentId: entry.studentId?.toString(),
        studentName: entry.studentName,
      })),
    studentCommissions: await getPartnerStudentCommissions(partnerId),
  };
  }, null);
}

export async function getPartnersCommissionOverviewAction(status?: string) {
  return runLoggedQuery("getPartnersCommissionOverviewAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.PARTNERS_READ);
    const parsed = commissionStatusFilterSchema.safeParse(status ?? "all");
    return getPartnersCommissionOverview(parsed.success ? parsed.data : "all");
  }, []);
}

export async function recordPartnerCommissionSettlementAction(
  partnerId: string,
  formData: FormData
): Promise<ActionResult> {
  return runLoggedMutation("recordPartnerCommissionSettlementAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.PARTNERS_WRITE);

    const parsed = commissionSettlementSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
    }

    await connectDB();
    const partner = await Partner.findById(partnerId);
    if (!partner) return { success: false, error: "Partner not found" };

    const summary = await getPartnerCommissionSummary(partnerId);

    if (parsed.data.amount > summary.pendingShared) {
      return {
        success: false,
        error: `Amount exceeds pending partner share (${summary.pendingShared.toLocaleString("en-IN")})`,
      };
    }

    partner.performance ??= {
      monthlyLeads: 0,
      sanctionRate: 0,
      disbursementTotal: 0,
      commissionEarned: 0,
      commissionSettled: 0,
    };
    partner.performance.commissionSettled =
      (partner.performance.commissionSettled ?? 0) + parsed.data.amount;

    partner.commissionSettlements ??= [];
    partner.commissionSettlements.push({
      amount: parsed.data.amount,
      note: parsed.data.note?.trim() || undefined,
      settledAt: new Date(),
      settledBy: user?.id ? new Types.ObjectId(user.id) : undefined,
      settledByName: user?.name,
    });

    await partner.save();

    await logActivity({
      action: "partner.commission_settled",
      description: `Recorded commission settlement of INR ${parsed.data.amount.toLocaleString("en-IN")} for ${partner.companyName}`,
      resourceType: "partner",
      resourceId: partnerId,
      userId: user?.id,
      userName: user?.name,
      metadata: { amount: parsed.data.amount, note: parsed.data.note?.trim() || undefined },
    });

    revalidatePath(`/dashboard/partners/${partnerId}`);
    revalidatePath("/dashboard/partners");
    revalidateInsightCaches();
    return { success: true };
  });
}

export async function getPartnerCommissionLedgerAction(
  partnerId: string,
  month?: string
) {
  return runLoggedQuery("getPartnerCommissionLedgerAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.PARTNERS_READ);

    const parsed = commissionLedgerFilterSchema.safeParse({ month: month ?? "" });
    if (!parsed.success) {
      return null;
    }

    return getPartnerCommissionLedger(partnerId, parsed.data.month || undefined);
  }, null);
}

export async function recordStudentCommissionSettlementAction(
  partnerId: string,
  studentId: string,
  formData: FormData
): Promise<ActionResult> {
  return runLoggedMutation("recordStudentCommissionSettlementAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.PARTNERS_WRITE);

    const parsed = studentCommissionSettlementSchema.safeParse(
      Object.fromEntries(formData.entries())
    );
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
    }

    await connectDB();
    const [partner, student] = await Promise.all([
      Partner.findById(partnerId),
      Student.findOne({ _id: studentId, partnerId }),
    ]);

    if (!partner) return { success: false, error: "Partner not found" };
    if (!student) return { success: false, error: "Student not found for this partner" };

    const rows = await getPartnerStudentCommissions(partnerId);
    const row = rows.find((item) => item.studentDbId === studentId);
    if (!row) return { success: false, error: "Student commission row not found" };

    if (parsed.data.amount > row.pendingShared) {
      return {
        success: false,
        error: `Amount exceeds pending partner share (${row.pendingShared.toLocaleString("en-IN")})`,
      };
    }

    student.commissionSettled = (student.commissionSettled ?? 0) + parsed.data.amount;
    student.commissionSettlements ??= [];
    student.commissionSettlements.push({
      amount: parsed.data.amount,
      note: parsed.data.note?.trim() || undefined,
      settledAt: new Date(),
      settledBy: user?.id ? new Types.ObjectId(user.id) : undefined,
      settledByName: user?.name,
    });
    await student.save();

    const updatedRows = await getPartnerStudentCommissions(partnerId);
    const totalSettled = updatedRows.reduce((sum, item) => sum + item.commissionShared, 0);

    partner.commissionSettlements ??= [];
    partner.commissionSettlements.push({
      amount: parsed.data.amount,
      note: parsed.data.note?.trim() || `Settlement for ${student.studentId}`,
      settledAt: new Date(),
      settledBy: user?.id ? new Types.ObjectId(user.id) : undefined,
      settledByName: user?.name,
      studentId: student._id,
      studentName: `${student.firstName} ${student.lastName}`.trim(),
    });
    partner.performance ??= {
      monthlyLeads: 0,
      sanctionRate: 0,
      disbursementTotal: 0,
      commissionEarned: 0,
      commissionSettled: 0,
    };
    partner.performance.commissionSettled = totalSettled;
    await partner.save();

    await logActivity({
      action: "partner.student_commission_settled",
      description: `Recorded INR ${parsed.data.amount.toLocaleString("en-IN")} commission settlement for ${student.studentId} (${partner.companyName})`,
      resourceType: "partner",
      resourceId: partnerId,
      userId: user?.id,
      userName: user?.name,
      metadata: {
        amount: parsed.data.amount,
        studentId: student.studentId,
        studentDbId: studentId,
        note: parsed.data.note?.trim() || undefined,
      },
    });

    revalidatePath(`/dashboard/partners/${partnerId}`);
    revalidatePath("/dashboard/partners");
    revalidateInsightCaches();
    return { success: true };
  });
}

export async function markStudentCommissionReceivedAction(
  partnerId: string,
  studentId: string
): Promise<ActionResult<{ amount: number }>> {
  return runLoggedMutation("markStudentCommissionReceivedAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.PARTNERS_WRITE);

    await connectDB();
    const rows = await getPartnerStudentCommissions(partnerId);
    const row = rows.find((item) => item.studentDbId === studentId);
    if (!row) return { success: false, error: "Student commission row not found" };
    if (row.pendingReceived <= 0) {
      return { success: false, error: "No pending commission to mark as received" };
    }

    const formData = new FormData();
    formData.set("amount", String(row.pendingReceived));
    formData.set("note", "Marked as received (auto-calculated amount)");

    const result = await recordStudentCommissionReceivedAction(partnerId, studentId, formData);
    if (!result.success) {
      return { success: false, error: result.error ?? "Failed to mark received" };
    }

    return { success: true, data: { amount: row.pendingReceived } };
  });
}

export async function markStudentCommissionSharedAction(
  partnerId: string,
  studentId: string
): Promise<ActionResult<{ amount: number }>> {
  return runLoggedMutation("markStudentCommissionSharedAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.PARTNERS_WRITE);

    await connectDB();
    const rows = await getPartnerStudentCommissions(partnerId);
    const row = rows.find((item) => item.studentDbId === studentId);
    if (!row) return { success: false, error: "Student commission row not found" };
    if (row.pendingShared <= 0) {
      return { success: false, error: "No pending partner share to mark as paid" };
    }

    const formData = new FormData();
    formData.set("amount", String(row.pendingShared));
    formData.set("note", "Marked as paid (auto-calculated amount)");

    const result = await recordStudentCommissionSettlementAction(partnerId, studentId, formData);
    if (!result.success) {
      return { success: false, error: result.error ?? "Failed to mark paid" };
    }

    return { success: true, data: { amount: row.pendingShared } };
  });
}

export async function recordStudentCommissionReceivedAction(
  partnerId: string,
  studentId: string,
  formData: FormData
): Promise<ActionResult> {
  return runLoggedMutation("recordStudentCommissionReceivedAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.PARTNERS_WRITE);

    const parsed = commissionReceiptSchema.safeParse(
      Object.fromEntries(formData.entries())
    );
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
    }

    await connectDB();
    const [partner, student] = await Promise.all([
      Partner.findById(partnerId),
      Student.findOne({ _id: studentId, partnerId }),
    ]);

    if (!partner) return { success: false, error: "Partner not found" };
    if (!student) return { success: false, error: "Student not found for this partner" };

    const rows = await getPartnerStudentCommissions(partnerId);
    const row = rows.find((item) => item.studentDbId === studentId);
    if (!row) return { success: false, error: "Student commission row not found" };

    if (parsed.data.amount > row.pendingReceived) {
      return {
        success: false,
        error: `Amount exceeds pending received (${row.pendingReceived.toLocaleString("en-IN")})`,
      };
    }

    student.commissionReceived = (student.commissionReceived ?? 0) + parsed.data.amount;
    student.commissionReceipts ??= [];
    student.commissionReceipts.push({
      amount: parsed.data.amount,
      note: parsed.data.note?.trim() || undefined,
      receivedAt: new Date(),
      recordedBy: user?.id ? new Types.ObjectId(user.id) : undefined,
      recordedByName: user?.name,
    });
    await student.save();

    await logActivity({
      action: "partner.student_commission_received",
      description: `Recorded INR ${parsed.data.amount.toLocaleString("en-IN")} commission received for ${student.studentId} (${partner.companyName})`,
      resourceType: "partner",
      resourceId: partnerId,
      userId: user?.id,
      userName: user?.name,
      metadata: {
        amount: parsed.data.amount,
        studentId: student.studentId,
        studentDbId: studentId,
        note: parsed.data.note?.trim() || undefined,
      },
    });

    revalidatePath(`/dashboard/partners/${partnerId}`);
    revalidatePath(`/dashboard/students/${studentId}`);
    revalidateInsightCaches();
    return { success: true };
  });
}

export async function updateStudentCommissionRateAction(
  partnerId: string,
  studentId: string,
  formData: FormData
): Promise<ActionResult> {
  return runLoggedMutation("updateStudentCommissionRateAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.PARTNERS_WRITE);

    const parsed = studentCommissionRateSchema.safeParse(
      Object.fromEntries(formData.entries())
    );
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
    }

    await connectDB();
    const student = await Student.findOne({ _id: studentId, partnerId })
      .select("studentId ourCommissionPercent commissionPercentOverride")
      .lean();
    if (!student) return { success: false, error: "Student not found for this partner" };

    const before = {
      ourCommissionPercent: student.ourCommissionPercent ?? null,
      commissionPercentOverride: student.commissionPercentOverride ?? null,
    };

    const $set: Record<string, number> = {};
    const $unset: Record<string, 1> = {};
    const updates: string[] = [];

    if (formData.has("commissionPercentOverride")) {
      const rawOverride = formData.get("commissionPercentOverride");
      if (rawOverride === "" || parsed.data.commissionPercentOverride === "") {
        $unset.commissionPercentOverride = 1;
        updates.push("partner share");
      } else if (parsed.data.commissionPercentOverride != null) {
        $set.commissionPercentOverride = parsed.data.commissionPercentOverride;
        updates.push("partner share");
      }
    }

    if (formData.has("ourCommissionPercent")) {
      const rawOur = formData.get("ourCommissionPercent");
      if (rawOur === "" || parsed.data.ourCommissionPercent === "") {
        $unset.ourCommissionPercent = 1;
        updates.push("our commission");
      } else if (parsed.data.ourCommissionPercent != null) {
        $set.ourCommissionPercent = parsed.data.ourCommissionPercent;
        updates.push("our commission");
      }
    }

    if (!updates.length) {
      return { success: false, error: "No commission rate to update" };
    }

    await Student.updateOne(
      { _id: studentId, partnerId },
      {
        ...(Object.keys($set).length ? { $set } : {}),
        ...(Object.keys($unset).length ? { $unset } : {}),
      }
    );

    await logActivity({
      action: "partner.student_commission_rate_updated",
      description: `Updated ${updates.join(" and ")} rate for ${student.studentId}`,
      resourceType: "student",
      resourceId: studentId,
      userId: user?.id,
      userName: user?.name,
      metadata: {
        partnerId,
        fieldsUpdated: updates,
        before,
        after: {
          ourCommissionPercent:
            $set.ourCommissionPercent ?? ($unset.ourCommissionPercent ? null : before.ourCommissionPercent),
          commissionPercentOverride:
            $set.commissionPercentOverride ??
            ($unset.commissionPercentOverride ? null : before.commissionPercentOverride),
        },
      },
    });

    revalidatePath(`/dashboard/partners/${partnerId}`);
    revalidatePath(`/dashboard/students/${studentId}`);
    revalidateInsightCaches();
    return { success: true };
  });
}

export async function exportPartnerCommissionAction(
  partnerId: string,
  format: "csv" | "pdf",
  month?: string
): Promise<ActionResult<{ filename: string; mimeType: string; data: string }>> {
  return runLoggedMutation("exportPartnerCommissionAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.PARTNERS_READ);

    await connectDB();
    const partner = await Partner.findById(partnerId).select("companyName commissionPercent").lean();
    if (!partner) return { success: false, error: "Partner not found" };

    const parsed = commissionLedgerFilterSchema.safeParse({ month: month ?? "" });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid month filter" };
    }

    const monthFilter = parsed.data.month || undefined;
    const [rows, ledger] = await Promise.all([
      getPartnerStudentCommissions(partnerId),
      getPartnerCommissionLedger(partnerId, monthFilter),
    ]);

    const exportRows = buildCommissionStatementRows(
      partner.companyName,
      partner.commissionPercent ?? 0,
      monthFilter
        ? rows.filter((row) => {
            if (!row.disbursedAt) return false;
            const rowMonth = new Date(row.disbursedAt).toISOString().slice(0, 7);
            return rowMonth === monthFilter;
          })
        : rows,
      ledger,
      monthFilter
    );

    const stamp = monthFilter ?? new Date().toISOString().slice(0, 10);
    const safeName = partner.companyName.replace(/[^\w\-]+/g, "_");
    const config = await getAppConfig();
    const exportOptions = {
      title: "Commission Statement",
      subtitle: `${partner.companyName}${monthFilter ? ` — ${monthFilter}` : ""}`,
      companyName: config.company.name,
      tagline: APP_TAGLINE,
      logoSrc: config.company.logo,
      generatedBy: user?.name ?? user?.email ?? "System",
      generatedAt: new Date(),
    };

    await logActivity({
      action: "partner.commission_exported",
      description: `Exported ${format.toUpperCase()} commission statement for ${partner.companyName}${monthFilter ? ` (${monthFilter})` : ""}`,
      resourceType: "partner",
      resourceId: partnerId,
      userId: user?.id,
      userName: user?.name,
      metadata: { format, month: monthFilter, rowCount: exportRows.length },
    });

    if (format === "csv") {
      return {
        success: true,
        data: {
          filename: `${safeName}-commission-${stamp}.csv`,
          mimeType: "text/csv;charset=utf-8",
          data: Buffer.from(exportToCsv(exportRows, exportOptions)).toString("base64"),
        },
      };
    }

    const pdf = await exportToPdf(exportRows, exportOptions);

    return {
      success: true,
      data: {
        filename: `${safeName}-commission-${stamp}.pdf`,
        mimeType: "application/pdf",
        data: Buffer.from(pdf).toString("base64"),
      },
    };
  });
}
