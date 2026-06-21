import type { SessionUser, UserRole } from "@/types";
import { ROLE_PERMISSIONS } from "@/lib/constants/permissions";

export function getPermissionsForRole(role: UserRole): string[] {
  const perms = ROLE_PERMISSIONS[role];
  if (perms[0] === "*") return ["*"];
  return [...perms];
}

export function hasPermission(
  user: SessionUser | null | undefined,
  permission: string
): boolean {
  if (!user) return false;
  if (user.permissions.includes("*")) return true;
  if (user.permissions.includes(permission)) return true;
  const [resource] = permission.split(":");
  return user.permissions.includes(`${resource}:*`);
}

export function hasAnyPermission(
  user: SessionUser | null | undefined,
  permissions: string[]
): boolean {
  return permissions.some((p) => hasPermission(user, p));
}

const ROUTE_PERMISSIONS: { prefix: string; permission: string }[] = [
  { prefix: "/dashboard/students", permission: "students:read" },
  { prefix: "/dashboard/partners", permission: "partners:read" },
  { prefix: "/dashboard/applications", permission: "applications:read" },
  { prefix: "/dashboard/reports", permission: "reports:read" },
  { prefix: "/dashboard/analytics", permission: "analytics:read" },
  { prefix: "/dashboard/settings", permission: "settings:read" },
  { prefix: "/dashboard/audit", permission: "audit:read" },
];

export function canAccessRoute(
  user: SessionUser | null | undefined,
  route: string
): boolean {
  if (!user) return false;
  if (user.role === "super_admin") return true;

  for (const { prefix, permission } of ROUTE_PERMISSIONS) {
    if (route.startsWith(prefix)) {
      return hasPermission(user, permission);
    }
  }

  return true;
}

export function requireAnyPermission(
  user: SessionUser | null | undefined,
  permissions: string[]
): void {
  if (!hasAnyPermission(user, permissions)) {
    throw new Error("Unauthorized: insufficient permissions");
  }
}

export function requirePermission(
  user: SessionUser | null | undefined,
  permission: string
): void {
  if (!hasPermission(user, permission)) {
    throw new Error("Unauthorized: insufficient permissions");
  }
}
