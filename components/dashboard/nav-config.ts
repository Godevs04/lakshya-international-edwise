import {
  LayoutDashboard,
  Users,
  Handshake,
  FileText,
  Building2,
  ListTodo,
  BarChart3,
  LineChart,
  Settings,
  Shield,
  GraduationCap,
  Globe,
  type LucideIcon,
} from "lucide-react";
import type { AppModules } from "@/types";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  module: keyof AppModules | null;
  permission: string | null;
  anyPermissions?: string[];
}

export const navItems: NavItem[] = [
  { href: "/dashboard/overview", label: "Overview", icon: LayoutDashboard, module: null, permission: null },
  { href: "/dashboard/site-leads", label: "From Site", icon: Globe, module: null, permission: null, anyPermissions: ["admissions:read", "partners:read"] },
  { href: "/dashboard/students", label: "Students", icon: Users, module: "students", permission: "students:read" },
  { href: "/dashboard/admissions", label: "Admission Details", icon: GraduationCap, module: "students", permission: "admissions:read" },
  { href: "/dashboard/partners", label: "Partners", icon: Handshake, module: "partners", permission: "partners:read" },
  { href: "/dashboard/applications", label: "Applications", icon: FileText, module: "applications", permission: "applications:read" },
  { href: "/dashboard/lenders", label: "Lenders", icon: Building2, module: "lenders", permission: "students:read" },
  { href: "/dashboard/tasks", label: "Tasks", icon: ListTodo, module: "tasks", permission: "students:read" },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3, module: "reports", permission: "reports:read" },
  { href: "/dashboard/analytics", label: "Analytics", icon: LineChart, module: "analytics", permission: "analytics:read" },
  { href: "/dashboard/audit", label: "Audit Log", icon: Shield, module: null, permission: "audit:read" },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, module: null, permission: "settings:read" },
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
  const perms = permissions ?? [];
  const hasWildcard = perms.includes("*");

  return navItems.filter((item) => {
    if (item.anyPermissions?.length) {
      if (!hasWildcard && !item.anyPermissions.some((p) => perms.includes(p))) {
        return false;
      }
    } else if (item.permission && !hasWildcard && !perms.includes(item.permission)) {
      return false;
    }
    if (!item.module) return true;
    return modules?.[item.module] !== false;
  });
}
