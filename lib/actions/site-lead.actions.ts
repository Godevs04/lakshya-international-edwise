"use server";

import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import { Student } from "@/models/Student";
import { Partner } from "@/models/Partner";
import { Application } from "@/models/Application";
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
import { logActivity } from "@/lib/services/activity.service";
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
        ],
      });
    }

    const [data, total] = await Promise.all([
      Student.find(mongoFilter)
        .select(
          "studentId firstName lastName phone email targetCountry metadata.enquiryType metadata.formPage metadata.promotionStatus createdAt notes"
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
          "partnerCode companyName owner phone email location.city metadata.isOwner metadata.formCity metadata.promotionStatus createdAt"
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
    ).lean();

    if (!student) return null;

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
      notes: (student.notes ?? []).map((note) => ({
        content: note.content,
        createdByName: note.createdByName,
        createdAt: note.createdAt ? new Date(note.createdAt).toISOString() : undefined,
      })),
      createdAt: new Date(student.createdAt).toISOString(),
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
