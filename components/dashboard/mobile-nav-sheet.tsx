"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  filterNavItems,
  isNavItemActive,
  type NavItem,
} from "@/components/dashboard/nav-config";
import { SidebarBrand } from "@/components/brand/sidebar-brand";
import { NavBadge } from "@/components/dashboard/nav-badge";
import type { AppModules } from "@/types";

const TASKS_HREF = "/dashboard/tasks";
const SITE_LEADS_HREF = "/dashboard/site-leads";

interface MobileNavSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyName: string;
  logo?: string;
  modules?: AppModules;
  items?: NavItem[];
  overdueTaskCount?: number;
  pendingSiteLeadCount?: number;
}

export function MobileNavSheet({
  open,
  onOpenChange,
  companyName,
  logo,
  modules,
  items,
  overdueTaskCount = 0,
  pendingSiteLeadCount = 0,
}: MobileNavSheetProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const filteredNav = items ?? filterNavItems(modules, session?.user?.permissions);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sidebar-solid w-[min(100vw-2rem,320px)] border-sidebar-border p-0 text-sidebar-foreground">
        <SheetHeader className="border-b border-sidebar-border px-4 py-3.5 text-left">
          <SidebarBrand companyName={companyName} logo={logo} linkToOverview={false} />
        </SheetHeader>
        <nav className="space-y-1 p-3">
          {filteredNav.map((item) => {
            const isActive = isNavItemActive(pathname, item.href);
            const badgeCount =
              item.href === TASKS_HREF
                ? overdueTaskCount
                : item.href === SITE_LEADS_HREF
                  ? pendingSiteLeadCount
                  : 0;
            const href =
              item.href === TASKS_HREF && overdueTaskCount > 0
                ? `${TASKS_HREF}?overdue=1`
                : item.href;
            return (
              <Link
                key={item.href}
                href={href}
                onClick={() => onOpenChange(false)}
              >
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-gradient-to-r from-primary to-secondary text-white shadow-md shadow-primary/20"
                      : "text-sidebar-foreground/75 hover:bg-primary/10 hover:text-sidebar-foreground"
                  )}
                >
                  <div className="relative shrink-0">
                    <item.icon className="h-4 w-4" />
                    {item.href === TASKS_HREF || item.href === SITE_LEADS_HREF ? (
                      <NavBadge count={badgeCount} className="-right-1 -top-1" />
                    ) : null}
                  </div>
                  <span className="flex min-w-0 flex-1 items-center gap-2">
                    <span className="truncate">{item.label}</span>
                    {badgeCount > 0 ? (
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                          item.href === SITE_LEADS_HREF
                            ? "bg-[#E8952E]/12 text-[#E8952E]"
                            : "bg-[#EF4444]/12 text-[#EF4444]"
                        )}
                      >
                        {badgeCount > 9 ? "9+" : badgeCount}
                      </span>
                    ) : null}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
