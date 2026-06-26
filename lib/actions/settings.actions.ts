"use server";

import { revalidatePath, updateTag } from "next/cache";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/mongoose";
import { Settings } from "@/models/Settings";
import { getDefaultSettings, resolveCompanySettings } from "@/lib/config/app-defaults";
import { APP_CONFIG_CACHE_TAG } from "@/lib/config/app-config";
import { User } from "@/models/User";
import { Role } from "@/models/Role";
import { getSessionUser } from "@/lib/auth/auth";
import { requirePermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { settingsSchema, profileSchema } from "@/lib/validations/schemas";
import type { ActionResult, AppSettings } from "@/types";
import type { UserRole } from "@/types";
import { runLoggedMutation, runLoggedQuery } from "@/lib/action-utils";
import { validateOptionalCloudinaryUrl } from "@/lib/services/upload.service";
import { logActivity } from "@/lib/services/activity.service";
import { createNotification } from "@/lib/services/notification.service";
import {
  buildUserPermissionFields,
  parseMenuAccessJson,
  type MenuAccessMap,
} from "@/lib/constants/menu-permissions";

async function logSettingsActivity(
  user: { id: string; name: string },
  description: string,
  resourceId?: string,
  diff?: Record<string, unknown>
): Promise<void> {
  await logActivity({
    action: "settings.updated",
    description,
    resourceType: "settings",
    resourceId,
    userId: user.id,
    userName: user.name,
    diff,
  });
}

async function logUserActivity(
  user: { id: string; name: string },
  action: string,
  description: string,
  resourceId?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await logActivity({
    action,
    description,
    resourceType: "user",
    resourceId,
    userId: user.id,
    userName: user.name,
    metadata,
  });
}

function parsePermissionFieldsFromForm(formData: FormData) {
  const useCustomPermissions = formData.get("useCustomPermissions") === "true";
  const menuAccess = parseMenuAccessJson(formData.get("menuAccess"));
  return buildUserPermissionFields(useCustomPermissions, menuAccess);
}

async function notifyPermissionRefresh(targetUserId: string, title: string, body: string) {
  await createNotification({
    userId: targetUserId,
    type: "system",
    title,
    body: `${body} Sign in again for permissions to take full effect.`,
    link: "/dashboard/profile",
  });
}

export async function getSettings(): Promise<AppSettings> {
  return runLoggedQuery("getSettings", async () => {
  const user = await getSessionUser();
  requirePermission(user, PERMISSIONS.SETTINGS_READ);

  await connectDB();
  const defaults = getDefaultSettings();
  let settings = await Settings.findOne().lean();
  if (!settings) {
    const created = await Settings.create(defaults);
    settings = created.toObject();
  }

  const modules = settings.modules ?? defaults.modules;
  const allModulesDisabled = Object.values(modules).every((enabled) => !enabled);

  return {
    company: resolveCompanySettings(settings.company),
    theme: {
      ...defaults.theme,
      ...settings.theme,
      primary: settings.theme?.primary?.trim() || defaults.theme.primary,
      accent: settings.theme?.accent?.trim() || defaults.theme.accent,
      radius: settings.theme?.radius?.trim() || defaults.theme.radius,
    },
    modules: allModulesDisabled ? defaults.modules : { ...defaults.modules, ...modules },
    sessionExpiryHours: settings.sessionExpiryHours ?? defaults.sessionExpiryHours,
  };
  }, getDefaultSettings());
}

function parseModuleFlag(value: FormDataEntryValue | null): boolean {
  return value === "true" || value === "on";
}

export async function updateSettingsAction(
  formData: FormData
): Promise<ActionResult> {
  return runLoggedMutation("updateSettingsAction", async () => {
  const user = await getSessionUser();
  requirePermission(user, PERMISSIONS.SETTINGS_WRITE);

  const section = (formData.get("settingsSection") as string) || "company";
  const raw = Object.fromEntries(formData.entries());

  await connectDB();
  const defaults = getDefaultSettings();

  if (section === "company") {
    const parsed = settingsSchema.safeParse({
      companyName: raw.companyName,
      companyEmail: raw.companyEmail,
      companyPhone: raw.companyPhone,
      companyAddress: raw.companyAddress,
      companyLogo: raw.companyLogo,
    });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
    }
    const data = parsed.data;

    const logoCheck = validateOptionalCloudinaryUrl(data.companyLogo, "settings");
    if (!logoCheck.valid) {
      return { success: false, error: logoCheck.error };
    }

    await Settings.findOneAndUpdate(
      {},
      {
        $set: {
          company: {
            name: data.companyName,
            email: data.companyEmail ?? "",
            phone: data.companyPhone ?? "",
            address: data.companyAddress ?? "",
            logo: data.companyLogo ?? "",
          },
        },
      },
      { upsert: true }
    );
  } else if (section === "modules") {
    await Settings.findOneAndUpdate(
      {},
      {
        $set: {
          modules: {
            students: parseModuleFlag(formData.get("modulesStudents")),
            partners: parseModuleFlag(formData.get("modulesPartners")),
            applications: parseModuleFlag(formData.get("modulesApplications")),
            lenders: parseModuleFlag(formData.get("modulesLenders")),
            tasks: parseModuleFlag(formData.get("modulesTasks")),
            reports: parseModuleFlag(formData.get("modulesReports")),
            analytics: parseModuleFlag(formData.get("modulesAnalytics")),
          },
        },
      },
      { upsert: true }
    );
  } else if (section === "security") {
    const parsed = settingsSchema.safeParse({
      sessionExpiryHours: raw.sessionExpiryHours,
    });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
    }
    await Settings.findOneAndUpdate(
      {},
      { $set: { sessionExpiryHours: parsed.data.sessionExpiryHours ?? defaults.sessionExpiryHours } },
      { upsert: true }
    );
  } else {
    return { success: false, error: "Invalid settings section" };
  }

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  updateTag(APP_CONFIG_CACHE_TAG);
  await logSettingsActivity(user!, `Updated ${section} settings`, section, { section });
  return { success: true };
  });
}

