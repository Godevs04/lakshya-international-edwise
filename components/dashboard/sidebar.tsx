"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
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
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AppModules } from "@/types";

const navItems = [
  { href: "/dashboard/overview", label: "Overview", icon: LayoutDashboard, module: null },
  { href: "/dashboard/students", label: "Students", icon: Users, module: "students" as keyof AppModules },
  { href: "/dashboard/partners", label: "Partners", icon: Handshake, module: "partners" as keyof AppModules },
  { href: "/dashboard/applications", label: "Applications", icon: FileText, module: "applications" as keyof AppModules },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3, module: "reports" as keyof AppModules },
  { href: "/dashboard/analytics", label: "Analytics", icon: LineChart, module: "analytics" as keyof AppModules },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, module: null },
];

interface SidebarProps {
  companyName: string;
  logo?: string;
  modules?: AppModules;
}

export function Sidebar({ companyName, logo, modules }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const filteredNav = navItems.filter((item) => {
    if (!item.module || !modules) return true;
    return modules[item.module];
  });

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen flex-col border-r bg-sidebar transition-all duration-300",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      <div className="flex h-16 items-center gap-3 border-b px-4">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt={companyName} className="h-8 w-8 rounded-lg object-cover" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
            {companyName.charAt(0)}
          </div>
        )}
        {!collapsed && (
          <span className="truncate text-sm font-semibold">{companyName}</span>
        )}
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {filteredNav.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="border-t p-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  );
}
