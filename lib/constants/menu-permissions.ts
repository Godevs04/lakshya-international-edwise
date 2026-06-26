import { PERMISSIONS, ROLE_PERMISSIONS, type Permission } from "@/lib/constants/permissions";
import type { UserRole } from "@/types";

export type MenuAccessLevel = "none" | "read" | "write";

export type MenuPermissionKey =
  | "students"
  | "admissions"
  | "partners"
  | "applications"
  | "reports"
  | "analytics"
  | "audit"
  | "settings"
  | "users";

export interface MenuPermissionModule {
  key: MenuPermissionKey;
  label: string;
  description: string;
  readPermissions: Permission[];
  writePermissions: Permission[];
}

export const MENU_PERMISSION_MODULES: MenuPermissionModule[] = [
  {
    key: "students",
    label: "Students",
    description: "CRM records, lenders & tasks",
    readPermissions: [PERMISSIONS.STUDENTS_READ],
    writePermissions: [PERMISSIONS.STUDENTS_WRITE, PERMISSIONS.STUDENTS_EXPORT],
  },
  {
    key: "admissions",
    label: "Admission Details",
    description: "Admission pipeline and revenue tracking",
    readPermissions: [PERMISSIONS.ADMISSIONS_READ],
    writePermissions: [PERMISSIONS.ADMISSIONS_WRITE],
  },
  {
    key: "partners",
    label: "Partners",
    description: "Consultancies and commission tracking",
    readPermissions: [PERMISSIONS.PARTNERS_READ],
    writePermissions: [PERMISSIONS.PARTNERS_WRITE],
  },
  {
    key: "applications",
    label: "Applications",
    description: "Loan application pipeline",
    readPermissions: [PERMISSIONS.APPLICATIONS_READ],
    writePermissions: [PERMISSIONS.APPLICATIONS_WRITE],
  },
  {
    key: "reports",
    label: "Reports",
    description: "Operational and financial reports",
    readPermissions: [PERMISSIONS.REPORTS_READ],
    writePermissions: [PERMISSIONS.REPORTS_EXPORT],
  },
  {
    key: "analytics",
    label: "Analytics",
    description: "Dashboard charts and insights",
    readPermissions: [PERMISSIONS.ANALYTICS_READ],
    writePermissions: [],
  },
  {
    key: "audit",
    label: "Audit Log",
    description: "Activity and change history",
    readPermissions: [PERMISSIONS.AUDIT_READ],
    writePermissions: [],
  },
  {
    key: "settings",
    label: "Settings",
    description: "Company profile and app configuration",
    readPermissions: [PERMISSIONS.SETTINGS_READ],
    writePermissions: [PERMISSIONS.SETTINGS_WRITE],
  },
  {
    key: "users",
    label: "User Management",
    description: "Team members, roles and access",
    readPermissions: [PERMISSIONS.USERS_READ],
    writePermissions: [PERMISSIONS.USERS_WRITE, PERMISSIONS.USERS_DELETE],
  },
];

export type MenuAccessMap = Partial<Record<MenuPermissionKey, MenuAccessLevel>>;

const LEVEL_RANK: Record<MenuAccessLevel, number> = {
  none: 0,
  read: 1,
  write: 2,
};

function permissionSet(permissions: string[]): Set<string> {
  if (permissions.includes("*")) {
    return new Set(
      MENU_PERMISSION_MODULES.flatMap((module) => [
        ...module.readPermissions,
        ...module.writePermissions,
      ])
    );
  }
  return new Set(permissions);
}

function moduleLevelFromPermissions(
  module: MenuPermissionModule,
  granted: Set<string>
): MenuAccessLevel {
  const hasWrite =
    module.writePermissions.length > 0 &&
    module.writePermissions.every((permission) => granted.has(permission));
  if (hasWrite) return "write";

  const hasRead = module.readPermissions.every((permission) => granted.has(permission));
  if (hasRead) {
    if (module.writePermissions.length === 0) return "read";
    const hasAnyWrite = module.writePermissions.some((permission) => granted.has(permission));
    return hasAnyWrite ? "write" : "read";
  }

  return "none";
}

