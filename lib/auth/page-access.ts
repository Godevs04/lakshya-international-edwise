import { auth } from "@/lib/auth/auth";
import { hasPermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/constants/permissions";

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
