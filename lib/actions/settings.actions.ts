"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/mongoose";
import { Settings } from "@/models/Settings";
import { getDefaultSettings } from "@/lib/config/app-defaults";
import { User } from "@/models/User";
import { Role } from "@/models/Role";
import { getSessionUser } from "@/lib/auth/auth";
import { requirePermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { settingsSchema, profileSchema } from "@/lib/validations/schemas";
import type { ActionResult, AppSettings } from "@/types";
import type { UserRole } from "@/types";
import { runLoggedMutation, runLoggedQuery } from "@/lib/action-utils";

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
    company: {
      ...defaults.company,
      ...settings.company,
      name: settings.company?.name?.trim() || defaults.company.name,
    },
    theme: {
      ...defaults.theme,
      ...settings.theme,
      primary: settings.theme?.primary?.trim() || defaults.theme.primary,
      accent: settings.theme?.accent?.trim() || defaults.theme.accent,
      radius: settings.theme?.radius?.trim() || defaults.theme.radius,
    },
    modules: allModulesDisabled ? defaults.modules : modules,
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
  const existingDoc = await Settings.findOne().lean();
  const existing = existingDoc ?? defaults;

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
  } else if (section === "theme") {
    const parsed = settingsSchema.safeParse({
      themePrimary: raw.themePrimary,
      themeAccent: raw.themeAccent,
      themeRadius: raw.themeRadius,
      themeMode: raw.themeMode,
    });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
    }
    const data = parsed.data;
    await Settings.findOneAndUpdate(
      {},
      {
        $set: {
          theme: {
            primary: data.themePrimary?.trim() || existing.theme?.primary || defaults.theme.primary,
            accent: data.themeAccent?.trim() || existing.theme?.accent || defaults.theme.accent,
            radius: data.themeRadius?.trim() || existing.theme?.radius || defaults.theme.radius,
            fontFamily: existing.theme?.fontFamily || defaults.theme.fontFamily,
            mode: data.themeMode ?? existing.theme?.mode ?? defaults.theme.mode,
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
            reports: parseModuleFlag(formData.get("modulesReports")),
            analytics: parseModuleFlag(formData.get("modulesAnalytics")),
          },
        },
      },
      { upsert: true }
    );
  } else {
    return { success: false, error: "Invalid settings section" };
  }

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
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

  await connectDB();
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return { success: false, error: "Email already exists" };

  const passwordHash = await bcrypt.hash(password, 12);
  await User.create({
    email: email.toLowerCase(),
    name,
    passwordHash,
    role: role ?? "staff",
    isVerified: true,
    status: "active",
  });

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

  await connectDB();
  await User.findByIdAndUpdate(userId, { role });
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
  await User.findByIdAndDelete(userId);
  revalidatePath("/dashboard/settings");
  return { success: true };
  });
}

export async function getRoles() {
  return runLoggedQuery("getRoles", async () => {
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
