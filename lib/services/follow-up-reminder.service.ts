import { endOfDay } from "date-fns";
import { connectDB } from "@/lib/db/mongoose";
import { Student } from "@/models/Student";
import { User } from "@/models/User";
import { sendFollowUpReminderEmail } from "@/lib/services/email.service";
import { createNotification } from "@/lib/services/notification.service";
import { logger } from "@/lib/logger";
import { ROLE_PERMISSIONS, PERMISSIONS } from "@/lib/constants/permissions";
import type { UserRole } from "@/types";

export interface DueFollowUp {
  studentId: string;
  studentCode: string;
  firstName: string;
  lastName: string;
  noteId: string;
  noteContent: string;
  dueDate: Date;
  assigneeId?: string;
}

export interface FollowUpReminderSummary {
  processed: number;
  emailed: number;
  notified: number;
  skipped: number;
}

function roleHasStudentsWrite(role: UserRole): boolean {
  const perms = ROLE_PERMISSIONS[role];
  if (perms[0] === "*") return true;
  return (perms as string[]).includes(PERMISSIONS.STUDENTS_WRITE);
}

export async function getFollowUpsNeedingReminder(): Promise<DueFollowUp[]> {
  await connectDB();
  const cutoff = endOfDay(new Date());

  const rows = await Student.aggregate([
    { $unwind: "$notes" },
    {
      $match: {
        "notes.dueDate": { $lte: cutoff, $ne: null },
        $or: [
          { "notes.reminderSentAt": { $exists: false } },
          { "notes.reminderSentAt": null },
        ],
      },
    },
    {
      $project: {
        studentId: "$_id",
        studentCode: "$studentId",
        firstName: 1,
        lastName: 1,
        noteId: "$notes._id",
        noteContent: "$notes.content",
        dueDate: "$notes.dueDate",
        assigneeId: {
          $ifNull: ["$notes.createdBy", "$metadata.createdBy"],
        },
      },
    },
    { $sort: { dueDate: 1 } },
  ]);

  return rows.map((row) => ({
    studentId: row.studentId.toString(),
    studentCode: row.studentCode,
    firstName: row.firstName,
    lastName: row.lastName,
    noteId: row.noteId.toString(),
    noteContent: row.noteContent,
    dueDate: row.dueDate,
    assigneeId: row.assigneeId?.toString(),
  }));
}

async function resolveRecipients(assigneeId?: string): Promise<Array<{ _id: string; email: string; name: string }>> {
  await connectDB();

  if (assigneeId) {
    const assignee = await User.findOne({ _id: assigneeId, status: "active" })
      .select("_id email name")
      .lean();
    if (assignee?.email) {
      return [{ _id: assignee._id.toString(), email: assignee.email, name: assignee.name }];
    }
  }

  const users = await User.find({ status: "active" }).select("_id email name role").lean();
  return users
    .filter((user) => roleHasStudentsWrite(user.role as UserRole) && user.email)
    .map((user) => ({
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
    }));
}

export async function sendFollowUpReminders(): Promise<FollowUpReminderSummary> {
  const followUps = await getFollowUpsNeedingReminder();
  const summary: FollowUpReminderSummary = {
    processed: 0,
    emailed: 0,
    notified: 0,
    skipped: 0,
  };

  const authUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:4000";

  for (const followUp of followUps) {
    summary.processed++;
    const recipients = await resolveRecipients(followUp.assigneeId);

    if (recipients.length === 0) {
      summary.skipped++;
      continue;
    }

    const studentName = `${followUp.firstName} ${followUp.lastName}`;
    const studentUrl = `${authUrl}/dashboard/students/${followUp.studentId}`;
    let delivered = false;

    for (const recipient of recipients) {
      const emailed = await sendFollowUpReminderEmail({
        email: recipient.email,
        name: recipient.name,
        studentName,
        studentCode: followUp.studentCode,
        note: followUp.noteContent,
        dueDate: followUp.dueDate,
        studentUrl,
      });

      if (emailed) {
        summary.emailed++;
        delivered = true;
      }

      await createNotification({
        userId: recipient._id,
        type: "reminder",
        title: `Follow-up due: ${studentName}`,
        body: followUp.noteContent,
        link: `/dashboard/students/${followUp.studentId}`,
      });
      summary.notified++;
    }

    if (delivered || recipients.length > 0) {
      await Student.updateOne(
        { _id: followUp.studentId, "notes._id": followUp.noteId },
        { $set: { "notes.$.reminderSentAt": new Date() } }
      );
    } else {
      summary.skipped++;
    }
  }

  logger.info("Follow-up reminders processed", summary);
  return summary;
}
