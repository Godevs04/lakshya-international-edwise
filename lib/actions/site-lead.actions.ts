"use server";

import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import { Student } from "@/models/Student";
import { Partner } from "@/models/Partner";
import { Application } from "@/models/Application";
import { User } from "@/models/User";
import { getSessionUser } from "@/lib/auth/auth";
import { requirePermission, hasPermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { STUDENT_RECORD_TYPE } from "@/lib/constants/student-record-type";
import {
  SITE_LEAD_PROMOTION_STATUS,
  SITE_LEAD_SOURCE,
  websitePendingPartnerLeadsFilter,
  websitePendingStudentLeadsFilter,
} from "@/lib/constants/site-leads";
import { allocateStudentId } from "@/lib/services/student-id.service";
import { allocatePartnerCode } from "@/lib/services/partner-id.service";
import { getActivitiesForResource, logActivity } from "@/lib/services/activity.service";
import { revalidateInsightCaches } from "@/lib/cache/revalidate";
import { runLoggedQuery, runLoggedMutation, emptyPaginated } from "@/lib/action-utils";
import { toSafeRegExp } from "@/lib/utils/sanitize";
import { mergeMongoFilter } from "@/lib/utils/mongo-filter";
import { buildAdmissionVisibilityFilter } from "@/lib/services/student-visibility.service";
import { repairLegacyWebsitePartnerLeads } from "@/lib/services/website-partner-lead.service";
import type {
  ActionResult,
  PaginatedResult,
  SiteLeadCounts,
  SitePartnerLeadListItem,
  SiteStudentLeadListItem,
} from "@/types";

function resolveAssignedTo(assignedToId: string | undefined) {
  if (!assignedToId?.trim()) return {};
  return {
    assignedTo: new Types.ObjectId(assignedToId),
    assignedAt: new Date(),
  };
}

async function getAssigneeName(assignedToId: string | undefined) {
  if (!assignedToId?.trim()) return undefined;
  const user = await User.findById(assignedToId).select("name").lean();
  return user?.name;
}

function serializeActivity(entry: {
  action: string;
  description: string;
  userName?: string;
  createdAt?: Date;
}) {
  return {
    action: entry.action,
    description: entry.description,
    userName: entry.userName,
    createdAt: entry.createdAt ? new Date(entry.createdAt).toISOString() : undefined,
  };
}

function csvCell(value: unknown) {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function buildCsv(rows: unknown[][]) {
  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

export async function getSiteLeadCounts(): Promise<SiteLeadCounts> {
  return runLoggedQuery("getSiteLeadCounts", async () => {
    const user = await getSessionUser();
    const canStudents = hasPermission(user, PERMISSIONS.ADMISSIONS_READ);
    const canPartners = hasPermission(user, PERMISSIONS.PARTNERS_READ);

    if (!canStudents && !canPartners) {
      return { students: 0, partners: 0, total: 0 };
    }

    await connectDB();
    await repairLegacyWebsitePartnerLeads();

    const [students, partners] = await Promise.all([
      canStudents
        ? Student.countDocuments(
            mergeMongoFilter(
              websitePendingStudentLeadsFilter(),
              buildAdmissionVisibilityFilter(user)
            )
          )
        : Promise.resolve(0),
      canPartners
        ? Partner.countDocuments(websitePendingPartnerLeadsFilter())
        : Promise.resolve(0),
    ]);

    return { students, partners, total: students + partners };
  }, { students: 0, partners: 0, total: 0 });
}

export async function getSiteLeadAssignableUsers() {
  return runLoggedQuery("getSiteLeadAssignableUsers", async () => {
    const user = await getSessionUser();
    const canAssignStudents = hasPermission(user, PERMISSIONS.ADMISSIONS_WRITE);
    const canAssignPartners = hasPermission(user, PERMISSIONS.PARTNERS_WRITE);
    if (!canAssignStudents && !canAssignPartners) return [];

    await connectDB();
    const users = await User.find({ status: "active" }).select("name email role").sort({ name: 1 }).lean();
    return users.map((entry) => ({
      _id: entry._id.toString(),
      name: entry.name,
      email: entry.email,
      role: entry.role,
    }));
  }, []);
}

export async function getSiteStudentLeads(params: {
  page?: number;
  pageSize?: number;
  search?: string;
}): Promise<PaginatedResult<SiteStudentLeadListItem>> {
  return runLoggedQuery("getSiteStudentLeads", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.ADMISSIONS_READ);

    await connectDB();
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 10;
    const skip = (page - 1) * pageSize;

    const baseFilter = websitePendingStudentLeadsFilter();
    let mongoFilter = mergeMongoFilter(baseFilter, buildAdmissionVisibilityFilter(user));

    if (params.search) {
      const regex = toSafeRegExp(params.search);
      mongoFilter = mergeMongoFilter(mongoFilter, {
        $or: [
          { firstName: regex },
          { lastName: regex },
          { phone: regex },
          { email: regex },
          { studentId: regex },
          { "metadata.contactSubject": regex },
          { "metadata.preferredLender": regex },
          { "metadata.loanAmountText": regex },
        ],
      });
    }

    const [data, total] = await Promise.all([
      Student.find(mongoFilter)
        .select(
          "studentId firstName lastName phone email targetCountry metadata.enquiryType metadata.formPage metadata.loanAmountText metadata.preferredLender metadata.promotionStatus createdAt notes"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Student.countDocuments(mongoFilter),
    ]);

    return {
      data: data.map((entry) => ({
        _id: entry._id.toString(),
        studentId: entry.studentId,
        firstName: entry.firstName,
        lastName: entry.lastName,
        phone: entry.phone,
        email: entry.email,
        targetCountry: entry.targetCountry,
        enquiryType: entry.metadata?.enquiryType,
        formPage: entry.metadata?.formPage,
        loanAmountText: entry.metadata?.loanAmountText,
        preferredLender: entry.metadata?.preferredLender,
        promotionStatus: entry.metadata?.promotionStatus,
        createdAt: entry.createdAt,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    };
  }, emptyPaginated(params.page ?? 1, params.pageSize ?? 10));
}

export async function getSitePartnerLeads(params: {
  page?: number;
  pageSize?: number;
  search?: string;
}): Promise<PaginatedResult<SitePartnerLeadListItem>> {
  return runLoggedQuery("getSitePartnerLeads", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.PARTNERS_READ);

    await connectDB();
    await repairLegacyWebsitePartnerLeads();
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 10;
    const skip = (page - 1) * pageSize;

    const baseFilter = websitePendingPartnerLeadsFilter();
    let mongoFilter: Record<string, unknown> = { ...baseFilter };

    if (params.search) {
      const regex = toSafeRegExp(params.search);
      mongoFilter = mergeMongoFilter(baseFilter, {
        $or: [
          { companyName: regex },
          { owner: regex },
          { phone: regex },
          { email: regex },
          { partnerCode: regex },
        ],
      });
    }

    const [data, total] = await Promise.all([
      Partner.find(mongoFilter)
        .select(
          "partnerCode companyName owner phone email location.city metadata.isOwner metadata.formCity metadata.whatsapp metadata.possibleDuplicate metadata.promotionStatus createdAt"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Partner.countDocuments(mongoFilter),
    ]);

    return {
      data: data.map((entry) => ({
        _id: entry._id.toString(),
        partnerCode: entry.partnerCode,
        companyName: entry.companyName,
        owner: entry.owner,
        phone: entry.phone,
        email: entry.email,
        city: entry.metadata?.formCity ?? entry.location?.city,
        isOwner: entry.metadata?.isOwner,
        whatsapp: entry.metadata?.whatsapp,
        possibleDuplicate: entry.metadata?.possibleDuplicate,
        promotionStatus: entry.metadata?.promotionStatus,
        createdAt: entry.createdAt,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    };
  }, emptyPaginated(params.page ?? 1, params.pageSize ?? 10));
}

export async function getSiteStudentLeadById(id: string) {
  return runLoggedQuery("getSiteStudentLeadById", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.ADMISSIONS_READ);
    await connectDB();

    const student = await Student.findOne(
      mergeMongoFilter({ _id: id }, websitePendingStudentLeadsFilter())
    )
      .populate("assignedTo", "name")
      .lean();

    if (!student) return null;

    const assignedTo = student.assignedTo as
      | { _id?: { toString(): string }; name?: string }
      | { toString(): string }
      | undefined;

    return {
      _id: student._id.toString(),
      studentId: student.studentId,
      firstName: student.firstName,
      lastName: student.lastName,
      phone: student.phone,
      email: student.email,
      targetCountry: student.targetCountry,
      enquiryType: student.metadata?.enquiryType,
      formPage: student.metadata?.formPage,
      loanAmountText: student.metadata?.loanAmountText,
      currentStatus: student.metadata?.currentStatus,
      preferredLender: student.metadata?.preferredLender,
      contactSubject: student.metadata?.contactSubject,
      assignedTo:
        assignedTo && "_id" in assignedTo ? assignedTo._id?.toString() : assignedTo?.toString(),
      assignedToName: assignedTo && "name" in assignedTo ? String(assignedTo.name) : undefined,
      notes: (student.notes ?? []).map((note) => ({
        content: note.content,
        createdByName: note.createdByName,
        createdAt: note.createdAt ? new Date(note.createdAt).toISOString() : undefined,
      })),
      activities: (await getActivitiesForResource("student", student._id.toString(), 12)).map(
        serializeActivity
      ),
      createdAt: new Date(student.createdAt).toISOString(),
    };
  }, null);
}

export async function getSitePartnerLeadById(id: string) {
  return runLoggedQuery("getSitePartnerLeadById", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.PARTNERS_READ);
    await connectDB();
    await repairLegacyWebsitePartnerLeads();

    const partner = await Partner.findOne(
      mergeMongoFilter({ _id: id }, websitePendingPartnerLeadsFilter())
    ).lean();

    if (!partner) return null;

    return {
      _id: partner._id.toString(),
      partnerCode: partner.partnerCode,
      companyName: partner.companyName,
      owner: partner.owner,
      phone: partner.phone,
      email: partner.email,
      city: partner.metadata?.formCity ?? partner.location?.city,
      isOwner: partner.metadata?.isOwner,
      whatsapp: partner.metadata?.whatsapp,
      possibleDuplicate: partner.metadata?.possibleDuplicate,
      assignedTo: partner.metadata?.assignedTo?.toString(),
      assignedToName: partner.metadata?.assignedToName,
      activities: (await getActivitiesForResource("partner", partner._id.toString(), 12)).map(
        serializeActivity
      ),
      createdAt: new Date(partner.createdAt).toISOString(),
    };
  }, null);
}

export async function assignSiteStudentLeadAction(
  id: string,
  assignedToId?: string
): Promise<ActionResult> {
  return runLoggedMutation("assignSiteStudentLeadAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.ADMISSIONS_WRITE);
    await connectDB();

    const student = await Student.findOne(
      mergeMongoFilter({ _id: id }, websitePendingStudentLeadsFilter())
    );
    if (!student) return { success: false, error: "Site lead not found" };

    const assigneeName = await getAssigneeName(assignedToId);
    Object.assign(student, resolveAssignedTo(assignedToId));
    if (!assignedToId?.trim()) {
      student.assignedTo = undefined;
      student.assignedAt = undefined;
    }
    await student.save();

    await logActivity({
      action: "site_lead.student_assigned",
      description: assigneeName
        ? `Assigned website lead ${student.studentId} to ${assigneeName}`
        : `Unassigned website lead ${student.studentId}`,
      resourceType: "student",
      resourceId: student._id.toString(),
      userId: user?.id,
      userName: user?.name,
      metadata: { assignedToId, assigneeName },
    });

    revalidatePath("/dashboard/site-leads");
    return { success: true };
  });
}

export async function assignSitePartnerLeadAction(
  id: string,
  assignedToId?: string
): Promise<ActionResult> {
  return runLoggedMutation("assignSitePartnerLeadAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.PARTNERS_WRITE);
    await connectDB();

    const partner = await Partner.findOne(
      mergeMongoFilter({ _id: id }, websitePendingPartnerLeadsFilter())
    );
    if (!partner) return { success: false, error: "Site lead not found" };

    const assigneeName = await getAssigneeName(assignedToId);
    partner.metadata = {
      ...partner.metadata,
      assignedTo: assignedToId?.trim() ? new Types.ObjectId(assignedToId) : undefined,
      assignedToName: assigneeName,
      assignedAt: assignedToId?.trim() ? new Date() : undefined,
    };
    await partner.save();

    await logActivity({
      action: "site_lead.partner_assigned",
      description: assigneeName
        ? `Assigned partner lead ${partner.partnerCode ?? partner.companyName} to ${assigneeName}`
        : `Unassigned partner lead ${partner.partnerCode ?? partner.companyName}`,
      resourceType: "partner",
      resourceId: partner._id.toString(),
      userId: user?.id,
      userName: user?.name,
      metadata: { assignedToId, assigneeName },
    });

    revalidatePath("/dashboard/site-leads");
    return { success: true };
  });
}

export async function getSiteStudentLeadApplication(studentLeadId: string) {
  return runLoggedQuery("getSiteStudentLeadApplication", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.ADMISSIONS_READ);
    await connectDB();

    const student = await Student.findOne(
      mergeMongoFilter({ _id: studentLeadId }, websitePendingStudentLeadsFilter())
    )
      .select("_id")
      .lean();

    if (!student) return null;

    const application = await Application.findOne({ studentId: student._id })
      .select("loanAmount status pipelineStage createdAt")
      .lean();

    if (!application) return null;

    return {
      loanAmount: application.loanAmount,
      status: application.status,
      pipelineStage: application.pipelineStage,
      createdAt: new Date(application.createdAt).toISOString(),
    };
  }, null);
}

