"use server";

import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import { Task } from "@/models/Task";
import { Student } from "@/models/Student";
import { getSessionUser } from "@/lib/auth/auth";
import { requirePermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { taskSchema, updateTaskSchema } from "@/lib/validations/schemas";
import { logActivity } from "@/lib/services/activity.service";
import { createNotification } from "@/lib/services/notification.service";
import { sendTaskAssignedEmail } from "@/lib/services/email.service";
import { getPublicAuthUrl } from "@/lib/config/env";
import { User } from "@/models/User";
import { runLoggedMutation, runLoggedQuery, emptyPaginated } from "@/lib/action-utils";
import type { ActionResult, PaginatedResult, TaskListItem } from "@/types";

const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;

function isObjectId(value?: string | null): value is string {
  return Boolean(value?.trim() && OBJECT_ID_REGEX.test(value.trim()));
}

function toObjectId(value: string): Types.ObjectId {
  return new Types.ObjectId(value.trim());
}

async function resolveTaskStudentId(
  raw?: string
): Promise<Types.ObjectId | undefined | null> {
  const trimmed = raw?.trim();
  if (!trimmed) return undefined;

  if (isObjectId(trimmed)) {
    const student = await Student.findById(trimmed).select("_id").lean();
    return student?._id ?? null;
  }

  const student = await Student.findOne({ studentId: trimmed }).select("_id").lean();
  return student?._id ?? null;
}

async function notifyTaskAssignee(params: {
  assigneeId: string;
  title: string;
  dueAt: Date;
  assignedById?: string;
  assignedByName?: string;
  studentId?: string;
  isReassignment?: boolean;
}) {
  if (params.assignedById && params.assigneeId === params.assignedById) {
    return;
  }

  const assignee = await User.findOne({ _id: params.assigneeId, status: "active" })
    .select("_id email name")
    .lean();
  if (!assignee) return;

  const link = params.studentId
    ? `/dashboard/students/${params.studentId}`
    : "/dashboard/tasks?status=open&mine=1";

  await createNotification({
    userId: assignee._id,
    type: "info",
    title: params.isReassignment ? `Task reassigned: ${params.title}` : `New task: ${params.title}`,
    body: params.assignedByName
      ? `${params.assignedByName} assigned this to you. Due ${params.dueAt.toLocaleString("en-IN")}.`
      : `Due ${params.dueAt.toLocaleString("en-IN")}.`,
    link,
  });

  if (assignee.email) {
    const authUrl = getPublicAuthUrl();
    await sendTaskAssignedEmail({
      email: assignee.email,
      name: assignee.name,
      taskTitle: params.title,
      assignedByName: params.assignedByName,
      dueAt: params.dueAt,
      taskUrl: `${authUrl}${link}`,
    });
  }
}

export async function getTaskSummary(): Promise<{
  myOpen: number;
  overdue: number;
  dueToday: number;
}> {
  return runLoggedQuery(
    "getTaskSummary",
    async () => {
      const user = await getSessionUser();
      requirePermission(user, PERMISSIONS.STUDENTS_READ);

      await connectDB();
      const now = new Date();
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);

      const userId = user?.id && isObjectId(user.id) ? toObjectId(user.id) : null;
      const openFilter = { status: "open" as const };

      const [myOpen, overdue, dueToday] = await Promise.all([
        userId
          ? Task.countDocuments({ ...openFilter, assignedTo: userId })
          : Promise.resolve(0),
        Task.countDocuments({ ...openFilter, dueAt: { $lt: now } }),
        Task.countDocuments({
          ...openFilter,
          dueAt: { $gte: startOfDay, $lte: endOfDay },
        }),
      ]);

      return { myOpen, overdue, dueToday };
    },
    { myOpen: 0, overdue: 0, dueToday: 0 }
  );
}

