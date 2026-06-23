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

export async function getTasks(params: {
  page?: number;
  pageSize?: number;
  status?: string;
  mine?: boolean;
}): Promise<PaginatedResult<TaskListItem>> {
  return runLoggedQuery("getTasks", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.STUDENTS_READ);

    await connectDB();
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 10;
    const skip = (page - 1) * pageSize;

    const filter: Record<string, unknown> = {};
    if (params.status) filter.status = params.status;
    if (params.mine && user?.id) filter.assignedTo = new Types.ObjectId(user.id);

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
          dueAt: task.dueAt,
          reminderAt: task.reminderAt,
          status: task.status,
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

    existing.title = data.title.trim();
    existing.description = data.description?.trim() || undefined;
    if (studentObjectId) {
      existing.studentId = studentObjectId;
    } else {
      existing.set("studentId", undefined);
    }
    existing.assignedTo = toObjectId(assignedToId);
    existing.dueAt = new Date(data.dueAt);
    existing.reminderAt = data.reminderAt?.trim() ? new Date(data.reminderAt) : undefined;
    await existing.save();

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

export async function deleteTaskAction(id: string): Promise<ActionResult> {
  return runLoggedMutation("deleteTaskAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.STUDENTS_WRITE);

    await connectDB();
    const task = await Task.findByIdAndDelete(id);
    if (!task) return { success: false, error: "Task not found" };

    revalidatePath("/dashboard/tasks");
    return { success: true };
  });
}
