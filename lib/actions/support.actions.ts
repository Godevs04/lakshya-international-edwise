"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/auth";
import { requirePermission, hasPermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  createVisitorId,
  listPopularSupportFaqs,
  recordSupportFaqHelpful,
  recordSupportFaqView,
  searchSupportFaqs,
} from "@/lib/services/support-faq-search.service";
import {
  appendSupportMessage,
  assignSupportConversation,
  closeSupportConversation,
  createWaitingConversation,
  getSupportConversationById,
  getSupportConversationCounts,
  listSupportConversations,
  listSupportMessages,
  markMessagesSeen,
  upsertChatStudentLead,
} from "@/lib/services/support-conversation.service";
import {
  notifyAgentAssigned,
  notifySupportTeamNewChat,
} from "@/lib/services/support-notify.service";
import {
  supportAssignSchema,
  supportCloseSchema,
  supportFaqSearchSchema,
  supportListSchema,
  supportQualifySchema,
  supportSendMessageSchema,
} from "@/lib/validations/support";
import type { ActionResult } from "@/types";
import { toPlainJson } from "@/lib/utils/to-plain-json";

export async function createSupportVisitorIdAction(): Promise<ActionResult<{ visitorId: string }>> {
  return { success: true, data: { visitorId: createVisitorId() } };
}

export async function getPopularSupportFaqsAction(
  limit = 8
): Promise<ActionResult<{ faqs: Awaited<ReturnType<typeof listPopularSupportFaqs>> }>> {
  try {
    const faqs = await listPopularSupportFaqs(limit);
    return { success: true, data: { faqs } };
  } catch {
    return { success: false, error: "Unable to load FAQs" };
  }
}

export async function searchSupportFaqsAction(
  input: unknown
): Promise<ActionResult<{ faqs: Awaited<ReturnType<typeof searchSupportFaqs>> }>> {
  try {
    const ip = await getClientIp();
    const rate = await checkRateLimit("support-chat", ip);
    if (!rate.allowed) {
      return {
        success: false,
        error: `Too many requests. Try again in ${rate.retryAfterSeconds}s.`,
      };
    }
    const parsed = supportFaqSearchSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid search" };
    }
    const faqs = parsed.data.query?.trim()
      ? await searchSupportFaqs(parsed.data.query, parsed.data.limit ?? 5)
      : await listPopularSupportFaqs(parsed.data.limit ?? 8);
    return { success: true, data: { faqs } };
  } catch {
    return { success: false, error: "Search failed" };
  }
}

export async function markSupportFaqFeedbackAction(
  faqId: string,
  helpful: boolean
): Promise<ActionResult> {
  try {
    await recordSupportFaqView(faqId);
    await recordSupportFaqHelpful(faqId, helpful);
    return { success: true };
  } catch {
    return { success: false, error: "Unable to save feedback" };
  }
}

export async function startSupportAdvisorChatAction(
  input: unknown
): Promise<ActionResult<{ conversationId: string; visitorId: string; studentId: string }>> {
  try {
    const ip = await getClientIp();
    const rate = await checkRateLimit("support-chat", ip);
    if (!rate.allowed) {
      return {
        success: false,
        error: `Too many requests. Try again in ${rate.retryAfterSeconds}s.`,
      };
    }

    const parsed = supportQualifySchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Please check your details",
      };
    }
    if (parsed.data.website) {
      return {
        success: true,
        data: { conversationId: "ok", visitorId: parsed.data.visitorId, studentId: "ok" },
      };
    }

    const qualification = {
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email || undefined,
      country: parsed.data.country,
      degree: parsed.data.degree,
      admissionStatus: parsed.data.admissionStatus,
      collateralPreference: parsed.data.collateralPreference,
      loanRequired: parsed.data.loanRequired,
    };

    const student = await upsertChatStudentLead({ qualification, ip });
    const conversation = await createWaitingConversation({
      visitorId: parsed.data.visitorId,
      qualification,
      studentId: student._id,
      welcomeMessage: `Hi ${qualification.name.split(" ")[0]}! Thanks for the details — an advisor will join shortly.`,
    });

    await notifySupportTeamNewChat({
      conversationId: conversation._id.toString(),
      name: qualification.name,
      phone: qualification.phone!,
      email: qualification.email,
      country: qualification.country,
      degree: qualification.degree,
      studentCode: student.studentId,
      leadId: student._id.toString(),
    });

    revalidatePath("/dashboard/support");
    revalidatePath("/dashboard/site-leads");

    return {
      success: true,
      data: {
        conversationId: conversation._id.toString(),
        visitorId: parsed.data.visitorId,
        studentId: student._id.toString(),
      },
    };
  } catch {
    return { success: false, error: "Unable to start chat. Please try again." };
  }
}

export async function sendSupportVisitorMessageAction(
  input: unknown
): Promise<ActionResult<{ messageId: string }>> {
  try {
    const ip = await getClientIp();
    const rate = await checkRateLimit("support-chat", ip);
    if (!rate.allowed) {
      return {
        success: false,
        error: `Too many messages. Try again in ${rate.retryAfterSeconds}s.`,
      };
    }
    const parsed = supportSendMessageSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid message" };
    }

    const conversation = await getSupportConversationById(parsed.data.conversationId);
    if (!conversation) return { success: false, error: "Conversation not found" };
    if (parsed.data.visitorId && conversation.visitorId !== parsed.data.visitorId) {
      return { success: false, error: "Unauthorized" };
    }
    if (conversation.status === "closed" || conversation.status === "resolved") {
      return { success: false, error: "This conversation is closed" };
    }

    const message = await appendSupportMessage({
      conversationId: parsed.data.conversationId,
      senderType: "visitor",
      body: parsed.data.body,
      type: parsed.data.type,
    });

    return { success: true, data: { messageId: message._id.toString() } };
  } catch {
    return { success: false, error: "Failed to send message" };
  }
}

