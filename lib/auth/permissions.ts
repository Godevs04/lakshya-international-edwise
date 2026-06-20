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

export function canAccessRoute(
  user: SessionUser | null | undefined,
  route: string
): boolean {
  if (!user) return false;
  if (user.role === "super_admin") return true;

  const routePermissions: Record<string, string> = {
    "/dashboard/settings": "settings:read",
    "/dashboard/reports": "reports:read",
    "/dashboard/analytics": "analytics:read",
  };

  for (const [prefix, permission] of Object.entries(routePermissions)) {
    if (route.startsWith(prefix)) {
      return hasPermission(user, permission);
    }
  }

  return true;
}

export function requirePermission(
  user: SessionUser | null | undefined,
  permission: string
): void {
  if (!hasPermission(user, permission)) {
    throw new Error("Unauthorized: insufficient permissions");
  }
}
