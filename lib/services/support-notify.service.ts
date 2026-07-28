import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { createNotification } from "@/lib/services/notification.service";
import { sendWebsiteEnquiryNotification } from "@/lib/services/email.service";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { resolveUserPermissions } from "@/lib/auth/permissions";
import type { UserRole } from "@/types";

function userHasSupportNotify(role: UserRole, custom?: string[], useCustom?: boolean) {
  const perms = resolveUserPermissions(role, useCustom, custom);
  if (perms.includes("*")) return true;
  return (
    perms.includes(PERMISSIONS.SUPPORT_ASSIGN) ||
    perms.includes(PERMISSIONS.SUPPORT_MANAGE) ||
    perms.includes(PERMISSIONS.SUPPORT_READ)
  );
}

/** Notify managers/admins/staff with support access about a new waiting chat. */
export async function notifySupportTeamNewChat(params: {
  conversationId: string;
  name: string;
  phone: string;
  email?: string;
  country?: string;
  degree?: string;
  studentCode: string;
  leadId: string;
}) {
  await connectDB();
  const users = await User.find({
    status: "active",
    role: { $in: ["super_admin", "admin", "manager", "staff"] },
  })
    .select("_id role useCustomPermissions customPermissions")
    .lean();

  const link = `/dashboard/support?conversation=${params.conversationId}`;
  await Promise.all(
    users
      .filter((u) =>
        userHasSupportNotify(u.role as UserRole, u.customPermissions, u.useCustomPermissions)
      )
      .map((u) =>
        createNotification({
          userId: u._id,
          type: "info",
          title: "New support chat",
          body: `${params.name} needs help${params.country ? ` (${params.country})` : ""}`,
          link,
        })
      )
  );

  await sendWebsiteEnquiryNotification({
    name: params.name,
    phone: params.phone,
    email: params.email,
    targetCountry: params.country,
    course: params.degree,
    loanRequired: true,
    enquiryType: "eligibility",
    formPage: "/chat",
    studentCode: params.studentCode,
    leadId: params.leadId,
    message: `Support chat waiting — open ${link}`,
  }).catch(() => false);
}

export async function notifyAgentAssigned(params: {
  assigneeId: string;
  conversationId: string;
  visitorName: string;
}) {
  await createNotification({
    userId: params.assigneeId,
    type: "info",
    title: "Chat assigned to you",
    body: `${params.visitorName} is waiting in Support`,
    link: `/dashboard/support?conversation=${params.conversationId}`,
  });
}
