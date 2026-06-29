import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { getAppConfig } from "@/lib/config/app-config";
import { getUnreadNotificationCount } from "@/lib/actions/settings.actions";
import { getTaskSummary } from "@/lib/actions/task.actions";
import { Sidebar, MobileNav } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { PremiumBackground } from "@/components/layout/premium-background";
import { Design06TopWaves } from "@/components/layout/design06-top-waves";
import { DashboardSessionBridge } from "@/components/dashboard/dashboard-session-bridge";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

function TopbarFallback() {
  return <Skeleton className="h-11 w-full rounded-full bg-primary/10 sm:h-12" />;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  const config = await getAppConfig();
  const [unreadCount, taskSummary] = await Promise.all([
    getUnreadNotificationCount(),
    config.modules?.tasks !== false ? getTaskSummary() : Promise.resolve({ overdue: 0 }),
  ]);
  const overdueTaskCount = taskSummary.overdue;

  return (
    <DashboardSessionBridge session={session}>
      <div className="relative min-h-screen overflow-x-hidden">
        <PremiumBackground />
        <Sidebar
          companyName={config.company.name}
          logo={config.company.logo}
          modules={config.modules}
          overdueTaskCount={overdueTaskCount}
        />
        <div className="relative flex min-h-screen min-w-0 flex-col lg:pl-[260px]">
          <Design06TopWaves />
          <div className="relative z-10 flex min-h-screen min-w-0 flex-col">
            <div className="sticky top-0 z-30 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-4 lg:px-8 lg:pt-6">
              <Suspense fallback={<TopbarFallback />}>
                <Topbar
                  unreadCount={unreadCount}
                  companyName={config.company.name}
                  logo={config.company.logo}
                  modules={config.modules}
                  user={session.user}
                />
              </Suspense>
            </div>
            <main className="min-w-0 flex-1 overflow-x-hidden px-3 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-2 sm:px-4 lg:px-8 lg:pb-8 lg:pt-4">
              {children}
            </main>
          </div>
        </div>
        <MobileNav
          modules={config.modules}
          companyName={config.company.name}
          logo={config.company.logo}
          overdueTaskCount={overdueTaskCount}
        />
      </div>
    </DashboardSessionBridge>
  );
}
