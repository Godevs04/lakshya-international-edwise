import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { canAccessRoute, hasPermission, hasAnyPermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/constants/permissions";
import type { Permission } from "@/lib/constants/permissions";

export async function requirePagePermission(permission: Permission): Promise<void> {
  const session = await auth();
  if (!hasPermission(session?.user, permission)) {
    redirect("/dashboard/overview");
  }
}

export async function requireAnyPagePermission(permissions: Permission[]): Promise<void> {
  const session = await auth();
  if (!hasAnyPermission(session?.user, permissions)) {
    redirect("/dashboard/overview");
  }
}

export async function requireRouteAccess(route: string): Promise<void> {
  const session = await auth();
  if (!canAccessRoute(session?.user, route)) {
    redirect("/dashboard/overview");
  }
}

export async function getStudentPageAccess() {
  const session = await auth();
  const user = session?.user;

  return {
    canWrite: hasPermission(user, PERMISSIONS.STUDENTS_WRITE),
    canDelete: hasPermission(user, PERMISSIONS.STUDENTS_DELETE),
    canExport: hasPermission(user, PERMISSIONS.STUDENTS_EXPORT),
  };
}

export async function getPartnerPageAccess() {
  const session = await auth();
  const user = session?.user;

  return {
    canWrite: hasPermission(user, PERMISSIONS.PARTNERS_WRITE),
    canDelete: hasPermission(user, PERMISSIONS.PARTNERS_DELETE),
  };
}

export async function getApplicationPageAccess() {
  const session = await auth();
  const user = session?.user;

  return {
    canWrite: hasPermission(user, PERMISSIONS.APPLICATIONS_WRITE),
  };
}