export async function deleteSiteStudentLeadAction(id: string): Promise<ActionResult> {
  return runLoggedMutation("deleteSiteStudentLeadAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.ADMISSIONS_WRITE);
    await connectDB();

    const student = await Student.findOne(
      mergeMongoFilter({ _id: id }, websitePendingStudentLeadsFilter())
    );
    if (!student) return { success: false, error: "Site lead not found" };

    await Application.deleteMany({ studentId: student._id });
    await Student.findByIdAndDelete(student._id);

    await logActivity({
      action: "site_lead.student_deleted",
      description: `Deleted website student lead ${student.studentId}`,
      resourceType: "student",
      resourceId: id,
      userId: user?.id,
      userName: user?.name,
    });

    revalidatePath("/dashboard/site-leads");
    revalidateInsightCaches();
    return { success: true };
  });
}

export async function deleteSitePartnerLeadAction(id: string): Promise<ActionResult> {
  return runLoggedMutation("deleteSitePartnerLeadAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.PARTNERS_WRITE);
    await connectDB();

    const partner = await Partner.findOne(
      mergeMongoFilter({ _id: id }, websitePendingPartnerLeadsFilter())
    );
    if (!partner) return { success: false, error: "Site lead not found" };

    await Partner.findByIdAndDelete(partner._id);

    await logActivity({
      action: "site_lead.partner_deleted",
      description: `Deleted website partner lead ${partner.partnerCode ?? partner.companyName}`,
      resourceType: "partner",
      resourceId: id,
      userId: user?.id,
      userName: user?.name,
    });

    revalidatePath("/dashboard/site-leads");
    revalidateInsightCaches();
    return { success: true };
  });
}

