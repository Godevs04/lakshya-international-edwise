"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Handshake,
  FileText,
  BarChart3,
  LineChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Menu,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getInitials } from "@/lib/utils/format";
import type { AppModules } from "@/types";

const navItems = [
  { href: "/dashboard/overview", label: "Overview", icon: LayoutDashboard, module: null, permission: null },
  { href: "/dashboard/students", label: "Students", icon: Users, module: "students" as keyof AppModules, permission: null },
  { href: "/dashboard/partners", label: "Partners", icon: Handshake, module: "partners" as keyof AppModules, permission: null },
  { href: "/dashboard/applications", label: "Applications", icon: FileText, module: "applications" as keyof AppModules, permission: null },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3, module: "reports" as keyof AppModules, permission: null },
  { href: "/dashboard/analytics", label: "Analytics", icon: LineChart, module: "analytics" as keyof AppModules, permission: null },
  { href: "/dashboard/audit", label: "Audit Log", icon: Shield, module: null, permission: "audit:read" },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, module: null, permission: null },
];

function useFilteredNav(modules?: AppModules, permissions?: string[]) {
  return navItems.filter((item) => {
    if (item.permission) {
      const perms = permissions ?? [];
      if (!perms.includes("*") && !perms.includes(item.permission)) return false;
    }
    if (!item.module) return true;
    return modules?.[item.module] !== false;
  });
}

interface SidebarProps {
  companyName: string;
  logo?: string;
  modules?: AppModules;
}

export function Sidebar({ companyName, logo, modules }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const filteredNav = useFilteredNav(modules, session?.user?.permissions);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-4 top-4 bottom-4 z-50 hidden lg:flex flex-col rounded-[30px] glass-sidebar overflow-hidden"
    >
      <div className="flex h-[72px] items-center gap-3 px-5">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt={companyName} className="h-10 w-10 rounded-2xl object-cover ring-2 ring-white/50" />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6D5EF7] to-[#8B5CF6] text-sm font-bold text-white shadow-lg shadow-[#6D5EF7]/30">
            {companyName.charAt(0)}
          </div>
        )}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="min-w-0"
            >
              <p className="truncate text-sm font-bold text-foreground">{companyName}</p>
              <p className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                <Sparkles className="h-2.5 w-2.5 text-[#6D5EF7]" />
                Enterprise CRM
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ScrollArea className="flex-1 px-3">
        <nav className="space-y-1 py-2">
          {filteredNav.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "text-white shadow-lg shadow-[#6D5EF7]/30"
                      : "text-muted-foreground hover:bg-[#6D5EF7]/8 hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#6D5EF7] to-[#8B5CF6]"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                    />
                  )}
                  <div
                    className={cn(
                      "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all",
                      isActive ? "bg-white/20" : "bg-[#6D5EF7]/8 group-hover:bg-[#6D5EF7]/15"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", isActive ? "text-white" : "text-[#6D5EF7]")} />
                  </div>
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative z-10 truncate"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="border-t border-[#6D5EF7]/10 p-3 space-y-2">
        <Link href="/dashboard/profile">
          <motion.div
            whileHover={{ scale: 1.02 }}
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
          </motion.div>
        </Link>
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-xl py-2 text-muted-foreground transition-colors hover:bg-[#6D5EF7]/8 hover:text-[#6D5EF7]"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </motion.aside>
  );
}

function NavLinkItem({
  item,
  isActive,
  compact = false,
}: {
  item: (typeof navItems)[number];
  isActive: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      href={item.href}
      className={cn(
        "flex shrink-0 flex-col items-center gap-1 rounded-2xl p-2 transition-all",
        compact ? "min-w-[64px]" : "min-w-[72px]"
      )}
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
          "max-w-[64px] truncate text-center text-[10px] font-medium leading-tight",
          isActive ? "text-[#6D5EF7]" : "text-muted-foreground"
        )}
      >
        {item.label}
      </span>
    </Link>
  );
}

export function MobileTopBar({
  companyName,
  logo,
  modules,
}: {
  companyName: string;
  logo?: string;
  modules?: AppModules;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const filteredNav = useFilteredNav(modules, session?.user?.permissions);

  return (
    <div className="flex items-center justify-between gap-3 lg:hidden">
      <div className="flex min-w-0 items-center gap-2.5">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt={companyName} className="h-9 w-9 shrink-0 rounded-xl object-cover ring-2 ring-[#6D5EF7]/15" />
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#6D5EF7] to-[#8B5CF6] text-xs font-bold text-white">
            {companyName.charAt(0)}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{companyName}</p>
          <p className="text-[10px] text-muted-foreground">Enterprise CRM</p>
        </div>
      </div>

      <Sheet>
        <SheetTrigger className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#6D5EF7]/15 bg-white/60 backdrop-blur-xl dark:bg-white/5">
          <Menu className="h-5 w-5 text-[#6D5EF7]" />
          <span className="sr-only">Open menu</span>
        </SheetTrigger>
        <SheetContent side="right" className="w-[min(100vw-2rem,320px)] glass-sidebar border-[#6D5EF7]/15 p-0">
          <SheetHeader className="border-b border-[#6D5EF7]/10 px-5 py-4 text-left">
            <SheetTitle className="text-base font-bold">{companyName}</SheetTitle>
          </SheetHeader>
          <nav className="space-y-1 p-3">
            {filteredNav.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-gradient-to-r from-[#6D5EF7] to-[#8B5CF6] text-white shadow-md"
                        : "text-muted-foreground hover:bg-[#6D5EF7]/8"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export function MobileNav({ modules }: { modules?: AppModules }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const filteredNav = useFilteredNav(modules, session?.user?.permissions);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#6D5EF7]/10 glass-sidebar pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="scrollbar-hide flex items-stretch gap-0.5 overflow-x-auto px-2 py-2">
        {filteredNav.map((item) => (
          <NavLinkItem
            key={item.href}
            item={item}
            isActive={pathname.startsWith(item.href)}
            compact
          />
        ))}
      </div>
    </nav>
  );
}
