import type { UserRole } from "@/types";

export function canViewAllOverdueTasks(role?: UserRole): boolean {
  return role === "admin" || role === "super_admin";
}

export function resolveOverdueTaskCount(params: {
  role?: UserRole;
  myOverdue: number;
  allOverdue: number;
}): number {
  if (canViewAllOverdueTasks(params.role)) {
    return params.allOverdue;
  }
  return params.myOverdue;
}