export async function promoteSiteStudentLeadAction(
  id: string,
  formData: FormData
): Promise<ActionResult<{ studentId: string; officialId: string }>> {
  return runLoggedMutation("promoteSiteStudentLeadAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.ADMISSIONS_WRITE);
    await connectDB();

    const student = await Student.findOne(
      mergeMongoFilter({ _id: id }, websitePendingStudentLeadsFilter())
    );
    if (!student) return { success: false, error: "Site lead not found" };

    const partnerId = formData.get("partnerId")?.toString().trim();
    const assignedToId = formData.get("assignedToId")?.toString().trim();
    const officialId = await allocateStudentId();

    student.studentId = officialId;
    student.recordType = STUDENT_RECORD_TYPE.STUDENT;
    student.metadata = {
      ...student.metadata,
      leadSource: SITE_LEAD_SOURCE.WEBSITE,
      promotionStatus: SITE_LEAD_PROMOTION_STATUS.PROMOTED,
      promotedAt: new Date(),
      promotedBy: user?.id ? new Types.ObjectId(user.id) : undefined,
      promotedByName: user?.name,
    };

    if (partnerId) {
      student.partnerId = new Types.ObjectId(partnerId);
    }

    Object.assign(student, resolveAssignedTo(assignedToId));
    student.timeline.push({
      status: student.status,
      note: `Promoted from website lead to student ${officialId}`,
      createdBy: user?.id ? new Types.ObjectId(user.id) : undefined,
      createdByName: user?.name,
      createdAt: new Date(),
    });

    await student.save();

    if (partnerId) {
      await Partner.findByIdAndUpdate(partnerId, {
        $inc: { studentsCount: 1 },
      });
    }

    await logActivity({
      action: "site_lead.student_promoted",
      description: `Promoted website lead to student ${officialId}`,
      resourceType: "student",
      resourceId: student._id.toString(),
      userId: user?.id,
      userName: user?.name,
      metadata: { previousLeadId: id, officialId },
    });

    revalidatePath("/dashboard/site-leads");
    revalidatePath("/dashboard/students");
    revalidatePath(`/dashboard/students/${student._id}`);
    revalidatePath("/dashboard/overview");
    revalidateInsightCaches();

    return { success: true, data: { studentId: student._id.toString(), officialId } };
  });
}