export async function getUsers() {
  return runLoggedQuery("getUsers", async () => {
  const user = await getSessionUser();
  requirePermission(user, PERMISSIONS.USERS_READ);

  await connectDB();
  return User.find().select("-passwordHash -resetToken -verifyToken -emailOtpHash").sort({ createdAt: -1 }).lean();
  }, []);
}

export async function getPendingUsers() {
  return runLoggedQuery("getPendingUsers", async () => {
  const user = await getSessionUser();
  requirePermission(user, PERMISSIONS.USERS_READ);

  await connectDB();
  return User.find({ status: "pending", isVerified: true })
    .select("-passwordHash -resetToken -verifyToken -emailOtpHash")
    .sort({ createdAt: 1 })
    .lean();
  }, []);
}

export async function approveUserAction(
  userId: string,
  role: UserRole
): Promise<ActionResult> {
  return runLoggedMutation("approveUserAction", async () => {
  const user = await getSessionUser();
  requirePermission(user, PERMISSIONS.USERS_WRITE);

  if (role === "super_admin") {
    return { success: false, error: "Cannot assign super admin role via approval" };
  }

  await connectDB();
  const pendingUser = await User.findById(userId);
  if (!pendingUser) {
    return { success: false, error: "User not found" };
  }
  if (pendingUser.status !== "pending" || !pendingUser.isVerified) {
    return { success: false, error: "User is not eligible for approval" };
  }

  pendingUser.status = "active";
  pendingUser.role = role;
  await pendingUser.save();

  const { sendApprovalEmail } = await import("@/lib/services/email.service");
  const { ROLE_LABELS } = await import("@/lib/constants/permissions");
  await sendApprovalEmail(pendingUser.email, pendingUser.name, ROLE_LABELS[role]);

  await createNotification({
    userId: pendingUser._id,
    type: "success",
    title: "Account approved",
    body: `Your account has been approved with the ${ROLE_LABELS[role]} role.`,
    link: "/login",
  });

  await logUserActivity(
    user!,
    "user.approved",
    `Approved user ${pendingUser.email} as ${role}`,
    pendingUser._id.toString(),
    { role, email: pendingUser.email }
  );

  revalidatePath("/dashboard/settings");
  return { success: true };
  });
}

