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
import { logActivity } from "@/lib/services/activity.service";
import {
  getPartnerCommissionSummary,
  getPartnerStudentCommissions,
  getPartnersCommissionOverview,
} from "@/lib/services/partner-commission.service";
import { partnerSchema, commissionSettlementSchema } from "@/lib/validations/schemas";
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
import { runLoggedMutation, runLoggedQuery, emptyPaginated } from "@/lib/action-utils";

export async function getPartners(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
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
  return Student.find({ partnerId }).sort({ createdAt: -1 }).limit(20).lean();
  }, []);
}

export async function getPartnersList() {
  return runLoggedQuery("getPartnersList", async () => {
  const user = await getSessionUser();
  requirePermission(user, PERMISSIONS.PARTNERS_READ);

  await connectDB();
  return Partner.find({ status: "active" }).select("companyName").sort({ companyName: 1 }).lean();
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

  const commission = await getPartnerCommissionSummary(
    partnerId,
    partner.commissionPercent ?? 0,
    partner.performance?.commissionSettled ?? 0
  );

  return {
    monthlyLeads: partner.performance.monthlyLeads,
    sanctionRate: total > 0 ? Math.round((sanctioned / total) * 100) : 0,
    disbursementTotal: commission.totalDisbursed,
    commissionEarned: commission.commissionEarned,
    commissionSettled: commission.commissionSettled,
    commissionPending: commission.commissionPending,
    commissionPercent: commission.commissionPercent,
    disbursedStudentCount: commission.disbursedStudentCount,
    statusCounts,
    disbursed,
    settlements: (partner.commissionSettlements ?? [])
      .slice()
      .sort((a, b) => new Date(b.settledAt ?? 0).getTime() - new Date(a.settledAt ?? 0).getTime())
      .slice(0, 10)
      .map((entry) => ({
        amount: entry.amount,
        note: entry.note,
        settledAt: entry.settledAt,
        settledByName: entry.settledByName,
      })),
    studentCommissions: await getPartnerStudentCommissions(
      partnerId,
      partner.commissionPercent ?? 0,
      partner.performance?.commissionSettled ?? 0
    ),
  };
  }, null);
}

export async function getPartnersCommissionOverviewAction() {
  return runLoggedQuery("getPartnersCommissionOverviewAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.PARTNERS_READ);
    return getPartnersCommissionOverview();
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

    const summary = await getPartnerCommissionSummary(
      partnerId,
      partner.commissionPercent ?? 0,
      partner.performance?.commissionSettled ?? 0
    );

    if (parsed.data.amount > summary.commissionPending) {
      return {
        success: false,
        error: `Amount exceeds pending commission (${summary.commissionPending.toLocaleString("en-IN")})`,
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
    });

    revalidatePath(`/dashboard/partners/${partnerId}`);
    revalidatePath("/dashboard/partners");
    revalidateInsightCaches();
    return { success: true };
  });
}