export async function promoteSitePartnerLeadAction(
  id: string,
  formData: FormData
): Promise<ActionResult<{ partnerId: string; officialCode: string }>> {
  return runLoggedMutation("promoteSitePartnerLeadAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.PARTNERS_WRITE);
    await connectDB();

    const partner = await Partner.findOne(
      mergeMongoFilter({ _id: id }, websitePendingPartnerLeadsFilter())
    );
    if (!partner) return { success: false, error: "Site lead not found" };

    const commissionRaw = formData.get("commissionPercent")?.toString().trim();
    const commissionPercent = commissionRaw ? Number(commissionRaw) : partner.commissionPercent;
    if (Number.isNaN(commissionPercent) || commissionPercent < 0 || commissionPercent > 100) {
      return { success: false, error: "Commission must be between 0 and 100" };
    }

    const officialCode = await allocatePartnerCode();
    partner.partnerCode = officialCode;
    partner.status = "active";
    partner.actionStatus = "need_action";
    partner.commissionPercent = commissionPercent;
    partner.metadata = {
      ...partner.metadata,
      leadSource: SITE_LEAD_SOURCE.WEBSITE,
      promotionStatus: SITE_LEAD_PROMOTION_STATUS.PROMOTED,
      promotedAt: new Date(),
      promotedBy: user?.id ? new Types.ObjectId(user.id) : undefined,
      promotedByName: user?.name,
    };

    await partner.save();

    await logActivity({
      action: "site_lead.partner_promoted",
      description: `Promoted website partner lead to ${officialCode}`,
      resourceType: "partner",
      resourceId: partner._id.toString(),
      userId: user?.id,
      userName: user?.name,
      metadata: { officialCode },
    });

    revalidatePath("/dashboard/site-leads");
    revalidatePath("/dashboard/partners");
    revalidatePath(`/dashboard/partners/${partner._id}`);
    revalidatePath("/dashboard/overview");
    revalidateInsightCaches();

    return {
      success: true,
      data: { partnerId: partner._id.toString(), officialCode },
    };
  });
}

