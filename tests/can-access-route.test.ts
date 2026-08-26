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

  it("guards overview, lenders, and tasks with dedicated permissions", () => {
    const banker = mockUser("staff", ["students:read", "students:write"]);
    expect(canAccessRoute(banker, "/dashboard/overview")).toBe(false);
    expect(canAccessRoute(banker, "/dashboard/lenders")).toBe(false);
    expect(canAccessRoute(banker, "/dashboard/tasks")).toBe(false);
    expect(canAccessRoute(banker, "/dashboard/students")).toBe(true);

    const withExtras = mockUser("staff", [
      "overview:read",
      "students:read",
      "lenders:read",
      "tasks:read",
    ]);
    expect(canAccessRoute(withExtras, "/dashboard/overview")).toBe(true);
    expect(canAccessRoute(withExtras, "/dashboard/lenders")).toBe(true);
    expect(canAccessRoute(withExtras, "/dashboard/tasks")).toBe(true);
  });
});
