"use server";

import { connectDB } from "@/lib/db/mongoose";
import { Student } from "@/models/Student";
import { getSessionUser } from "@/lib/auth/auth";
import { requirePermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { toSafeRegExp } from "@/lib/utils/sanitize";
import { runLoggedQuery, emptyPaginated } from "@/lib/action-utils";
import type { AdmissionListItem, PaginatedResult } from "@/types";

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

    const filter: Record<string, unknown> = {};

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
