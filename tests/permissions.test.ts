import { describe, expect, it } from "vitest";
import {
  getPermissionsForRole,
  hasPermission,
  requireAnyPermission,
  requirePermission,
} from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/constants/permissions";
import type { SessionUser } from "@/types";

function user(role: SessionUser["role"], permissions?: string[]): SessionUser {
  return {
    id: "1",
    email: "user@test.com",
    name: "Test User",
    role,
    permissions: permissions ?? [],
  };
}

describe("permissions", () => {
  it("grants super_admin wildcard permissions", () => {
    const perms = getPermissionsForRole("super_admin");
    expect(perms).toEqual(["*"]);
    expect(hasPermission(user("super_admin", ["*"]), PERMISSIONS.SETTINGS_WRITE)).toBe(true);
  });

  it("checks explicit permission for staff", () => {
    const staff = user("staff", getPermissionsForRole("staff"));
    expect(hasPermission(staff, PERMISSIONS.STUDENTS_READ)).toBe(true);
    expect(hasPermission(staff, PERMISSIONS.SETTINGS_WRITE)).toBe(false);
  });

  it("requirePermission throws when unauthorized", () => {
    const viewer = user("viewer", getPermissionsForRole("viewer"));
    expect(() => requirePermission(viewer, PERMISSIONS.USERS_WRITE)).toThrow(
      "Unauthorized: insufficient permissions"
    );
  });

  it("requireAnyPermission passes when one permission matches", () => {
    const staff = user("staff", getPermissionsForRole("staff"));
    expect(() =>
      requireAnyPermission(staff, [PERMISSIONS.ANALYTICS_READ, PERMISSIONS.STUDENTS_READ])
    ).not.toThrow();
  });

  it("requireAnyPermission throws when none match", () => {
    const viewer = user("viewer", getPermissionsForRole("viewer"));
    expect(() =>
      requireAnyPermission(viewer, [PERMISSIONS.USERS_WRITE, PERMISSIONS.SETTINGS_WRITE])
    ).toThrow("Unauthorized: insufficient permissions");
  });
});
