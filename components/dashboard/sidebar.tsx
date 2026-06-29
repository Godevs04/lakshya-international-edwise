"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils/format";
import {
  filterNavItems,
  isNavItemActive,
  MOBILE_PRIMARY_HREFS,
  type NavItem,
} from "@/components/dashboard/nav-config";
import { MobileNavSheet } from "@/components/dashboard/mobile-nav-sheet";
import { SidebarBrand } from "@/components/brand/sidebar-brand";
import { NavBadge } from "@/components/dashboard/nav-badge";
import type { AppModules } from "@/types";

const TASKS_HREF = "/dashboard/tasks";

interface SidebarProps {
  companyName: string;
  logo?: string;
  modules?: AppModules;
  overdueTaskCount?: number;
}

export function Sidebar({ companyName, logo, modules, overdueTaskCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const filteredNav = filterNavItems(modules, session?.user?.permissions);

  return (
    <aside
      style={{ width: collapsed ? 80 : 260 }}
      className="fixed left-0 top-0 bottom-0 z-50 hidden flex-col overflow-hidden rounded-none sidebar-solid transition-[width] duration-300 ease-out lg:flex lg:rounded-r-[28px]"
    >
      <div className="shrink-0 border-b border-sidebar-border px-4 py-3.5">
        <SidebarBrand
          companyName={companyName}
          logo={logo}
          collapsed={collapsed}
        />
      </div>

      <ScrollArea className="flex-1 px-3">
        <nav className="space-y-1 py-2">
          {filteredNav.map((item) => {
            const isActive = isNavItemActive(pathname, item.href);
            const href =
              item.href === TASKS_HREF && overdueTaskCount > 0
                ? `${TASKS_HREF}?overdue=1`
                : item.href;
            return (
              <Link key={item.href} href={href}>
                <div
                  className={cn(
                    "group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-primary to-secondary text-white shadow-md shadow-primary/20"
                      : "text-sidebar-foreground/75 hover:bg-primary/10 hover:text-sidebar-foreground"
                  )}
                >
                  <div
                    className={cn(
                      "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all",
                      isActive ? "bg-white/25" : "bg-primary/10 group-hover:bg-primary/15"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", isActive ? "text-white" : "text-primary")} />
                    {item.href === TASKS_HREF && (
                      <NavBadge count={overdueTaskCount} collapsed={collapsed} />
                    )}
                  </div>
                  {!collapsed && (
                    <span className="relative z-10 flex min-w-0 flex-1 items-center gap-2 truncate">
                      <span className="truncate">{item.label}</span>
                      {item.href === TASKS_HREF && overdueTaskCount > 0 && (
                        <span className="shrink-0 rounded-full bg-[#EF4444]/12 px-2 py-0.5 text-[10px] font-semibold text-[#EF4444]">
                          {overdueTaskCount > 9 ? "9+" : overdueTaskCount}
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="space-y-2 border-t border-sidebar-border p-3">
        <Link href="/dashboard/profile">
          <div
            className={cn(
              "flex items-center gap-3 rounded-2xl p-2.5 transition-colors hover:bg-primary/10",
              collapsed && "justify-center"
            )}
          >
            <Avatar className="h-9 w-9 ring-2 ring-primary/15">
              <AvatarImage src={session?.user?.avatar} />
              <AvatarFallback className="bg-primary/15 text-xs text-sidebar-foreground">
                {getInitials(session?.user?.name ?? "U")}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-sidebar-foreground">{session?.user?.name}</p>
                <p className="truncate text-[11px] text-sidebar-foreground/60">{session?.user?.email}</p>
              </div>
            )}
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-xl py-2 text-sidebar-foreground/60 transition-colors hover:bg-primary/10 hover:text-sidebar-foreground"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}

function NavLinkItem({
  item,
  isActive,
  badgeCount = 0,
}: {
  item: NavItem;
  isActive: boolean;
  badgeCount?: number;
}) {
  return (
    <Link
      href={item.href}
      className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl p-2 transition-all"
    >
      <div
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-xl transition-all",
          isActive
            ? "bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/20"
            : "bg-primary/10 text-sidebar-foreground"
        )}
      >
        <item.icon className="h-4 w-4" />
        <NavBadge count={badgeCount} />
      </div>
      <span
        className={cn(
          "max-w-full truncate text-center text-[10px] font-medium leading-tight",
          isActive ? "text-primary" : "text-muted-foreground"
        )}
      >
        {item.label}
      </span>
    </Link>
  );
}

export function MobileNav({
  modules,
  companyName = "CRM",
  logo,
  overdueTaskCount = 0,
}: {
  modules?: AppModules;
  companyName?: string;
  logo?: string;
  overdueTaskCount?: number;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [moreOpen, setMoreOpen] = useState(false);
  const filteredNav = filterNavItems(modules, session?.user?.permissions);
  const primaryNav = filteredNav.filter((item) =>
    MOBILE_PRIMARY_HREFS.includes(item.href as (typeof MOBILE_PRIMARY_HREFS)[number])
  );
  const secondaryNav = filteredNav.filter(
    (item) =>
      !MOBILE_PRIMARY_HREFS.includes(item.href as (typeof MOBILE_PRIMARY_HREFS)[number])
  );
  const moreActive = secondaryNav.some((item) => isNavItemActive(pathname, item.href));
  const tasksInSecondary = secondaryNav.some((item) => item.href === TASKS_HREF);
  const showMoreBadge = tasksInSecondary && overdueTaskCount > 0;

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-primary/10 glass-surface pb-[env(safe-area-inset-bottom)] lg:hidden">
        <div className="flex items-stretch gap-0.5 px-2 py-2">
          {primaryNav.map((item) => (
            <NavLinkItem
              key={item.href}
              item={item}
              isActive={isNavItemActive(pathname, item.href)}
            />
          ))}
          {secondaryNav.length > 0 && (
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl p-2 transition-all"
            >
              <div
                className={cn(
                  "relative flex h-9 w-9 items-center justify-center rounded-xl transition-all",
                  moreActive
                    ? "bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/20"
                    : "bg-primary/10 text-muted-foreground"
                )}
              >
                <MoreHorizontal className="h-4 w-4" />
                {showMoreBadge && <NavBadge count={overdueTaskCount} />}
              </div>
              <span
                className={cn(
                  "max-w-full truncate text-center text-[10px] font-medium leading-tight",
                  moreActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                More
              </span>
            </button>
          )}
        </div>
      </nav>

      <MobileNavSheet
        open={moreOpen}
        onOpenChange={setMoreOpen}
        companyName={companyName}
        logo={logo}
        modules={modules}
        items={secondaryNav}
        overdueTaskCount={overdueTaskCount}
      />
    </>
  );
}