export async function getSupportInboxAction(input?: unknown) {
  const session = await auth();
  requirePermission(session?.user, PERMISSIONS.SUPPORT_READ);
  const parsed = supportListSchema.safeParse(input ?? {});
  if (!parsed.success) {
    return { success: false as const, error: "Invalid filters" };
  }

  const data = await listSupportConversations(parsed.data);
  const counts = await getSupportConversationCounts();
  return { success: true as const, data: toPlainJson({ ...data, counts }) };
}

export async function getSupportConversationDetailAction(conversationId: string) {
  const session = await auth();
  requirePermission(session?.user, PERMISSIONS.SUPPORT_READ);
  const [conversation, messages] = await Promise.all([
    getSupportConversationById(conversationId),
    listSupportMessages(conversationId),
  ]);
  if (!conversation) return { success: false as const, error: "Not found" };
  return {
    success: true as const,
    data: toPlainJson({ conversation, messages }),
  };
}

export async function getSupportVisitorThreadAction(conversationId: string, visitorId: string) {
  const conversation = await getSupportConversationById(conversationId);
  if (!conversation || conversation.visitorId !== visitorId) {
    return { success: false as const, error: "Not found" };
  }
  const messages = await listSupportMessages(conversationId);
  const status = String(conversation.status ?? "waiting");
  return {
    success: true as const,
    data: {
      conversationId: String(conversation._id),
      status,
      closed: status === "closed" || status === "resolved",
      messages: messages.map((message) => ({
        id: String(message._id),
        senderType: message.senderType as string,
        body: message.body as string,
        createdAt: new Date(message.createdAt as Date).toISOString(),
      })),
    },
  };
}

export async function sendSupportAgentMessageAction(
  input: unknown
): Promise<ActionResult<{ messageId: string }>> {
  try {
    const session = await auth();
    requirePermission(session?.user, PERMISSIONS.SUPPORT_WRITE);
    const parsed = supportSendMessageSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid message" };
    }

    const message = await appendSupportMessage({
      conversationId: parsed.data.conversationId,
      senderType: "agent",
      senderId: session!.user!.id,
      body: parsed.data.body,
      type: parsed.data.type,
    });

    revalidatePath("/dashboard/support");
    return { success: true, data: { messageId: message._id.toString() } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send",
    };
  }
}

export async function claimOrAssignSupportConversationAction(
  input: unknown
): Promise<ActionResult> {
  try {
    const session = await auth();
    requirePermission(session?.user, PERMISSIONS.SUPPORT_WRITE);
    const parsed = supportAssignSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: "Invalid assign request" };
    }

    const assigneeId = parsed.data.assigneeId ?? session!.user!.id;
    if (
      parsed.data.assigneeId &&
      parsed.data.assigneeId !== session!.user!.id &&
      !hasPermission(session?.user, PERMISSIONS.SUPPORT_ASSIGN)
    ) {
      return { success: false, error: "You cannot assign chats to others" };
    }

    const conversation = await assignSupportConversation({
      conversationId: parsed.data.conversationId,
      assigneeId,
    });
    if (!conversation) return { success: false, error: "Conversation not found" };

    const student = conversation.studentId as
      { firstName?: string; lastName?: string } | string | undefined;
    const visitorName =
      conversation.qualification?.name ||
      (typeof student === "object" && student?.firstName
        ? `${student.firstName} ${student.lastName ?? ""}`.trim()
        : "Visitor");

    await notifyAgentAssigned({
      assigneeId,
      conversationId: parsed.data.conversationId,
      visitorName,
    });

    try {
      const { emitSupportEvent } = await import("@/lib/socket/support-socket");
      emitSupportEvent(parsed.data.conversationId, "conversationAssigned", {
        conversationId: parsed.data.conversationId,
        assigneeId,
        visitorName,
      });
    } catch {
      // Socket may be unavailable under next-only start
    }

    revalidatePath("/dashboard/support");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Assign failed",
    };
  }
}

export async function closeSupportConversationAction(input: unknown): Promise<ActionResult> {
  try {
    const session = await auth();
    requirePermission(session?.user, PERMISSIONS.SUPPORT_WRITE);
    const parsed = supportCloseSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: "Invalid request" };

    await closeSupportConversation({
      conversationId: parsed.data.conversationId,
      closedBy: session!.user!.id,
      status: parsed.data.status,
    });
    try {
      const { emitSupportEvent } = await import("@/lib/socket/support-socket");
      emitSupportEvent(parsed.data.conversationId, "conversationClosed", {
        conversationId: parsed.data.conversationId,
        status: parsed.data.status,
      });
    } catch {
      // ignore
    }
    revalidatePath("/dashboard/support");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Close failed",
    };
  }
}

export async function markSupportSeenAction(conversationId: string, viewer: "visitor" | "agent") {
  await markMessagesSeen({ conversationId, viewer });
  return { success: true as const };
}

export async function getSupportAssignableUsersAction() {
  const session = await auth();
  requirePermission(session?.user, PERMISSIONS.SUPPORT_ASSIGN);
  const { connectDB } = await import("@/lib/db/mongoose");
  const { User } = await import("@/models/User");
  await connectDB();
  const users = await User.find({
    status: "active",
    role: { $in: ["super_admin", "admin", "manager", "staff"] },
  })
    .select("name email role")
    .sort({ name: 1 })
    .lean();
  return users.map((entry) => ({
    _id: entry._id.toString(),
    name: entry.name,
    email: entry.email,
    role: entry.role,
  }));
}
