import { connectDB } from "@/lib/db/mongoose";
import { getPublicAuthUrl } from "@/lib/config/env";
import { Task } from "@/models/Task";
import { User } from "@/models/User";
import { sendTaskReminderEmail } from "@/lib/services/email.service";
import { createNotification } from "@/lib/services/notification.service";
import { logger } from "@/lib/logger";
import type { Types } from "mongoose";

export interface TaskReminderSummary {
  processed: number;
  notified: number;
  emailed: number;
  skipped: number;
}

interface DueTaskReminder {
  _id: string;
  title: string;
  description?: string;
  dueAt: Date;
  reminderAt: Date;
  assignedToId: string;
  studentId?: string;
  studentCode?: string;
  studentName?: string;
}

export async function getTasksNeedingReminder(): Promise<DueTaskReminder[]> {
  await connectDB();
  const now = new Date();

  const rows = await Task.find({
    status: "open",
    reminderAt: { $lte: now, $ne: null },
    $or: [{ reminderSentAt: { $exists: false } }, { reminderSentAt: null }],
  })
    .populate("assignedTo", "name email")
    .populate("studentId", "firstName lastName studentId")
    .sort({ reminderAt: 1 })
    .lean();

  return rows.map((task) => {
    const assignee = task.assignedTo as { _id?: Types.ObjectId; name?: string } | null;
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
      dueAt: task.dueAt,
      reminderAt: task.reminderAt!,
      assignedToId: assignee?._id?.toString() ?? task.assignedTo.toString(),
      studentId: student?._id?.toString(),
      studentCode: student?.studentId,
      studentName: student
        ? `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim()
        : undefined,
    };
  });
}

export async function sendTaskReminders(): Promise<TaskReminderSummary> {
  const tasks = await getTasksNeedingReminder();
  const summary: TaskReminderSummary = {
    processed: 0,
    notified: 0,
    emailed: 0,
    skipped: 0,
  };

  const authUrl = getPublicAuthUrl();

  for (const task of tasks) {
    summary.processed++;

    const assignee = await User.findOne({ _id: task.assignedToId, status: "active" })
      .select("_id email name")
      .lean();

    if (!assignee) {
      summary.skipped++;
      continue;
    }

    const taskUrl = `${authUrl}/dashboard/tasks?status=open`;
    const dueLabel = task.dueAt.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    let body = task.description?.trim() || `Due ${dueLabel}`;
    if (task.studentName) {
      body = `${task.studentName}${task.studentCode ? ` (${task.studentCode})` : ""} — ${body}`;
    }

    await createNotification({
      userId: assignee._id,
      type: "reminder",
      title: `Task reminder: ${task.title}`,
      body,
      link: task.studentId
        ? `/dashboard/students/${task.studentId}`
        : "/dashboard/tasks?status=open",
    });
    summary.notified++;

    if (assignee.email) {
      const emailed = await sendTaskReminderEmail({
        email: assignee.email,
        name: assignee.name,
        taskTitle: task.title,
        taskDescription: task.description,
        dueAt: task.dueAt,
        studentName: task.studentName,
        studentCode: task.studentCode,
        taskUrl: task.studentId
          ? `${authUrl}/dashboard/students/${task.studentId}`
          : taskUrl,
      });
      if (emailed) summary.emailed++;
    }

    await Task.updateOne({ _id: task._id }, { $set: { reminderSentAt: new Date() } });
  }

  logger.info("Task reminders processed", summary);
  return summary;
}
