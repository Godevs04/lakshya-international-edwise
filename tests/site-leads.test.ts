import { describe, expect, it, vi } from "vitest";
import {
  manualAdmissionLeadsFilter,
  websitePendingStudentLeadsFilter,
  websitePendingPartnerLeadsFilter,
  officialPartnersFilter,
  SITE_LEAD_PROMOTION_STATUS,
  SITE_LEAD_SOURCE,
} from "@/lib/constants/site-leads";
import {
  STUDENT_RECORD_TYPE,
  excludeAdmissionLeadsFilter,
} from "@/lib/constants/student-record-type";
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

describe("site-leads filters", () => {
  it("separates website pending student leads from manual admissions", () => {
    expect(websitePendingStudentLeadsFilter()).toEqual({
      recordType: STUDENT_RECORD_TYPE.ADMISSION,
      "metadata.leadSource": SITE_LEAD_SOURCE.WEBSITE,
      $or: [
        { "metadata.promotionStatus": { $exists: false } },
        { "metadata.promotionStatus": SITE_LEAD_PROMOTION_STATUS.PENDING },
      ],
    });

    expect(manualAdmissionLeadsFilter()).toEqual({
      recordType: STUDENT_RECORD_TYPE.ADMISSION,
      $or: [
        { "metadata.leadSource": { $exists: false } },
        { "metadata.leadSource": { $ne: SITE_LEAD_SOURCE.WEBSITE } },
      ],
    });
  });

  it("defines partner pending and official partner filters", () => {
    expect(websitePendingPartnerLeadsFilter()).toMatchObject({
      status: "pending",
      "metadata.leadSource": SITE_LEAD_SOURCE.WEBSITE,
    });

    expect(officialPartnersFilter().$or).toHaveLength(3);
  });

  it("excludes admission leads from student dashboard queries", () => {
    expect(excludeAdmissionLeadsFilter()).toEqual({
      recordType: { $ne: STUDENT_RECORD_TYPE.ADMISSION },
    });
  });
});

describe("site-leads route access", () => {
  it("allows admissions or partners read permission", () => {
    expect(
      canAccessRoute(mockUser("viewer", ["admissions:read"]), "/dashboard/site-leads")
    ).toBe(true);
    expect(
      canAccessRoute(mockUser("viewer", ["partners:read"]), "/dashboard/site-leads")
    ).toBe(true);
    expect(
      canAccessRoute(mockUser("viewer", ["students:read"]), "/dashboard/site-leads")
    ).toBe(false);
  });
});

describe("student and partner ID prefixes", () => {
  it("uses distinct prefixes for website leads vs official records", async () => {
    const { buildWebsiteLeadIdPrefix, buildStudentIdPrefix } = await import(
      "@/lib/services/student-id.service"
    );
    const { buildPartnerCodePrefix, buildWebsitePartnerLeadCodePrefix } = await import(
      "@/lib/services/partner-id.service"
    );

    expect(buildWebsiteLeadIdPrefix()).toMatch(/^LEAD-/);
    expect(buildStudentIdPrefix()).toMatch(/^STU-/);
    expect(buildWebsitePartnerLeadCodePrefix()).toMatch(/^LEAD-PTR-/);
    expect(buildPartnerCodePrefix()).toMatch(/^PTR-/);
  });
});

describe("dashboard student pipeline exclusion", () => {
  it("starts student dashboard aggregate with admission lead exclusion", async () => {
    const aggregate = vi.fn().mockResolvedValue([]);
    vi.doMock("@/lib/db/mongoose", () => ({
      connectDB: vi.fn().mockResolvedValue(undefined),
    }));
    vi.doMock("@/models/Student", () => ({
      Student: { aggregate },
    }));
    vi.doMock("@/models/Partner", () => ({
      Partner: { aggregate: vi.fn().mockResolvedValue([]) },
    }));
    vi.doMock("@/models/Application", () => ({
      Application: { aggregate: vi.fn().mockResolvedValue([]) },
    }));

    const { getDashboardCoreStats } = await import("@/lib/services/dashboard.service");
    await getDashboardCoreStats();

    const pipeline = aggregate.mock.calls[0]?.[0] as Record<string, unknown>[];
    expect(pipeline[0]).toEqual({ $match: excludeAdmissionLeadsFilter() });
  });
});