export async function getTasks(params: {
  page?: number;
  pageSize?: number;
  status?: string;
  mine?: boolean;
  overdue?: boolean;
  dueToday?: boolean;
  assigneeId?: string;
}): Promise<PaginatedResult<TaskListItem>> {
  return runLoggedQuery("getTasks", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.STUDENTS_READ);

    await connectDB();
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 10;
    const skip = (page - 1) * pageSize;

    const filter: Record<string, unknown> = {};
    const now = new Date();

    if (params.status) filter.status = params.status;
    if (params.mine && user?.id && isObjectId(user.id)) {
      filter.assignedTo = toObjectId(user.id);
    }
    if (params.assigneeId && isObjectId(params.assigneeId)) {
      filter.assignedTo = toObjectId(params.assigneeId);
    }
    if (params.overdue) {
      filter.status = "open";
      filter.dueAt = { $lt: now };
    }
    if (params.dueToday) {
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      filter.status = "open";
      filter.dueAt = { $gte: startOfDay, $lte: endOfDay };
    }

    const [data, total] = await Promise.all([
      Task.find(filter)
        .populate("assignedTo", "name")
        .populate("studentId", "firstName lastName studentId")
        .sort({ dueAt: 1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Task.countDocuments(filter),
    ]);

    return {
      data: data.map((task) => {
        const student = task.studentId as {
          firstName?: string;
          lastName?: string;
          studentId?: string;
          _id?: Types.ObjectId;
        } | null;

        return {
          _id: task._id.toString(),
          title: task.title,
          description: task.description,
          studentId: student?._id?.toString(),
          studentCode: student?.studentId,
          studentName: student
            ? `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim()
            : undefined,
          assignedToId: (task.assignedTo as { _id?: Types.ObjectId } | null)?._id?.toString(),
          assignedToName: (task.assignedTo as { name?: string } | null)?.name,
          createdByName: task.metadata?.createdByName,
          dueAt: task.dueAt,
          reminderAt: task.reminderAt,
          status: task.status,
          isOverdue: task.status === "open" && task.dueAt < now,
          createdAt: task.createdAt,
        };
      }),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }, emptyPaginated(params.page ?? 1, params.pageSize ?? 10));
}

export async function createTaskAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  return runLoggedMutation("createTaskAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.STUDENTS_WRITE);

    const raw = Object.fromEntries(formData.entries());
    const parsed = taskSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
    }

    await connectDB();
    const data = parsed.data;

    const assignedToId = data.assignedToId.trim();
    if (!isObjectId(assignedToId)) {
      return { success: false, error: "Please select a valid assignee" };
    }

    const studentObjectId = await resolveTaskStudentId(data.studentId);
    if (studentObjectId === null) {
      return { success: false, error: "Linked student not found. Use a student ID (e.g. STU-001) or profile ID." };
    }

    const task = await Task.create({
      title: data.title.trim(),
      description: data.description?.trim() || undefined,
      studentId: studentObjectId,
      assignedTo: toObjectId(assignedToId),
      dueAt: new Date(data.dueAt),
      reminderAt: data.reminderAt?.trim() ? new Date(data.reminderAt) : undefined,
      status: "open",
      metadata: {
        createdBy: isObjectId(user?.id) ? toObjectId(user.id) : undefined,
        createdByName: user?.name,
      },
    });

    await logActivity({
      action: "task.created",
      description: `Task "${data.title}" was created`,
      resourceType: "task",
      resourceId: task._id.toString(),
      userId: user?.id,
      userName: user?.name,
    });

    await notifyTaskAssignee({
      assigneeId: assignedToId,
      title: data.title.trim(),
      dueAt: task.dueAt,
      assignedById: user?.id,
      assignedByName: user?.name,
      studentId: studentObjectId?.toString(),
    });

    revalidatePath("/dashboard/tasks");
    return { success: true, data: { id: task._id.toString() } };
  });
}

export async function updateTaskStatusAction(
  id: string,
  status: "open" | "done" | "cancelled"
): Promise<ActionResult> {
  return runLoggedMutation("updateTaskStatusAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.STUDENTS_WRITE);

    await connectDB();
    const task = await Task.findByIdAndUpdate(id, { status }, { new: true });
    if (!task) return { success: false, error: "Task not found" };

    await logActivity({
      action: "task.status_changed",
      description: `Task "${task.title}" marked as ${status}`,
      resourceType: "task",
      resourceId: id,
      userId: user?.id,
      userName: user?.name,
      metadata: { status },
    });

    revalidatePath("/dashboard/tasks");
    return { success: true };
  });
}

export async function updateTaskAction(formData: FormData): Promise<ActionResult> {
  return runLoggedMutation("updateTaskAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.STUDENTS_WRITE);

    const raw = Object.fromEntries(formData.entries());
    const parsed = updateTaskSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
    }

    await connectDB();
    const data = parsed.data;

    const existing = await Task.findById(data.taskId);
    if (!existing) return { success: false, error: "Task not found" };
    if (existing.status !== "open") {
      return { success: false, error: "Only open tasks can be edited" };
    }

    const assignedToId = data.assignedToId.trim();
    if (!isObjectId(assignedToId)) {
      return { success: false, error: "Please select a valid assignee" };
    }

    const studentObjectId = await resolveTaskStudentId(data.studentId);
    if (studentObjectId === null) {
      return { success: false, error: "Linked student not found. Use a student ID (e.g. STU-001) or profile ID." };
    }

    const previousAssigneeId = existing.assignedTo?.toString();
    const previousReminderAt = existing.reminderAt?.getTime();

    existing.title = data.title.trim();
    existing.description = data.description?.trim() || undefined;
    if (studentObjectId) {
      existing.studentId = studentObjectId;
    } else {
      existing.set("studentId", undefined);
    }
    existing.assignedTo = toObjectId(assignedToId);
    existing.dueAt = new Date(data.dueAt);
    const nextReminderAt = data.reminderAt?.trim() ? new Date(data.reminderAt) : undefined;
    existing.reminderAt = nextReminderAt;
    if (nextReminderAt?.getTime() !== previousReminderAt) {
      existing.set("reminderSentAt", undefined);
    }
    await existing.save();

    if (previousAssigneeId !== assignedToId) {
      await notifyTaskAssignee({
        assigneeId: assignedToId,
        title: data.title.trim(),
        dueAt: existing.dueAt,
        assignedById: user?.id,
        assignedByName: user?.name,
        studentId: studentObjectId?.toString(),
        isReassignment: true,
      });
    }

    await logActivity({
      action: "task.updated",
      description: `Task "${data.title}" was updated`,
      resourceType: "task",
      resourceId: existing._id.toString(),
      userId: user?.id,
      userName: user?.name,
    });

    revalidatePath("/dashboard/tasks");
    return { success: true };
  });
}

export async function assignTaskToMeAction(taskId: string): Promise<ActionResult> {
  return runLoggedMutation("assignTaskToMeAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.STUDENTS_WRITE);
    if (!user?.id || !isObjectId(user.id)) {
      return { success: false, error: "Invalid session" };
    }

    await connectDB();
    const task = await Task.findById(taskId);
    if (!task) return { success: false, error: "Task not found" };
    if (task.status !== "open") {
      return { success: false, error: "Only open tasks can be reassigned" };
    }

    const previousAssigneeId = task.assignedTo?.toString();
    task.assignedTo = toObjectId(user.id);
    await task.save();

    if (previousAssigneeId !== user.id) {
      await notifyTaskAssignee({
        assigneeId: user.id,
        title: task.title,
        dueAt: task.dueAt,
        assignedById: user.id,
        assignedByName: user.name,
        studentId: task.studentId?.toString(),
        isReassignment: true,
      });
    }

    await logActivity({
      action: "task.assigned_to_me",
      description: `Task "${task.title}" assigned to ${user.name}`,
      resourceType: "task",
      resourceId: taskId,
      userId: user?.id,
      userName: user?.name,
    });

    revalidatePath("/dashboard/tasks");
    return { success: true };
  });
}

export async function deleteTaskAction(id: string): Promise<ActionResult> {
  return runLoggedMutation("deleteTaskAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.STUDENTS_WRITE);

    await connectDB();
    const task = await Task.findByIdAndDelete(id);
    if (!task) return { success: false, error: "Task not found" };

    await logActivity({
      action: "task.deleted",
      description: `Task "${task.title}" was deleted`,
      resourceType: "task",
      resourceId: id,
      userId: user?.id,
      userName: user?.name,
    });

    revalidatePath("/dashboard/tasks");
    return { success: true };
  });
}