export async function bulkPromoteSiteStudentLeadsAction(
  ids: string[]
): Promise<ActionResult<{ promoted: number; failed: number }>> {
  return runLoggedMutation("bulkPromoteSiteStudentLeadsAction", async () => {
    const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
    let promoted = 0;
    let failed = 0;

    for (const id of uniqueIds) {
      const result = await promoteSiteStudentLeadAction(id, new FormData());
      if (result.success) promoted += 1;
      else failed += 1;
    }

    return { success: true, data: { promoted, failed } };
  });
}

export async function bulkPromoteSitePartnerLeadsAction(
  ids: string[]
): Promise<ActionResult<{ promoted: number; failed: number }>> {
  return runLoggedMutation("bulkPromoteSitePartnerLeadsAction", async () => {
    const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
    let promoted = 0;
    let failed = 0;

    for (const id of uniqueIds) {
      const formData = new FormData();
      const result = await promoteSitePartnerLeadAction(id, formData);
      if (result.success) promoted += 1;
      else failed += 1;
    }

    return { success: true, data: { promoted, failed } };
  });
}

export async function bulkDeleteSiteStudentLeadsAction(
  ids: string[]
): Promise<ActionResult<{ deleted: number; failed: number }>> {
  return runLoggedMutation("bulkDeleteSiteStudentLeadsAction", async () => {
    const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
    let deleted = 0;
    let failed = 0;

    for (const id of uniqueIds) {
      const result = await deleteSiteStudentLeadAction(id);
      if (result.success) deleted += 1;
      else failed += 1;
    }

    return { success: true, data: { deleted, failed } };
  });
}

