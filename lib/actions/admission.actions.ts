"use server";

import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import { Student } from "@/models/Student";
import { getSessionUser } from "@/lib/auth/auth";
import { canViewAdmissionRevenue } from "@/lib/auth/page-access";
import { requirePermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/constants/permissions";
import {
  admissionLeadsFilter,
  manualAdmissionLeadsFilter,
  STUDENT_RECORD_TYPE,
} from "@/lib/constants/student-record-type";
import { toSafeRegExp, sanitizeText } from "@/lib/utils/sanitize";
import { normalizeLastName, formatPersonName } from "@/lib/utils/person-name";
import { normalizeIndianPhone } from "@/lib/validations/indian-fields";
import { runLoggedQuery, runLoggedMutation, emptyPaginated } from "@/lib/action-utils";
import { admissionRevenueSchema, leadSchema } from "@/lib/validations/schemas";
import { logActivity } from "@/lib/services/activity.service";
import {
  findStudentWithPhone,
  formatDuplicateStudentPhoneError,
} from "@/lib/services/student-phone.service";
import {
  buildAdmissionVisibilityFilter,
} from "@/lib/services/student-visibility.service";
import { mergeMongoFilter } from "@/lib/utils/mongo-filter";
import type { ActionResult, AdmissionListItem, PaginatedResult } from "@/types";

function resolveAssignedTo(
  assignedToId: string | undefined,
  existingAssignedTo?: Types.ObjectId,
  existingAssignedAt?: Date
): { assignedTo?: Types.ObjectId; assignedAt?: Date } {
  if (assignedToId === "") {
    return { assignedTo: undefined, assignedAt: undefined };
  }
  if (assignedToId) {
    return { assignedTo: new Types.ObjectId(assignedToId), assignedAt: new Date() };
  }
  return {
    assignedTo: existingAssignedTo,
    assignedAt: existingAssignedAt,
  };
}

export async function getAdmissions(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  targetCountry?: string;
  targetIntake?: string;
}): Promise<PaginatedResult<AdmissionListItem>> {
  return runLoggedQuery("getAdmissions", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.ADMISSIONS_READ);

    await connectDB();
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 10;
    const skip = (page - 1) * pageSize;

    const filter: Record<string, unknown> = {
      ...manualAdmissionLeadsFilter(),
    };

    if (params.search) {
      const regex = toSafeRegExp(params.search);
      filter.$or = [
        { firstName: regex },
        { lastName: regex },
        { phone: regex },
        { studentId: regex },
        { targetUniversity: regex },
      ];
    }
    if (params.targetCountry) filter.targetCountry = params.targetCountry;
    if (params.targetIntake) filter.targetIntake = params.targetIntake;

    const visibilityFilter = buildAdmissionVisibilityFilter(user);
    const mongoFilter = mergeMongoFilter(
      filter,
      visibilityFilter
    );

    const [data, total] = await Promise.all([
      Student.find(mongoFilter)
        .select(
          "studentId firstName lastName phone targetCountry targetIntake targetUniversity admissionRevenue recordType createdAt metadata.leadSource metadata.formPage metadata.enquiryType"
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
        targetCountry: entry.targetCountry,
        targetIntake: entry.targetIntake,
        targetUniversity: entry.targetUniversity,
        admissionRevenue: entry.admissionRevenue,
        recordType: entry.recordType,
        leadSource: entry.metadata?.leadSource,
        enquiryType: entry.metadata?.enquiryType,
        formPage: entry.metadata?.formPage,
        createdAt: entry.createdAt,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }, emptyPaginated(params.page ?? 1, params.pageSize ?? 10));
}

export async function updateAdmissionRevenueAction(
  formData: FormData
): Promise<ActionResult> {
  return runLoggedMutation("updateAdmissionRevenueAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.ADMISSIONS_WRITE);
    if (!canViewAdmissionRevenue(user?.role)) {
      return { success: false, error: "You do not have permission to update admission revenue" };
    }

    const parsed = admissionRevenueSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
    }

    await connectDB();
    const mongoFilter = mergeMongoFilter(
      { _id: parsed.data.studentId, ...admissionLeadsFilter() },
      buildAdmissionVisibilityFilter(user)
    );
    const existing = await Student.findOne(mongoFilter).select("_id").lean();
    if (!existing) {
      return { success: false, error: "Admission record not found" };
    }

    await Student.updateOne(
      { _id: parsed.data.studentId, recordType: STUDENT_RECORD_TYPE.ADMISSION },
      { $set: { admissionRevenue: parsed.data.admissionRevenue ?? 0 } }
    );

    const admission = await Student.findById(parsed.data.studentId)
      .select("studentId firstName lastName")
      .lean();

    await logActivity({
      action: "admission.revenue_updated",
      description: `Admission revenue for ${admission?.studentId ?? parsed.data.studentId} set to INR ${(parsed.data.admissionRevenue ?? 0).toLocaleString("en-IN")}`,
      resourceType: "admission",
      resourceId: parsed.data.studentId,
      userId: user?.id,
      userName: user?.name,
      metadata: {
        studentId: admission?.studentId,
        studentName: admission
          ? formatPersonName(admission.firstName, admission.lastName)
          : undefined,
        admissionRevenue: parsed.data.admissionRevenue ?? 0,
      },
    });

    revalidatePath("/dashboard/admissions");
    return { success: true };
  });
}

