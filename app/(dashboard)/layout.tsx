import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { getAppConfig } from "@/lib/config/app-config";
import { getUnreadNotificationCount } from "@/lib/actions/settings.actions";
import { Sidebar, MobileNav } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { PremiumBackground } from "@/components/layout/premium-background";

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
    <div className="relative min-h-screen">
      <PremiumBackground />
      <Sidebar
        companyName={config.company.name}
        logo={config.company.logo}
        modules={config.modules}
      />
      <div className="flex min-h-screen flex-col lg:pl-[292px]">
        <div className="sticky top-0 z-30 px-4 pt-4 lg:px-8 lg:pt-6">
          <Topbar unreadCount={unreadCount} />
        </div>
        <main className="flex-1 overflow-auto px-4 pb-24 pt-2 lg:px-8 lg:pb-8 lg:pt-4">
          {children}
        </main>
      </div>
      <MobileNav modules={config.modules} />
    </div>
  );
}