export async function bulkDeleteSitePartnerLeadsAction(
  ids: string[]
): Promise<ActionResult<{ deleted: number; failed: number }>> {
  return runLoggedMutation("bulkDeleteSitePartnerLeadsAction", async () => {
    const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
    let deleted = 0;
    let failed = 0;

    for (const id of uniqueIds) {
      const result = await deleteSitePartnerLeadAction(id);
      if (result.success) deleted += 1;
      else failed += 1;
    }

    return { success: true, data: { deleted, failed } };
  });
}

export async function exportSiteStudentLeadsCsvAction(search?: string): Promise<ActionResult<string>> {
  return runLoggedMutation("exportSiteStudentLeadsCsvAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.ADMISSIONS_READ);
    await connectDB();

    const baseFilter = mergeMongoFilter(
      websitePendingStudentLeadsFilter(),
      buildAdmissionVisibilityFilter(user)
    );
    const mongoFilter = search?.trim()
      ? mergeMongoFilter(baseFilter, {
          $or: [
            { firstName: toSafeRegExp(search) },
            { lastName: toSafeRegExp(search) },
            { phone: toSafeRegExp(search) },
            { email: toSafeRegExp(search) },
            { studentId: toSafeRegExp(search) },
          ],
        })
      : baseFilter;

    const leads = await Student.find(mongoFilter)
      .select(
        "studentId firstName lastName phone email targetCountry metadata.enquiryType metadata.loanAmountText metadata.preferredLender createdAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    const rows = [
      ["ID", "Name", "Phone", "Email", "Country", "Enquiry", "Loan amount", "Lender", "Submitted"],
      ...leads.map((lead) => [
        lead.studentId,
        `${lead.firstName} ${lead.lastName}`.trim(),
        lead.phone,
        lead.email,
        lead.targetCountry,
        lead.metadata?.enquiryType,
        lead.metadata?.loanAmountText,
        lead.metadata?.preferredLender,
        new Date(lead.createdAt).toISOString(),
      ]),
    ];

    return { success: true, data: buildCsv(rows) };
  });
}

export async function exportSitePartnerLeadsCsvAction(search?: string): Promise<ActionResult<string>> {
  return runLoggedMutation("exportSitePartnerLeadsCsvAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.PARTNERS_READ);
    await connectDB();
    await repairLegacyWebsitePartnerLeads();

    const baseFilter = websitePendingPartnerLeadsFilter();
    const mongoFilter = search?.trim()
      ? mergeMongoFilter(baseFilter, {
          $or: [
            { companyName: toSafeRegExp(search) },
            { owner: toSafeRegExp(search) },
            { phone: toSafeRegExp(search) },
            { email: toSafeRegExp(search) },
            { partnerCode: toSafeRegExp(search) },
          ],
        })
      : baseFilter;

    const leads = await Partner.find(mongoFilter)
      .select("partnerCode companyName owner phone email location.city metadata.formCity createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const rows = [
      ["ID", "Company", "Owner", "Phone", "Email", "City", "Submitted"],
      ...leads.map((lead) => [
        lead.partnerCode,
        lead.companyName,
        lead.owner,
        lead.phone,
        lead.email,
        lead.metadata?.formCity ?? lead.location?.city,
        new Date(lead.createdAt).toISOString(),
      ]),
    ];

    return { success: true, data: buildCsv(rows) };
  });
}
