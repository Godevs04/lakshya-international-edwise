import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { hasPermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { PageHeader } from "@/components/dashboard/page-header";
import { SettingsView } from "@/components/dashboard/settings-view";
import { getSettings, getUsers, getPendingUsers } from "@/lib/actions/settings.actions";
import type { UserRole } from "@/types";

export default async function SettingsPage() {
  const session = await auth();
  const user = session?.user;

  if (!hasPermission(user, PERMISSIONS.SETTINGS_READ)) {
    redirect("/dashboard/overview");
  }

  const canManageUsers = hasPermission(user, PERMISSIONS.USERS_READ);
  const canWriteSettings = hasPermission(user, PERMISSIONS.SETTINGS_WRITE);

  const settings = await getSettings();
  const [users, pendingUsers] = canManageUsers
    ? await Promise.all([getUsers(), getPendingUsers()])
    : [[], []];

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Configure your CRM application" badge="Admin" />
      <SettingsView
        settings={settings}
        canManageUsers={canManageUsers}
        canWriteSettings={canWriteSettings}
        users={users.map((u) => ({
          _id: u._id.toString(),
          name: u.name,
          email: u.email,
          role: u.role as UserRole,
          status: u.status,
        }))}
        pendingUsers={pendingUsers.map((u) => ({
          _id: u._id.toString(),
          name: u.name,
          email: u.email,
          createdAt: u.createdAt,
        }))}
      />
    </div>
  );
}
