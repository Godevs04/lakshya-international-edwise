import { PERMISSIONS, ROLE_PERMISSIONS, type Permission } from "@/lib/constants/permissions";
import type { UserRole } from "@/types";

export type MenuAccessLevel = "none" | "read" | "write";

/**
 * Controllable menu keys in Create User / Edit Access.
 * Aligned with sidebar items in `components/dashboard/nav-config.ts`
 * (From Site is derived from admissions|partners).
 */
export type MenuPermissionKey =
  | "overview"
  | "support"
  | "students"
  | "admissions"
  | "partners"
  | "applications"
  | "lenders"
  | "tasks"
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

/** Full portal menu catalog for admins (sidebar + access matrix). */
export const PORTAL_MENU_CATALOG = [
  {
    label: "Overview",
    controllable: true as const,
    menuKey: "overview" as const,
    note: "Independent — set None or Read below.",
  },
  {
    label: "From Site",
    controllable: false as const,
    note: "Shows when Admission Details or Partners has Read/Write.",
  },
  {
    label: "Support",
    controllable: true as const,
    menuKey: "support" as const,
    note: "Configurable below",
  },
  {
    label: "Students",
    controllable: true as const,
    menuKey: "students" as const,
    note: "Configurable below",
  },
  {
    label: "Admission Details",
    controllable: true as const,
    menuKey: "admissions" as const,
    note: "Configurable below",
  },
  {
    label: "Partners",
    controllable: true as const,
    menuKey: "partners" as const,
    note: "Configurable below",
  },
  {
    label: "Applications",
    controllable: true as const,
    menuKey: "applications" as const,
    note: "Configurable below",
  },
  {
    label: "Lenders",
    controllable: true as const,
    menuKey: "lenders" as const,
    note: "Independent of Students — set below.",
  },
  {
    label: "Tasks",
    controllable: true as const,
    menuKey: "tasks" as const,
    note: "Independent of Students — set below.",
  },
  {
    label: "Reports",
    controllable: true as const,
    menuKey: "reports" as const,
    note: "Configurable below",
  },
  {
    label: "Analytics",
    controllable: true as const,
    menuKey: "analytics" as const,
    note: "Configurable below",
  },
  {
    label: "Audit Log",
    controllable: true as const,
    menuKey: "audit" as const,
    note: "Configurable below",
  },
  {
    label: "Settings",
    controllable: true as const,
    menuKey: "settings" as const,
    note: "Configurable below",
  },
  {
    label: "User Management",
    controllable: true as const,
    menuKey: "users" as const,
    note: "Controlled inside Settings → Users.",
  },
] as const;

export const MENU_PERMISSION_MODULES: MenuPermissionModule[] = [
  {
    key: "overview",
    label: "Overview",
    description: "Main dashboard home and summary cards",
    readPermissions: [PERMISSIONS.OVERVIEW_READ],
    writePermissions: [],
  },
  {
    key: "support",
    label: "Support",
    description: "Inbox, conversations, and customer replies",
    readPermissions: [PERMISSIONS.SUPPORT_READ],
    writePermissions: [PERMISSIONS.SUPPORT_WRITE],
  },
  {
    key: "students",
    label: "Students",
    description: "CRM student records",
    readPermissions: [PERMISSIONS.STUDENTS_READ],
    writePermissions: [PERMISSIONS.STUDENTS_WRITE, PERMISSIONS.STUDENTS_EXPORT],
  },
  {
    key: "admissions",
    label: "Admission Details",
    description: "Admission pipeline (also enables From Site with Partners)",
    readPermissions: [PERMISSIONS.ADMISSIONS_READ],
    writePermissions: [PERMISSIONS.ADMISSIONS_WRITE],
  },
  {
    key: "partners",
    label: "Partners",
    description: "Consultancies & commissions (also enables From Site)",
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
    key: "lenders",
    label: "Lenders",
    description: "Bank / lender directory and logos",
    readPermissions: [PERMISSIONS.LENDERS_READ],
    writePermissions: [PERMISSIONS.LENDERS_WRITE],
  },
  {
    key: "tasks",
    label: "Tasks",
    description: "Follow-ups and assigned work items",
    readPermissions: [PERMISSIONS.TASKS_READ],
    writePermissions: [PERMISSIONS.TASKS_WRITE],
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
    description: "Team members, roles and menu access",
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

/**
 * @deprecated Legacy UI helper — do not use for new saves.
 */
export function applyLegacyMenuAccessFallback(access: MenuAccessMap): MenuAccessMap {
  if ((access.admissions ?? "none") === "none" && (access.students ?? "none") !== "none") {
    return { ...access, admissions: access.students };
  }
  return access;
}

/**
 * @deprecated Custom menu access must match exactly what was saved.
 */
export function inheritLegacyAdmissionsPermissions(permissions: string[]): string[] {
  return permissions;
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
  customPermissions: string[];
} {
  if (!useCustomPermissions) {
    return { useCustomPermissions: false, customPermissions: [] };
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

/** First dashboard path a user can open after login. */
export function getDefaultDashboardHref(permissions: string[]): string {
  if (permissions.includes("*") || permissions.includes(PERMISSIONS.OVERVIEW_READ)) {
    return "/dashboard/overview";
  }

  const candidates: Array<{ permission: string; href: string }> = [
    { permission: PERMISSIONS.STUDENTS_READ, href: "/dashboard/students" },
    { permission: PERMISSIONS.ADMISSIONS_READ, href: "/dashboard/admissions" },
    { permission: PERMISSIONS.PARTNERS_READ, href: "/dashboard/partners" },
    { permission: PERMISSIONS.APPLICATIONS_READ, href: "/dashboard/applications" },
    { permission: PERMISSIONS.LENDERS_READ, href: "/dashboard/lenders" },
    { permission: PERMISSIONS.TASKS_READ, href: "/dashboard/tasks" },
    { permission: PERMISSIONS.SUPPORT_READ, href: "/dashboard/support" },
    { permission: PERMISSIONS.REPORTS_READ, href: "/dashboard/reports" },
    { permission: PERMISSIONS.ANALYTICS_READ, href: "/dashboard/analytics" },
    { permission: PERMISSIONS.SETTINGS_READ, href: "/dashboard/settings" },
  ];

  for (const candidate of candidates) {
    if (
      permissions.includes(candidate.permission) ||
      permissions.includes(`${candidate.permission.split(":")[0]}:*`)
    ) {
      return candidate.href;
    }
  }

  return "/dashboard/profile";
}