export function permissionsToMenuAccess(permissions: string[]): MenuAccessMap {
  const granted = permissionSet(permissions);
  const access: MenuAccessMap = {};

  for (const menuModule of MENU_PERMISSION_MODULES) {
    access[menuModule.key] = moduleLevelFromPermissions(menuModule, granted);
  }

  return access;
}

/** Show admissions access in the UI when older custom grants only included students. */
export function applyLegacyMenuAccessFallback(access: MenuAccessMap): MenuAccessMap {
  if (
    (access.admissions ?? "none") === "none" &&
    (access.students ?? "none") !== "none"
  ) {
    return { ...access, admissions: access.students };
  }
  return access;
}

/** Grant admissions permissions at runtime for custom grants saved before admissions split. */
export function inheritLegacyAdmissionsPermissions(permissions: string[]): string[] {
  if (permissions.includes("*")) return permissions;

  const hasAdmissionsRead =
    permissions.includes(PERMISSIONS.ADMISSIONS_READ) || permissions.includes("admissions:*");
  if (hasAdmissionsRead) return permissions;

  const hasStudentsRead =
    permissions.includes(PERMISSIONS.STUDENTS_READ) || permissions.includes("students:*");
  if (!hasStudentsRead) return permissions;

  const inherited = [...permissions, PERMISSIONS.ADMISSIONS_READ];
  const hasStudentsWrite = permissions.includes(PERMISSIONS.STUDENTS_WRITE);
  if (hasStudentsWrite) {
    inherited.push(PERMISSIONS.ADMISSIONS_WRITE);
  }
  return inherited;
}

export function menuAccessToPermissions(access: MenuAccessMap): string[] {
  const permissions = new Set<string>();

  for (const menuModule of MENU_PERMISSION_MODULES) {
    const level = access[menuModule.key] ?? "none";
    if (level === "none") continue;

    for (const permission of menuModule.readPermissions) {
      permissions.add(permission);
    }

    if (level === "write") {
      for (const permission of menuModule.writePermissions) {
        permissions.add(permission);
      }
    }
  }

  return [...permissions];
}

export function deriveMenuAccessFromRole(role: UserRole): MenuAccessMap {
  const rolePermissions = ROLE_PERMISSIONS[role];
  if (rolePermissions[0] === "*") {
    return Object.fromEntries(
      MENU_PERMISSION_MODULES.map((menuModule) => [menuModule.key, "write" as MenuAccessLevel])
    ) as MenuAccessMap;
  }
  return permissionsToMenuAccess(rolePermissions);
}

export function countMenuAccessLevels(access: MenuAccessMap): {
  read: number;
  write: number;
  none: number;
} {
  const counts = { read: 0, write: 0, none: 0 };
  for (const menuModule of MENU_PERMISSION_MODULES) {
    const level = access[menuModule.key] ?? "none";
    counts[level] += 1;
  }
  return counts;
}

export function isMenuAccessEqual(a: MenuAccessMap, b: MenuAccessMap): boolean {
  return MENU_PERMISSION_MODULES.every(
    (menuModule) => (a[menuModule.key] ?? "none") === (b[menuModule.key] ?? "none")
  );
}

export function highestMenuAccessLevel(
  current: MenuAccessLevel,
  next: MenuAccessLevel
): MenuAccessLevel {
  return LEVEL_RANK[next] > LEVEL_RANK[current] ? next : current;
}

export function buildUserPermissionFields(
  useCustomPermissions: boolean,
  menuAccess: MenuAccessMap
): {
  useCustomPermissions: boolean;
  customPermissions?: string[];
} {
  if (!useCustomPermissions) {
    return { useCustomPermissions: false, customPermissions: undefined };
  }

  return {
    useCustomPermissions: true,
    customPermissions: menuAccessToPermissions(menuAccess),
  };
}

export function parseMenuAccessJson(raw: FormDataEntryValue | null): MenuAccessMap {
  if (!raw || typeof raw !== "string") return {};
  try {
    return JSON.parse(raw) as MenuAccessMap;
  } catch {
    return {};
  }
}
