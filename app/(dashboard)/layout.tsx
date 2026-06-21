import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { getAppConfig } from "@/lib/config/app-config";
import { getUnreadNotificationCount } from "@/lib/actions/settings.actions";
import { getNotificationsAction } from "@/lib/actions/notification.actions";
import { Sidebar, MobileNav, MobileTopBar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { PremiumBackground } from "@/components/layout/premium-background";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  const [config, unreadCount, notifications] = await Promise.all([
    getAppConfig(),
    getUnreadNotificationCount(),
    getNotificationsAction(),
  ]);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <PremiumBackground />
      <Sidebar
        companyName={config.company.name}
        logo={config.company.logo}
        modules={config.modules}
      />
      <div className="flex min-h-screen min-w-0 flex-col lg:pl-[292px]">
        <div className="sticky top-0 z-30 space-y-3 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-4 lg:px-8 lg:pt-6">
          <MobileTopBar
            companyName={config.company.name}
            logo={config.company.logo}
            modules={config.modules}
          />
          <Topbar unreadCount={unreadCount} notifications={notifications} />
        </div>
        <main className="min-w-0 flex-1 overflow-x-hidden px-3 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-2 sm:px-4 lg:px-8 lg:pb-8 lg:pt-4">
          {children}
        </main>
      </div>
      <MobileNav modules={config.modules} />
    </div>
  );
}
