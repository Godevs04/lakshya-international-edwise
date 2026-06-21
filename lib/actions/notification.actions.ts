"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth/auth";
import { runLoggedQuery, runLoggedMutation } from "@/lib/action-utils";
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
} from "@/lib/services/notification.service";
import type { ActionResult } from "@/types";

export interface ClientNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export async function getNotificationsAction(): Promise<ClientNotification[]> {
  return runLoggedQuery("getNotificationsAction", async () => {
    const user = await getSessionUser();
    if (!user) return [];

    const notifications = await getUserNotifications(user.id, 20);
    return notifications.map((n) => ({
      id: n._id.toString(),
      type: n.type,
      title: n.title,
      body: n.body,
      link: n.link,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
    }));
  }, []);
}

export async function markNotificationReadAction(
  notificationId: string
): Promise<ActionResult> {
  return runLoggedMutation("markNotificationReadAction", async () => {
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }
    await markAsRead(notificationId, user.id);
    revalidatePath("/dashboard");
    return { success: true };
  });
}

export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  return runLoggedMutation("markAllNotificationsReadAction", async () => {
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }
    await markAllAsRead(user.id);
    revalidatePath("/dashboard");
    return { success: true };
  });
}
