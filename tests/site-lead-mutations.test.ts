import { beforeEach, describe, expect, it, vi } from "vitest";
import { STUDENT_RECORD_TYPE } from "@/lib/constants/student-record-type";
import { SITE_LEAD_PROMOTION_STATUS, SITE_LEAD_SOURCE } from "@/lib/constants/site-leads";

const studentFindOne = vi.fn();
const studentFindByIdAndDelete = vi.fn();
const partnerFindOne = vi.fn();
const partnerFindByIdAndUpdate = vi.fn();
const applicationDeleteMany = vi.fn();
const partnerDelete = vi.fn();
const allocateStudentId = vi.fn();
const allocatePartnerCode = vi.fn();
const logActivity = vi.fn();
const getActivitiesForResource = vi.fn();
const getSessionUser = vi.fn();
const userFindById = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/auth/auth", () => ({
  getSessionUser: (...args: unknown[]) => getSessionUser(...args),
}));

vi.mock("@/models/Student", () => ({
  Student: {
    findOne: (...args: unknown[]) => studentFindOne(...args),
    findByIdAndDelete: (...args: unknown[]) => studentFindByIdAndDelete(...args),
  },
}));

vi.mock("@/models/Partner", () => ({
  Partner: {
    findOne: (...args: unknown[]) => partnerFindOne(...args),
    findByIdAndUpdate: (...args: unknown[]) => partnerFindByIdAndUpdate(...args),
    findByIdAndDelete: (...args: unknown[]) => partnerDelete(...args),
  },
}));

vi.mock("@/models/Application", () => ({
  Application: {
    deleteMany: (...args: unknown[]) => applicationDeleteMany(...args),
  },
}));

vi.mock("@/models/User", () => ({
  User: {
    findById: (...args: unknown[]) => userFindById(...args),
  },
}));

vi.mock("@/lib/services/student-id.service", () => ({
  allocateStudentId: (...args: unknown[]) => allocateStudentId(...args),
}));

vi.mock("@/lib/services/partner-id.service", () => ({
  allocatePartnerCode: (...args: unknown[]) => allocatePartnerCode(...args),
}));

vi.mock("@/lib/services/activity.service", () => ({
  logActivity: (...args: unknown[]) => logActivity(...args),
  getActivitiesForResource: (...args: unknown[]) => getActivitiesForResource(...args),
}));

vi.mock("@/lib/services/website-partner-lead.service", () => ({
  repairLegacyWebsitePartnerLeads: vi.fn().mockResolvedValue(0),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/cache/revalidate", () => ({
  revalidateInsightCaches: vi.fn(),
}));

const mockUser = {
  id: "507f1f77bcf86cd799439011",
  email: "staff@example.com",
  name: "Staff User",
  role: "admin" as const,
  permissions: ["admissions:write", "partners:write"],
};

