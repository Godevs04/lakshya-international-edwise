"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db/mongoose";
import { Application } from "@/models/Application";
import { Student } from "@/models/Student";
import { getSessionUser } from "@/lib/auth/auth";
import { requirePermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { logActivity } from "@/lib/services/activity.service";
import { revalidateInsightCaches } from "@/lib/cache/revalidate";
import { runLoggedMutation, runLoggedQuery, emptyPaginated } from "@/lib/action-utils";
import { toSafeRegExp } from "@/lib/utils/sanitize";
import type { ActionResult, ApplicationListItem, PaginatedResult } from "@/types";
import type { ApplicationStatus } from "@/lib/constants/statuses";

const PIPELINE_LIMIT = 300;

function mapApplication(a: {
  _id: { toString(): string };
  studentId: unknown;
  partnerId?: unknown;
  loanAmount?: number;
  status: string;
  priority?: string;
  dueDate?: Date;
  createdAt: Date;
}): ApplicationListItem {
  const student = a.studentId as {
    firstName: string;
    lastName: string;
    studentId: string;
  } | null;
  const partner = a.partnerId as { companyName?: string } | null;

  return {
    _id: a._id.toString(),
    studentId: student?.studentId ?? "",
    studentName: student ? `${student.firstName} ${student.lastName}` : "Unknown",
    partnerName: partner?.companyName,
    loanAmount: a.loanAmount ?? 0,
    status: a.status as ApplicationStatus,
    priority: a.priority,
    dueDate: a.dueDate,
    createdAt: a.createdAt,
  };
}

export async function getApplications(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  pipeline?: boolean;
} = {}): Promise<PaginatedResult<ApplicationListItem>> {
  return runLoggedQuery(
    "getApplications",
    async () => {
      const user = await getSessionUser();
      requirePermission(user, PERMISSIONS.APPLICATIONS_READ);

      await connectDB();

      const pipeline = params.pipeline === true;
      const page = params.page ?? 1;
      const pageSize = pipeline ? PIPELINE_LIMIT : (params.pageSize ?? 20);
      const skip = (page - 1) * pageSize;
      const filter: Record<string, unknown> = {};

      if (params.status) {
        filter.status = params.status;
      }

      if (params.search) {
        const regex = toSafeRegExp(params.search);
        const matchingStudents = await Student.find({
          $or: [
            { firstName: regex },
            { lastName: regex },
            { studentId: regex },
            { phone: regex },
          ],
        })
          .select("_id")
          .limit(100)
          .lean();

        filter.studentId = { $in: matchingStudents.map((s) => s._id) };
      }

      const [data, total] = await Promise.all([
        Application.find(filter)
          .populate("studentId", "firstName lastName studentId")
          .populate("partnerId", "companyName")
          .sort({ updatedAt: -1 })
          .skip(skip)
          .limit(pageSize)
          .lean(),
        Application.countDocuments(filter),
      ]);

      return {
        data: data.map(mapApplication),
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    },
    emptyPaginated(params.page ?? 1, params.pageSize ?? 20)
  );
}

export async function updateApplicationStatusAction(
  applicationId: string,
  newStatus: ApplicationStatus
): Promise<ActionResult> {
  return runLoggedMutation("updateApplicationStatusAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.APPLICATIONS_WRITE);

    await connectDB();
    const app = await Application.findById(applicationId);
    if (!app) return { success: false, error: "Application not found" };

    const oldStatus = app.status;
    app.status = newStatus;
    app.pipelineStage = newStatus;
    await app.save();

    await Student.findByIdAndUpdate(app.studentId, {
      status: newStatus,
      $push: {
        timeline: {
          status: newStatus,
          note: `Status changed from ${oldStatus} to ${newStatus}`,
          createdBy: user?.id,
          createdByName: user?.name,
          createdAt: new Date(),
        },
      },
    });

    await logActivity({
      action: "application.status_changed",
      description: `Application status changed from ${oldStatus} to ${newStatus}`,
      resourceType: "application",
      resourceId: applicationId,
      userId: user?.id,
      userName: user?.name,
    });

    revalidateInsightCaches();
    revalidatePath("/dashboard/applications");
    revalidatePath("/dashboard/overview");
    return { success: true };
  });
}

export async function updateApplicationPriorityAction(
  applicationId: string,
  priority: "low" | "medium" | "high" | "urgent"
): Promise<ActionResult> {
  return runLoggedMutation("updateApplicationPriorityAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.APPLICATIONS_WRITE);

    await connectDB();
    const app = await Application.findById(applicationId);
    if (!app) return { success: false, error: "Application not found" };

    const oldPriority = app.priority;
    app.priority = priority;
    await app.save();

    await logActivity({
      action: "application.priority_changed",
      description: `Application priority changed from ${oldPriority ?? "unset"} to ${priority}`,
      resourceType: "application",
      resourceId: applicationId,
      userId: user?.id,
      userName: user?.name,
      metadata: { oldPriority, priority },
    });

    revalidatePath("/dashboard/applications");
    return { success: true };
  });
}
