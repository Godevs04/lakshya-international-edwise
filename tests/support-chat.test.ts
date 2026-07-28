import { describe, expect, it } from "vitest";
import { PERMISSIONS, ROLE_PERMISSIONS } from "@/lib/constants/permissions";
import { WEBSITE_LEAD_SOURCES, SITE_LEAD_SOURCE } from "@/lib/constants/site-leads";
import { SUPPORT_CONVERSATION_STATUSES, SUPPORT_ADMISSION_STATUSES } from "@/lib/constants/support";
import { supportQualifySchema } from "@/lib/validations/support";
import { hasPermission } from "@/lib/auth/permissions";
import type { SessionUser } from "@/types";

describe("support permissions", () => {
  it("grants staff support read/write but not assign", () => {
    const staffPerms = ROLE_PERMISSIONS.staff as string[];
    expect(staffPerms).toContain(PERMISSIONS.SUPPORT_READ);
    expect(staffPerms).toContain(PERMISSIONS.SUPPORT_WRITE);
    expect(staffPerms).not.toContain(PERMISSIONS.SUPPORT_ASSIGN);

    const user: SessionUser = {
      id: "1",
      email: "a@b.com",
      name: "Staff",
      role: "staff",
      permissions: staffPerms,
    };
    expect(hasPermission(user, PERMISSIONS.SUPPORT_WRITE)).toBe(true);
    expect(hasPermission(user, PERMISSIONS.SUPPORT_ASSIGN)).toBe(false);
  });

  it("grants manager assign + manage", () => {
    const managerPerms = ROLE_PERMISSIONS.manager as string[];
    expect(managerPerms).toContain(PERMISSIONS.SUPPORT_ASSIGN);
    expect(managerPerms).toContain(PERMISSIONS.SUPPORT_MANAGE);
  });
});

describe("support lead sources", () => {
  it("includes website_chat in website lead sources", () => {
    expect(WEBSITE_LEAD_SOURCES).toContain(SITE_LEAD_SOURCE.WEBSITE_CHAT);
  });
});

describe("support constants", () => {
  it("defines conversation statuses", () => {
    expect(SUPPORT_CONVERSATION_STATUSES).toContain("waiting");
    expect(SUPPORT_CONVERSATION_STATUSES).toContain("assigned");
    expect(SUPPORT_ADMISSION_STATUSES).toContain("got_admission");
  });
});

describe("supportQualifySchema", () => {
  it("accepts a valid qualification payload", () => {
    const parsed = supportQualifySchema.safeParse({
      visitorId: "550e8400-e29b-41d4-a716-446655440000",
      name: "John Doe",
      phone: "9876543210",
      email: "",
      country: "UK",
      degree: "MBA",
      admissionStatus: "applied",
      collateralPreference: "without_collateral",
      loanRequired: true,
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects invalid phone", () => {
    const parsed = supportQualifySchema.safeParse({
      visitorId: "550e8400-e29b-41d4-a716-446655440000",
      name: "John Doe",
      phone: "123",
      country: "UK",
      degree: "MBA",
      admissionStatus: "applied",
      collateralPreference: "without_collateral",
      loanRequired: true,
    });
    expect(parsed.success).toBe(false);
  });
});