describe("site lead mutations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSessionUser.mockResolvedValue(mockUser);
    logActivity.mockResolvedValue(undefined);
    getActivitiesForResource.mockResolvedValue([]);
    userFindById.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({ name: "Assignee One" }),
      }),
    });
    applicationDeleteMany.mockResolvedValue({ deletedCount: 1 });
    studentFindByIdAndDelete.mockResolvedValue({});
    partnerDelete.mockResolvedValue({});
    partnerFindByIdAndUpdate.mockResolvedValue({});
    allocateStudentId.mockResolvedValue("STU-LIE-000042");
    allocatePartnerCode.mockResolvedValue("PTR-LIE-000007");
  });

  it("promotes a website student lead to an official student record", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const student = {
      _id: { toString: () => "student-1" },
      studentId: "LEAD-LIE-000001",
      recordType: STUDENT_RECORD_TYPE.ADMISSION,
      status: "new",
      metadata: {
        leadSource: SITE_LEAD_SOURCE.WEBSITE,
        promotionStatus: SITE_LEAD_PROMOTION_STATUS.PENDING,
      },
      timeline: [] as Array<Record<string, unknown>>,
      save,
    };
    studentFindOne.mockResolvedValue(student);

    const { promoteSiteStudentLeadAction } = await import("@/lib/actions/site-lead.actions");
    const formData = new FormData();
    const result = await promoteSiteStudentLeadAction("student-1", formData);

    expect(result.success).toBe(true);
    if (result.success && result.data) {
      expect(result.data.officialId).toBe("STU-LIE-000042");
    }
    expect(student.studentId).toBe("STU-LIE-000042");
    expect(student.recordType).toBe(STUDENT_RECORD_TYPE.STUDENT);
    expect(student.metadata.promotionStatus).toBe(SITE_LEAD_PROMOTION_STATUS.PROMOTED);
    expect(save).toHaveBeenCalledOnce();
  });

  it("deletes a website student lead and its linked applications", async () => {
    const studentDoc = {
      _id: { toString: () => "student-1" },
      studentId: "LEAD-LIE-000001",
    };
    studentFindOne.mockResolvedValue(studentDoc);

    const { deleteSiteStudentLeadAction } = await import("@/lib/actions/site-lead.actions");
    const result = await deleteSiteStudentLeadAction("student-1");

    expect(result.success).toBe(true);
    expect(applicationDeleteMany).toHaveBeenCalledWith({ studentId: studentDoc._id });
    expect(studentFindByIdAndDelete).toHaveBeenCalledWith(studentDoc._id);
  });

  it("promotes a website partner lead to an active official partner", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const partner = {
      _id: { toString: () => "partner-1" },
      partnerCode: "LEAD-PTR-LIE-000001",
      status: "pending",
      commissionPercent: 0,
      metadata: {
        leadSource: SITE_LEAD_SOURCE.WEBSITE,
        promotionStatus: SITE_LEAD_PROMOTION_STATUS.PENDING,
      },
      save,
    };
    partnerFindOne.mockResolvedValue(partner);

    const { promoteSitePartnerLeadAction } = await import("@/lib/actions/site-lead.actions");
    const formData = new FormData();
    formData.set("commissionPercent", "12");
    const result = await promoteSitePartnerLeadAction("partner-1", formData);

    expect(result.success).toBe(true);
    if (result.success && result.data) {
      expect(result.data.officialCode).toBe("PTR-LIE-000007");
    }
    expect(partner.partnerCode).toBe("PTR-LIE-000007");
    expect(partner.status).toBe("active");
    expect(partner.commissionPercent).toBe(12);
    expect(partner.metadata.promotionStatus).toBe(SITE_LEAD_PROMOTION_STATUS.PROMOTED);
    expect(save).toHaveBeenCalledOnce();
  });

  it("deletes a pending website partner lead", async () => {
    const partnerDoc = {
      _id: { toString: () => "partner-1" },
      partnerCode: "LEAD-PTR-LIE-000001",
      companyName: "Test Agency",
    };
    partnerFindOne.mockResolvedValue(partnerDoc);

    const { deleteSitePartnerLeadAction } = await import("@/lib/actions/site-lead.actions");
    const result = await deleteSitePartnerLeadAction("partner-1");

    expect(result.success).toBe(true);
    expect(partnerDelete).toHaveBeenCalledWith(partnerDoc._id);
  });

  it("assigns a pending website student lead before promotion", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const student: {
      _id: { toString: () => string };
      studentId: string;
      assignedTo?: unknown;
      assignedAt?: Date;
      save: ReturnType<typeof vi.fn>;
    } = {
      _id: { toString: () => "student-1" },
      studentId: "LEAD-LIE-000001",
      save,
    };
    studentFindOne.mockResolvedValue(student);

    const { assignSiteStudentLeadAction } = await import("@/lib/actions/site-lead.actions");
    const result = await assignSiteStudentLeadAction("student-1", "507f1f77bcf86cd799439012");

    expect(result.success).toBe(true);
    expect(student.assignedTo).toBeTruthy();
    expect(student.assignedAt).toBeInstanceOf(Date);
    expect(save).toHaveBeenCalledOnce();
  });

  it("bulk promotes selected website student leads", async () => {
    const first = {
      _id: { toString: () => "student-1" },
      studentId: "LEAD-LIE-000001",
      recordType: STUDENT_RECORD_TYPE.ADMISSION,
      status: "new",
      metadata: {},
      timeline: [] as Array<Record<string, unknown>>,
      save: vi.fn().mockResolvedValue(undefined),
    };
    const second = {
      _id: { toString: () => "student-2" },
      studentId: "LEAD-LIE-000002",
      recordType: STUDENT_RECORD_TYPE.ADMISSION,
      status: "new",
      metadata: {},
      timeline: [] as Array<Record<string, unknown>>,
      save: vi.fn().mockResolvedValue(undefined),
    };
    studentFindOne.mockResolvedValueOnce(first).mockResolvedValueOnce(second);

    const { bulkPromoteSiteStudentLeadsAction } = await import("@/lib/actions/site-lead.actions");
    const result = await bulkPromoteSiteStudentLeadsAction(["student-1", "student-2"]);

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ promoted: 2, failed: 0 });
  });
});
