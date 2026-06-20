import { PageHeader } from "@/components/dashboard/page-header";
import { SettingsView } from "@/components/dashboard/settings-view";
import { getSettings, getUsers } from "@/lib/actions/settings.actions";
import type { UserRole } from "@/types";

export default async function SettingsPage() {
  const [settings, users] = await Promise.all([getSettings(), getUsers()]);

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Configure your CRM application" />
      <SettingsView
        settings={settings}
        users={users.map((u) => ({
          _id: u._id.toString(),
          name: u.name,
          email: u.email,
          role: u.role as UserRole,
          status: u.status,
        }))}
      />
    </div>
  );
}
