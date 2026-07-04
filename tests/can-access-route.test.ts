import { describe, expect, it } from "vitest";
import { canAccessRoute } from "@/lib/auth/permissions";
import type { SessionUser } from "@/types";

function mockUser(role: SessionUser["role"], permissions: string[]): SessionUser {
  return {
    id: "user-1",
    email: "user@example.com",
    name: "Test User",
    role,
    permissions,
  };
}

describe("canAccessRoute", () => {
  it("allows super admin on all guarded routes", () => {
    const user = mockUser("super_admin", ["*"]);
    expect(canAccessRoute(user, "/dashboard/settings")).toBe(true);
    expect(canAccessRoute(user, "/dashboard/audit")).toBe(true);
  });

  it("blocks viewer from settings", () => {
    const user = mockUser("viewer", [
      "students:read",
      "admissions:read",
      "partners:read",
      "applications:read",
      "reports:read",
      "analytics:read",
    ]);
    expect(canAccessRoute(user, "/dashboard/settings")).toBe(false);
    expect(canAccessRoute(user, "/dashboard/students")).toBe(true);
    expect(canAccessRoute(user, "/dashboard/admissions")).toBe(true);
  });

  it("blocks viewer without admissions read from admissions route", () => {
    const user = mockUser("viewer", [
      "students:read",
      "partners:read",
      "applications:read",
      "reports:read",
      "analytics:read",
    ]);
    expect(canAccessRoute(user, "/dashboard/students")).toBe(true);
    expect(canAccessRoute(user, "/dashboard/admissions")).toBe(false);
    expect(canAccessRoute(user, "/dashboard/site-leads")).toBe(true);
  });

  it("blocks unauthenticated access", () => {
    expect(canAccessRoute(null, "/dashboard/students")).toBe(false);
  });
});
