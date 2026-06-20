import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { getAppConfig } from "@/lib/config/app-config";
import { getUnreadNotificationCount } from "@/lib/actions/settings.actions";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  const [config, unreadCount] = await Promise.all([
    getAppConfig(),
    getUnreadNotificationCount(),
  ]);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        companyName={config.company.name}
        logo={config.company.logo}
        modules={config.modules}
      />
      <div className="flex flex-1 flex-col">
        <Topbar unreadCount={unreadCount} />
        <main className="flex-1 overflow-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