export async function rejectUserAction(userId: string): Promise<ActionResult> {
  return runLoggedMutation("rejectUserAction", async () => {
  const user = await getSessionUser();
  requirePermission(user, PERMISSIONS.USERS_WRITE);

  if (user?.id === userId) {
    return { success: false, error: "Cannot reject your own account" };
  }

  await connectDB();
  const pendingUser = await User.findById(userId);
  if (!pendingUser) {
    return { success: false, error: "User not found" };
  }

  pendingUser.status = "inactive";
  await pendingUser.save();

  await createNotification({
    userId: pendingUser._id,
    type: "warning",
    title: "Registration declined",
    body: "Your registration request was not approved. Contact your administrator for details.",
  });

  await logUserActivity(
    user!,
    "user.rejected",
    `Rejected user ${pendingUser.email}`,
    pendingUser._id.toString(),
    { email: pendingUser.email }
  );

  revalidatePath("/dashboard/settings");
  return { success: true };
  });
}

export async function createUserAction(formData: FormData): Promise<ActionResult> {
  return runLoggedMutation("createUserAction", async () => {
  const user = await getSessionUser();
  requirePermission(user, PERMISSIONS.USERS_WRITE);

  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as UserRole;

  if (!email || !name || !password) {
    return { success: false, error: "All fields are required" };
  }

  if (role === "super_admin") {
    return { success: false, error: "Cannot assign super admin role" };
  }

  if (role === "admin" && user?.role !== "super_admin") {
    return { success: false, error: "Only super admin can create admin users" };
  }

  await connectDB();
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return { success: false, error: "Email already exists" };

  const passwordHash = await bcrypt.hash(password, 12);
  const permissionFields = parsePermissionFieldsFromForm(formData);
  await User.create({
    email: email.toLowerCase(),
    name,
    passwordHash,
    role: role ?? "staff",
    isVerified: true,
    status: "active",
    useCustomPermissions: permissionFields.useCustomPermissions,
    customPermissions: permissionFields.customPermissions,
  });

  await logUserActivity(
    user!,
    "user.created",
    `Created user ${email.toLowerCase()} with role ${role ?? "staff"}`,
    email.toLowerCase(),
    { role: role ?? "staff", email: email.toLowerCase() }
  );

  revalidatePath("/dashboard/settings");
  return { success: true };
  });
}

export async function updateUserRoleAction(
  userId: string,
  role: UserRole
): Promise<ActionResult> {
  return runLoggedMutation("updateUserRoleAction", async () => {
  const user = await getSessionUser();
  requirePermission(user, PERMISSIONS.USERS_WRITE);

  if (role === "super_admin") {
    return { success: false, error: "Cannot assign super admin role" };
  }

  if (role === "admin" && user?.role !== "super_admin") {
    return { success: false, error: "Only super admin can assign admin role" };
  }

  await connectDB();
  const targetUser = await User.findById(userId);
  if (!targetUser) {
    return { success: false, error: "User not found" };
  }

  await User.findByIdAndUpdate(userId, { role });

  const { ROLE_LABELS } = await import("@/lib/constants/permissions");
  await createNotification({
    userId: targetUser._id,
    type: "system",
    title: "Role updated",
    body: `Your role was changed to ${ROLE_LABELS[role]}. Sign in again for permissions to take full effect.`,
    link: "/dashboard/profile",
  });

  await logUserActivity(
    user!,
    "user.role_updated",
    `Updated role for ${targetUser.email} to ${role}`,
    userId,
    { role, email: targetUser.email }
  );
  revalidatePath("/dashboard/settings");
  return { success: true };
  });
}

