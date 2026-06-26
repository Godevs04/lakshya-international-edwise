import { describe, expect, it } from "vitest";
import {
  deriveMenuAccessFromRole,
  applyLegacyMenuAccessFallback,
  menuAccessToPermissions,
  permissionsToMenuAccess,
  buildUserPermissionFields,
} from "@/lib/constants/menu-permissions";
import { resolveUserPermissions } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/constants/permissions";

describe("menu-permissions", () => {
  it("converts menu access levels to permission strings", () => {
    const permissions = menuAccessToPermissions({
      students: "write",
      admissions: "read",
      partners: "read",
      analytics: "read",
      users: "none",
    });

    expect(permissions).toContain(PERMISSIONS.STUDENTS_READ);
    expect(permissions).toContain(PERMISSIONS.STUDENTS_WRITE);
    expect(permissions).toContain(PERMISSIONS.ADMISSIONS_READ);
    expect(permissions).not.toContain(PERMISSIONS.ADMISSIONS_WRITE);
    expect(permissions).toContain(PERMISSIONS.PARTNERS_READ);
    expect(permissions).not.toContain(PERMISSIONS.PARTNERS_WRITE);
    expect(permissions).toContain(PERMISSIONS.ANALYTICS_READ);
    expect(permissions).not.toContain(PERMISSIONS.USERS_READ);
  });

  it("derives menu access from role permissions", () => {
    const access = deriveMenuAccessFromRole("viewer");
    expect(access.students).toBe("read");
    expect(access.admissions).toBe("read");
    expect(access.settings).toBe("none");
  });

  it("inherits admissions access from students for legacy custom permissions", () => {
    const access = applyLegacyMenuAccessFallback(
      permissionsToMenuAccess([PERMISSIONS.STUDENTS_READ, PERMISSIONS.STUDENTS_WRITE])
    );
    expect(access.students).toBe("write");
    expect(access.admissions).toBe("write");
  });

  it("round-trips custom permissions through menu access", () => {
    const original = menuAccessToPermissions({
      students: "write",
      reports: "read",
      settings: "write",
    });
    const access = permissionsToMenuAccess(original);
    const roundTrip = menuAccessToPermissions(access);

    expect(roundTrip).toEqual(expect.arrayContaining(original));
    expect(original).toEqual(expect.arrayContaining(roundTrip));
  });

  it("builds stored user permission fields", () => {
    expect(buildUserPermissionFields(false, { students: "write" })).toEqual({
      useCustomPermissions: false,
      customPermissions: undefined,
    });

    expect(buildUserPermissionFields(true, { students: "read" })).toEqual({
      useCustomPermissions: true,
      customPermissions: [PERMISSIONS.STUDENTS_READ],
    });
  });
});

describe("resolveUserPermissions", () => {
  it("uses custom permissions when enabled", () => {
    const permissions = resolveUserPermissions("staff", true, [PERMISSIONS.REPORTS_READ]);
    expect(permissions).toEqual([PERMISSIONS.REPORTS_READ]);
  });

  it("inherits admissions permissions for legacy custom grants", () => {
    const permissions = resolveUserPermissions("staff", true, [
      PERMISSIONS.STUDENTS_READ,
      PERMISSIONS.STUDENTS_WRITE,
    ]);
    expect(permissions).toContain(PERMISSIONS.ADMISSIONS_READ);
    expect(permissions).toContain(PERMISSIONS.ADMISSIONS_WRITE);
  });

  it("falls back to role permissions when custom mode is off", () => {
    const permissions = resolveUserPermissions("viewer", false, [PERMISSIONS.USERS_WRITE]);
    expect(permissions).toContain(PERMISSIONS.STUDENTS_READ);
    expect(permissions).not.toContain(PERMISSIONS.USERS_WRITE);
  });
});
