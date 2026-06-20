"use client";

import { useSession } from "next-auth/react";
import { hasPermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/constants/permissions";

export function usePermissions() {
  const { data: session } = useSession();
  const user = session?.user;

  return {
    user,
    can: (permission: string) => hasPermission(user, permission),
    canReadStudents: hasPermission(user, PERMISSIONS.STUDENTS_READ),
    canWriteStudents: hasPermission(user, PERMISSIONS.STUDENTS_WRITE),
    canDeleteStudents: hasPermission(user, PERMISSIONS.STUDENTS_DELETE),
    canExportStudents: hasPermission(user, PERMISSIONS.STUDENTS_EXPORT),
    canReadPartners: hasPermission(user, PERMISSIONS.PARTNERS_READ),
    canWritePartners: hasPermission(user, PERMISSIONS.PARTNERS_WRITE),
    canDeletePartners: hasPermission(user, PERMISSIONS.PARTNERS_DELETE),
    canReadApplications: hasPermission(user, PERMISSIONS.APPLICATIONS_READ),
    canWriteApplications: hasPermission(user, PERMISSIONS.APPLICATIONS_WRITE),
    canReadReports: hasPermission(user, PERMISSIONS.REPORTS_READ),
    canExportReports: hasPermission(user, PERMISSIONS.REPORTS_EXPORT),
    canReadAnalytics: hasPermission(user, PERMISSIONS.ANALYTICS_READ),
    canReadSettings: hasPermission(user, PERMISSIONS.SETTINGS_READ),
    canWriteSettings: hasPermission(user, PERMISSIONS.SETTINGS_WRITE),
    canManageUsers: hasPermission(user, PERMISSIONS.USERS_WRITE),
  };
}
