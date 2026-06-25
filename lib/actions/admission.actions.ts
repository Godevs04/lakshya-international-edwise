"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db/mongoose";
import { Student } from "@/models/Student";
import { getSessionUser } from "@/lib/auth/auth";
import { canViewAdmissionRevenue } from "@/lib/auth/page-access";
import { requirePermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { admissionLeadsFilter, STUDENT_RECORD_TYPE } from "@/lib/constants/student-record-type";
import { toSafeRegExp } from "@/lib/utils/sanitize";
import { runLoggedQuery, runLoggedMutation, emptyPaginated } from "@/lib/action-utils";
import { admissionRevenueSchema } from "@/lib/validations/schemas";
import type { ActionResult, AdmissionListItem, PaginatedResult } from "@/types";

export async function getAdmissions(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  targetCountry?: string;
  targetIntake?: string;
}): Promise<PaginatedResult<AdmissionListItem>> {
  return runLoggedQuery("getAdmissions", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.STUDENTS_READ);

    await connectDB();
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 10;
    const skip = (page - 1) * pageSize;

    const filter: Record<string, unknown> = {
      ...admissionLeadsFilter(),
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

    const [data, total] = await Promise.all([
      Student.find(filter)
        .select(
          "studentId firstName lastName phone targetCountry targetIntake targetUniversity admissionRevenue recordType createdAt"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Student.countDocuments(filter),
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
    requirePermission(user, PERMISSIONS.STUDENTS_WRITE);
    if (!canViewAdmissionRevenue(user?.role)) {
      return { success: false, error: "You do not have permission to update admission revenue" };
    }

    const parsed = admissionRevenueSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
    }

    await connectDB();
    const student = await Student.findById(parsed.data.studentId);
    if (!student) {
      return { success: false, error: "Admission record not found" };
    }
    if (student.recordType !== STUDENT_RECORD_TYPE.ADMISSION) {
      return { success: false, error: "This record is not an admission lead" };
    }

    student.admissionRevenue = parsed.data.admissionRevenue ?? 0;
    await student.save();

    revalidatePath("/dashboard/admissions");
    return { success: true };
  });
}