export async function getAdmissionById(id: string) {
  return runLoggedQuery("getAdmissionById", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.ADMISSIONS_READ);

    await connectDB();
    const mongoFilter = mergeMongoFilter(
      { _id: id, ...admissionLeadsFilter() },
      buildAdmissionVisibilityFilter(user)
    );
    const admission = await Student.findOne(mongoFilter)
      .populate("assignedTo", "name")
      .lean();
    if (!admission) return null;

    return {
      _id: admission._id.toString(),
      studentId: admission.studentId,
      firstName: admission.firstName,
      lastName: normalizeLastName(admission.lastName),
      phone: admission.phone,
      email: admission.email,
      targetCountry: admission.targetCountry,
      targetIntake: admission.targetIntake,
      targetUniversity: admission.targetUniversity,
      course: admission.education?.course,
      admissionRevenue: admission.admissionRevenue,
      leadSource: admission.metadata?.leadSource,
      enquiryType: admission.metadata?.enquiryType,
      formPage: admission.metadata?.formPage,
      createdByName: admission.metadata?.createdByName,
      initialNote: admission.notes?.[0]?.content,
      loanRequired: Boolean(admission.loan?.requested && admission.loan.requested > 0),
      assignedTo:
        admission.assignedTo && typeof admission.assignedTo === "object" && "name" in admission.assignedTo
          ? { _id: String(admission.assignedTo._id), name: String(admission.assignedTo.name) }
          : null,
      createdAt: admission.createdAt,
    };
  }, null);
}

export async function getAdmissionForEdit(id: string) {
  return runLoggedQuery("getAdmissionForEdit", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.ADMISSIONS_WRITE);

    await connectDB();
    const mongoFilter = mergeMongoFilter(
      { _id: id, ...admissionLeadsFilter() },
      buildAdmissionVisibilityFilter(user)
    );
    const admission = await Student.findOne(mongoFilter)
      .populate("assignedTo", "name")
      .lean();
    if (!admission) return null;

    const assignedToId =
      admission.assignedTo && typeof admission.assignedTo === "object" && "_id" in admission.assignedTo
        ? String(admission.assignedTo._id)
        : admission.assignedTo
          ? String(admission.assignedTo)
          : "";

    return {
      _id: admission._id.toString(),
      studentId: admission.studentId,
      firstName: admission.firstName,
      lastName: normalizeLastName(admission.lastName),
      phone: admission.phone,
      targetCountry: admission.targetCountry ?? "",
      targetIntake: admission.targetIntake ?? "",
      targetUniversity: admission.targetUniversity ?? "",
      admissionRevenue: admission.admissionRevenue,
      assignedToId,
      assignedToName:
        admission.assignedTo && typeof admission.assignedTo === "object" && "name" in admission.assignedTo
          ? String(admission.assignedTo.name)
          : undefined,
    };
  }, null);
}

export async function updateAdmissionAction(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  return runLoggedMutation("updateAdmissionAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.ADMISSIONS_WRITE);

    const parsed = leadSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
    }

    await connectDB();
    const mongoFilter = mergeMongoFilter(
      { _id: id, ...admissionLeadsFilter() },
      buildAdmissionVisibilityFilter(user)
    );
    const existing = await Student.findOne(mongoFilter);
    if (!existing) {
      return { success: false, error: "Admission record not found" };
    }

    if (parsed.data.phone?.trim()) {
      const phoneDuplicate = await findStudentWithPhone(parsed.data.phone, id);
      if (phoneDuplicate) {
        return { success: false, error: formatDuplicateStudentPhoneError(phoneDuplicate) };
      }
    }

    const assignment = resolveAssignedTo(
      parsed.data.assignedToId,
      existing.assignedTo,
      existing.assignedAt
    );

    const updateDoc: {
      $set: Record<string, unknown>;
      $unset?: Record<string, 1>;
    } = {
      $set: {
        firstName: sanitizeText(parsed.data.firstName),
        lastName: normalizeLastName(sanitizeText(parsed.data.lastName ?? "")),
        phone: parsed.data.phone?.trim()
          ? normalizeIndianPhone(parsed.data.phone)
          : undefined,
        targetCountry: parsed.data.targetCountry?.trim() || undefined,
        targetIntake: parsed.data.targetIntake?.trim() || undefined,
        targetUniversity: parsed.data.targetUniversity?.trim() || undefined,
        admissionRevenue: parsed.data.admissionRevenue ?? existing.admissionRevenue ?? 0,
      },
    };

    if (parsed.data.assignedToId === "") {
      updateDoc.$unset = { assignedTo: 1, assignedAt: 1 };
    } else if (assignment.assignedTo) {
      updateDoc.$set.assignedTo = assignment.assignedTo;
      updateDoc.$set.assignedAt = assignment.assignedAt;
    }

    await Student.updateOne({ _id: id, recordType: STUDENT_RECORD_TYPE.ADMISSION }, updateDoc);

    await logActivity({
      action: "admission.updated",
      description: `Admission lead ${existing.studentId} (${formatPersonName(parsed.data.firstName, parsed.data.lastName)}) was updated`,
      resourceType: "admission",
      resourceId: id,
      userId: user?.id,
      userName: user?.name,
      metadata: {
        studentId: existing.studentId,
        targetCountry: parsed.data.targetCountry,
        targetIntake: parsed.data.targetIntake,
        targetUniversity: parsed.data.targetUniversity,
        admissionRevenue: parsed.data.admissionRevenue ?? existing.admissionRevenue ?? 0,
      },
    });

    revalidatePath("/dashboard/admissions");
    revalidatePath(`/dashboard/admissions/${id}`);
    return { success: true };
  });
}
