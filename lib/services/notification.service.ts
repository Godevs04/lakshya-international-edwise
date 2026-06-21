import { connectDB } from "@/lib/db/mongoose";
import { Notification } from "@/models/Notification";
import type { Types } from "mongoose";

export async function getUserNotifications(userId: string, limit = 20) {
  await connectDB();
  return Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

export async function getUnreadCount(userId: string): Promise<number> {
  await connectDB();
  return Notification.countDocuments({ userId, read: false });
}

export async function createNotification(params: {
  userId: string | Types.ObjectId;
  type: "info" | "success" | "warning" | "reminder" | "system";
  title: string;
  body: string;
  link?: string;
}) {
  await connectDB();
  return Notification.create(params);
}

export async function markAsRead(notificationId: string, userId: string) {
  await connectDB();
  return Notification.updateOne(
    { _id: notificationId, userId },
    { read: true }
  );
}

export async function markAllAsRead(userId: string) {
  await connectDB();
  return Notification.updateMany({ userId, read: false }, { read: true });
}

export async function notifyAdmins(params: {
  title: string;
  body: string;
  link?: string;
  type?: "info" | "success" | "warning" | "reminder" | "system";
}) {
  await connectDB();
  const { User } = await import("@/models/User");
  const admins = await User.find({
    role: { $in: ["super_admin", "admin"] },
    status: "active",
  })
    .select("_id")
    .lean();

  await Promise.all(
    admins.map((admin) =>
      createNotification({
        userId: admin._id,
        type: params.type ?? "system",
        title: params.title,
        body: params.body,
        link: params.link,
      })
    )
  );
}
