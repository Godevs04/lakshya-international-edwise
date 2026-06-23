"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
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
import { AppLogo } from "@/components/brand/app-logo";
import type { AppModules } from "@/types";

interface SidebarProps {
  companyName: string;
  logo?: string;
  modules?: AppModules;
}

export function Sidebar({ companyName, logo, modules }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const filteredNav = filterNavItems(modules, session?.user?.permissions);

  return (
    <aside
      style={{ width: collapsed ? 80 : 260 }}
      className="fixed left-4 top-4 bottom-4 z-50 hidden flex-col overflow-hidden rounded-[30px] glass-sidebar transition-[width] duration-300 ease-out lg:flex"
    >
      <div className="flex h-[72px] items-center gap-3 px-5">
        <AppLogo src={logo} alt={companyName} variant="sidebar" />
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-foreground">{companyName}</p>
            <p className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
              <Sparkles className="h-2.5 w-2.5 text-[#6D5EF7]" />
              Enterprise CRM
            </p>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 px-3">
        <nav className="space-y-1 py-2">
          {filteredNav.map((item) => {
            const isActive = isNavItemActive(pathname, item.href);
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-[#6D5EF7] to-[#8B5CF6] text-white shadow-lg shadow-[#6D5EF7]/30"
                      : "text-muted-foreground hover:bg-[#6D5EF7]/8 hover:text-foreground"
                  )}
                >
                  <div
                    className={cn(
                      "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all",
                      isActive ? "bg-white/20" : "bg-[#6D5EF7]/8 group-hover:bg-[#6D5EF7]/15"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", isActive ? "text-white" : "text-[#6D5EF7]")} />
                  </div>
                  {!collapsed && (
                    <span className="relative z-10 truncate">{item.label}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="space-y-2 border-t border-[#6D5EF7]/10 p-3">
        <Link href="/dashboard/profile">
          <div
            className={cn(
              "flex items-center gap-3 rounded-2xl p-2.5 transition-colors hover:bg-[#6D5EF7]/8",
              collapsed && "justify-center"
            )}
          >
            <Avatar className="h-9 w-9 ring-2 ring-[#6D5EF7]/20">
              <AvatarImage src={session?.user?.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-[#6D5EF7] to-[#8B5CF6] text-xs text-white">
                {getInitials(session?.user?.name ?? "U")}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{session?.user?.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">{session?.user?.email}</p>
              </div>
            )}
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-xl py-2 text-muted-foreground transition-colors hover:bg-[#6D5EF7]/8 hover:text-[#6D5EF7]"
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
}: {
  item: NavItem;
  isActive: boolean;
}) {
  return (
    <Link
      href={item.href}
      className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl p-2 transition-all"
    >
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl transition-all",
          isActive
            ? "bg-gradient-to-br from-[#6D5EF7] to-[#8B5CF6] text-white shadow-lg shadow-[#6D5EF7]/30"
            : "bg-[#6D5EF7]/8 text-muted-foreground"
        )}
      >
        <item.icon className="h-4 w-4" />
      </div>
      <span
        className={cn(
          "max-w-full truncate text-center text-[10px] font-medium leading-tight",
          isActive ? "text-[#6D5EF7]" : "text-muted-foreground"
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
}: {
  modules?: AppModules;
  companyName?: string;
  logo?: string;
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

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#6D5EF7]/10 glass-sidebar pb-[env(safe-area-inset-bottom)] lg:hidden">
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
                  "flex h-9 w-9 items-center justify-center rounded-xl transition-all",
                  moreActive
                    ? "bg-gradient-to-br from-[#6D5EF7] to-[#8B5CF6] text-white shadow-lg shadow-[#6D5EF7]/30"
                    : "bg-[#6D5EF7]/8 text-muted-foreground"
                )}
              >
                <MoreHorizontal className="h-4 w-4" />
              </div>
              <span
                className={cn(
                  "max-w-full truncate text-center text-[10px] font-medium leading-tight",
                  moreActive ? "text-[#6D5EF7]" : "text-muted-foreground"
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
      />
    </>
  );
}
