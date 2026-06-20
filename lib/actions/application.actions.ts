"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db/mongoose";
import { Application } from "@/models/Application";
import { Student } from "@/models/Student";
import { getSessionUser } from "@/lib/auth/auth";
import { requirePermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { logActivity } from "@/lib/services/activity.service";
import { runLoggedMutation, runLoggedQuery } from "@/lib/action-utils";
import type { ActionResult, ApplicationListItem } from "@/types";
import type { ApplicationStatus } from "@/lib/constants/statuses";

export async function getApplications(): Promise<ApplicationListItem[]> {
  return runLoggedQuery("getApplications", async () => {
    await connectDB();
    const apps = await Application.find()
      .populate("studentId", "firstName lastName studentId")
      .populate("partnerId", "companyName")
      .sort({ createdAt: -1 })
      .lean();

    return apps.map((a) => {
      const student = a.studentId as unknown as {
        _id: string;
        firstName: string;
        lastName: string;
        studentId: string;
      } | null;
      const partner = a.partnerId as unknown as { companyName?: string } | null;
      return {
        _id: a._id.toString(),
        studentId: student?.studentId ?? "",
        studentName: student ? `${student.firstName} ${student.lastName}` : "Unknown",
        partnerName: partner?.companyName,
        loanAmount: a.loanAmount,
        status: a.status as ApplicationStatus,
        priority: a.priority,
        dueDate: a.dueDate,
        createdAt: a.createdAt,
      };
    });
  }, []);
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
    await Application.findByIdAndUpdate(applicationId, { priority });
    revalidatePath("/dashboard/applications");
    return { success: true };
  });
}
