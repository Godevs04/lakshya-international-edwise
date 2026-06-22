import {
  LayoutDashboard,
  Users,
  Handshake,
  FileText,
  BarChart3,
  LineChart,
  Settings,
  Shield,
  type LucideIcon,
} from "lucide-react";
import type { AppModules } from "@/types";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  module: keyof AppModules | null;
  permission: string | null;
}

export const navItems: NavItem[] = [
  { href: "/dashboard/overview", label: "Overview", icon: LayoutDashboard, module: null, permission: null },
  { href: "/dashboard/students", label: "Students", icon: Users, module: "students", permission: null },
  { href: "/dashboard/partners", label: "Partners", icon: Handshake, module: "partners", permission: null },
  { href: "/dashboard/applications", label: "Applications", icon: FileText, module: "applications", permission: null },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3, module: "reports", permission: null },
  { href: "/dashboard/analytics", label: "Analytics", icon: LineChart, module: "analytics", permission: null },
  { href: "/dashboard/audit", label: "Audit Log", icon: Shield, module: null, permission: "audit:read" },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, module: null, permission: null },
];

export const MOBILE_PRIMARY_HREFS = [
  "/dashboard/overview",
  "/dashboard/students",
  "/dashboard/partners",
  "/dashboard/applications",
] as const;

export function isNavItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function filterNavItems(
  modules?: AppModules,
  permissions?: string[]
): NavItem[] {
  return navItems.filter((item) => {
    if (item.permission) {
      const perms = permissions ?? [];
      if (!perms.includes("*") && !perms.includes(item.permission)) return false;
    }
    if (!item.module) return true;
    return modules?.[item.module] !== false;
  });
}
