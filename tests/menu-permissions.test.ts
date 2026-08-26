import { describe, expect, it } from "vitest";
import {
  deriveMenuAccessFromRole,
  menuAccessToPermissions,
  permissionsToMenuAccess,
  buildUserPermissionFields,
  getDefaultDashboardHref,
  MENU_PERMISSION_MODULES,
  PORTAL_MENU_CATALOG,
} from "@/lib/constants/menu-permissions";
import { resolveUserPermissions } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { navItems } from "@/components/dashboard/nav-config";

describe("menu-permissions", () => {
  it("lists every controllable module shared by create and edit access UIs", () => {
    expect(MENU_PERMISSION_MODULES.map((module) => module.key)).toEqual([
      "overview",
      "support",
      "students",
      "admissions",
      "partners",
      "applications",
      "lenders",
      "tasks",
      "reports",
      "analytics",
      "audit",
      "settings",
      "users",
    ]);
  });

  it("documents every portal sidebar menu in the catalog", () => {
    const catalogLabels = PORTAL_MENU_CATALOG.map((item) => item.label);
    for (const item of navItems) {
      expect(catalogLabels).toContain(item.label);
    }
    expect(catalogLabels).toContain("User Management");
  });

  it("keeps overview, lenders, and tasks independently controllable", () => {
    const permissions = menuAccessToPermissions({
      students: "write",
      overview: "none",
      lenders: "none",
      tasks: "none",
    });

    expect(permissions).toContain(PERMISSIONS.STUDENTS_READ);
    expect(permissions).not.toContain(PERMISSIONS.OVERVIEW_READ);
    expect(permissions).not.toContain(PERMISSIONS.LENDERS_READ);
    expect(permissions).not.toContain(PERMISSIONS.TASKS_READ);

    const access = permissionsToMenuAccess(permissions);
    expect(access.students).toBe("write");
    expect(access.overview).toBe("none");
    expect(access.lenders).toBe("none");
    expect(access.tasks).toBe("none");
  });

  it("documents overview, lenders, and tasks as independently configurable", () => {
    for (const label of ["Overview", "Lenders", "Tasks"] as const) {
      const item = PORTAL_MENU_CATALOG.find((entry) => entry.label === label);
      expect(item?.controllable).toBe(true);
      expect(item && "note" in item ? item.note : "").toMatch(/Independent/i);
    }
  });

  it("converts menu access levels to permission strings", () => {
    const permissions = menuAccessToPermissions({
      overview: "read",
      students: "write",
      admissions: "read",
      partners: "read",
      lenders: "write",
      tasks: "read",
      support: "write",
      analytics: "read",
      users: "none",
    });

    expect(permissions).toContain(PERMISSIONS.OVERVIEW_READ);
    expect(permissions).toContain(PERMISSIONS.STUDENTS_READ);
    expect(permissions).toContain(PERMISSIONS.STUDENTS_WRITE);
    expect(permissions).toContain(PERMISSIONS.ADMISSIONS_READ);
    expect(permissions).not.toContain(PERMISSIONS.ADMISSIONS_WRITE);
    expect(permissions).toContain(PERMISSIONS.PARTNERS_READ);
    expect(permissions).not.toContain(PERMISSIONS.PARTNERS_WRITE);
    expect(permissions).toContain(PERMISSIONS.LENDERS_READ);
    expect(permissions).toContain(PERMISSIONS.LENDERS_WRITE);
    expect(permissions).toContain(PERMISSIONS.TASKS_READ);
    expect(permissions).not.toContain(PERMISSIONS.TASKS_WRITE);
    expect(permissions).toContain(PERMISSIONS.SUPPORT_READ);
    expect(permissions).toContain(PERMISSIONS.SUPPORT_WRITE);
    expect(permissions).toContain(PERMISSIONS.ANALYTICS_READ);
    expect(permissions).not.toContain(PERMISSIONS.USERS_READ);
  });

  it("does not auto-grant admissions when only students is selected", () => {
    const permissions = menuAccessToPermissions({
      students: "write",
      admissions: "none",
    });
    expect(permissions).toContain(PERMISSIONS.STUDENTS_READ);
    expect(permissions).toContain(PERMISSIONS.STUDENTS_WRITE);
    expect(permissions).not.toContain(PERMISSIONS.ADMISSIONS_READ);
    expect(permissions).not.toContain(PERMISSIONS.ADMISSIONS_WRITE);

    const access = permissionsToMenuAccess(permissions);
    expect(access.students).toBe("write");
    expect(access.admissions).toBe("none");
  });

  it("derives menu access from role permissions", () => {
    const access = deriveMenuAccessFromRole("viewer");
    expect(access.overview).toBe("read");
    expect(access.students).toBe("read");
    expect(access.admissions).toBe("read");
    expect(access.lenders).toBe("read");
    expect(access.tasks).toBe("read");
    expect(access.support).toBe("read");
    expect(access.settings).toBe("none");
  });

  it("picks the first allowed dashboard after login", () => {
    expect(getDefaultDashboardHref([PERMISSIONS.OVERVIEW_READ])).toBe("/dashboard/overview");
    expect(getDefaultDashboardHref([PERMISSIONS.STUDENTS_READ])).toBe("/dashboard/students");
    expect(getDefaultDashboardHref([PERMISSIONS.LENDERS_READ])).toBe("/dashboard/lenders");
    expect(getDefaultDashboardHref([])).toBe("/dashboard/profile");
  });

  it("round-trips custom permissions through menu access", () => {
    const original = menuAccessToPermissions({
      overview: "read",
      students: "write",
      lenders: "read",
      tasks: "write",
      reports: "read",
      settings: "write",
      support: "read",
    });
    const access = permissionsToMenuAccess(original);
    const roundTrip = menuAccessToPermissions(access);

    expect(roundTrip).toEqual(expect.arrayContaining(original));
    expect(original).toEqual(expect.arrayContaining(roundTrip));
  });

  it("builds stored user permission fields including empty custom grants", () => {
    expect(buildUserPermissionFields(false, { students: "write" })).toEqual({
      useCustomPermissions: false,
      customPermissions: [],
    });

    expect(buildUserPermissionFields(true, { students: "read" })).toEqual({
      useCustomPermissions: true,
      customPermissions: [PERMISSIONS.STUDENTS_READ],
    });

    expect(buildUserPermissionFields(true, {})).toEqual({
      useCustomPermissions: true,
      customPermissions: [],
    });
  });
});

describe("resolveUserPermissions", () => {
  it("uses custom permissions when enabled", () => {
    const permissions = resolveUserPermissions("staff", true, [PERMISSIONS.REPORTS_READ]);
    expect(permissions).toEqual([PERMISSIONS.REPORTS_READ]);
  });

  it("does not inherit admissions from students for custom grants", () => {
    const permissions = resolveUserPermissions("staff", true, [
      PERMISSIONS.STUDENTS_READ,
      PERMISSIONS.STUDENTS_WRITE,
    ]);
    expect(permissions).toEqual([PERMISSIONS.STUDENTS_READ, PERMISSIONS.STUDENTS_WRITE]);
    expect(permissions).not.toContain(PERMISSIONS.ADMISSIONS_READ);
  });

  it("keeps empty custom permissions instead of falling back to the role", () => {
    const permissions = resolveUserPermissions("staff", true, []);
    expect(permissions).toEqual([]);
  });

  it("falls back to role permissions when custom mode is off", () => {
    const permissions = resolveUserPermissions("viewer", false, [PERMISSIONS.USERS_WRITE]);
    expect(permissions).toContain(PERMISSIONS.STUDENTS_READ);
    expect(permissions).not.toContain(PERMISSIONS.USERS_WRITE);
  });
});