export async function deleteUserAction(userId: string): Promise<ActionResult> {
  return runLoggedMutation("deleteUserAction", async () => {
  const user = await getSessionUser();
  requirePermission(user, PERMISSIONS.USERS_DELETE);

  if (user?.id === userId) {
    return { success: false, error: "Cannot delete your own account" };
  }

  await connectDB();
  const target = await User.findById(userId).select("email").lean();
  await User.findByIdAndDelete(userId);
  await logUserActivity(
    user!,
    "user.deleted",
    `Deleted user ${target?.email ?? userId}`,
    userId,
    { email: target?.email }
  );
  revalidatePath("/dashboard/settings");
  return { success: true };
  });
}

export async function updateUserMenuPermissionsAction(
  userId: string,
  useCustomPermissions: boolean,
  menuAccess: MenuAccessMap
): Promise<ActionResult> {
  return runLoggedMutation("updateUserMenuPermissionsAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.USERS_WRITE);

    if (user?.id === userId) {
      return { success: false, error: "Cannot change your own menu access here" };
    }

    await connectDB();
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return { success: false, error: "User not found" };
    }

    if (targetUser.role === "super_admin") {
      return { success: false, error: "Super admin access cannot be customized" };
    }

    const permissionFields = buildUserPermissionFields(useCustomPermissions, menuAccess);
    targetUser.useCustomPermissions = permissionFields.useCustomPermissions;
    targetUser.customPermissions = permissionFields.customPermissions;
    await targetUser.save();

    await notifyPermissionRefresh(
      targetUser._id.toString(),
      "Menu access updated",
      "Your dashboard menu permissions were updated."
    );

    await logUserActivity(
      user!,
      "user.permissions_updated",
      `Updated menu access for ${targetUser.email}`,
      userId,
      {
        email: targetUser.email,
        useCustomPermissions: permissionFields.useCustomPermissions,
        permissions: permissionFields.customPermissions ?? [],
      }
    );

    revalidatePath("/dashboard/settings");
    return { success: true };
  });
}

export async function getRoles() {
  return runLoggedQuery("getRoles", async () => {
  const user = await getSessionUser();
  requirePermission(user, PERMISSIONS.USERS_READ);

  await connectDB();
  return Role.find().lean();
  }, []);
}

export async function updateProfileAction(formData: FormData): Promise<ActionResult> {
  return runLoggedMutation("updateProfileAction", async () => {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return { success: false, error: "Not authenticated" };

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  await connectDB();
  const user = await User.findById(sessionUser.id);
  if (!user) return { success: false, error: "User not found" };

  user.name = parsed.data.name;
  user.email = parsed.data.email.toLowerCase();

  if (parsed.data.newPassword) {
    if (!parsed.data.currentPassword) {
      return { success: false, error: "Current password is required" };
    }
    const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
    if (!valid) return { success: false, error: "Current password is incorrect" };
    if (parsed.data.newPassword !== parsed.data.confirmPassword) {
      return { success: false, error: "Passwords don't match" };
    }
    user.passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  }

  await user.save();

  await logUserActivity(
    sessionUser,
    "user.profile_updated",
    `Profile updated for ${user.email}`,
    user._id.toString(),
    { passwordChanged: Boolean(parsed.data.newPassword), email: user.email }
  );

  revalidatePath("/dashboard/profile");
  return { success: true };
  });
}

export async function getUnreadNotificationCount(): Promise<number> {
  return runLoggedQuery("getUnreadNotificationCount", async () => {
  const user = await getSessionUser();
  if (!user) return 0;
  const { getUnreadCount } = await import("@/lib/services/notification.service");
  return getUnreadCount(user.id);
  }, 0);
}
