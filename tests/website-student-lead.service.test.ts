import { beforeEach, describe, expect, it, vi } from "vitest";

const studentFindOne = vi.fn();
const studentFindById = vi.fn();
const applicationFindOneAndUpdate = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/models/Student", () => ({
  Student: {
    findOne: (...args: unknown[]) => studentFindOne(...args),
    findById: (...args: unknown[]) => studentFindById(...args),
  },
}));

vi.mock("@/models/Application", () => ({
  Application: {
    findOneAndUpdate: (...args: unknown[]) => applicationFindOneAndUpdate(...args),
  },
}));

describe("website student lead resubmission", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    applicationFindOneAndUpdate.mockResolvedValue({});
  });

  it("finds pending website leads by phone", async () => {
    studentFindOne.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          _id: { toString: () => "lead-1" },
          studentId: "LEAD-LIE-000001",
        }),
      }),
    });

    const { findPendingWebsiteStudentLeadByPhone } = await import(
      "@/lib/services/website-student-lead.service"
    );
    const lead = await findPendingWebsiteStudentLeadByPhone("9876543210");

    expect(lead?.studentId).toBe("LEAD-LIE-000001");
  });

  it("updates pending lead metadata and appends a resubmission note", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const studentDoc: {
      _id: { toString: () => string };
      firstName: string;
      lastName: string;
      phone: string;
      notes: Array<Record<string, unknown>>;
      metadata: { resubmissionCount: number; preferredLender?: string };
      save: ReturnType<typeof vi.fn>;
    } = {
      _id: { toString: () => "lead-1" },
      firstName: "Priya",
      lastName: "Sharma",
      phone: "9876543210",
      notes: [],
      metadata: { resubmissionCount: 1 },
      save,
    };
    studentFindById.mockResolvedValue(studentDoc);

    const { updatePendingWebsiteStudentLead } = await import(
      "@/lib/services/website-student-lead.service"
    );

    const updated = await updatePendingWebsiteStudentLead("lead-1", {
      name: "Priya Sharma",
      phone: "9876543210",
      enquiryType: "eligibility",
      loanRequired: true,
      loanAmount: "50 Lakh",
      preferredLender: "SBI",
    });

    expect(updated).toBeTruthy();
    expect(studentDoc.metadata.resubmissionCount).toBe(2);
    expect(studentDoc.metadata.preferredLender).toBe("SBI");
    expect(studentDoc.notes).toHaveLength(1);
    expect(save).toHaveBeenCalledOnce();
    expect(applicationFindOneAndUpdate).toHaveBeenCalledWith(
      { studentId: studentDoc._id },
      { $set: { loanAmount: 5_000_000 } }
    );
  });

  it("stores a placeholder last name when resubmitted with a single-word name", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const studentDoc = {
      _id: { toString: () => "lead-1" },
      firstName: "Priya",
      lastName: "Sharma",
      phone: "9876543210",
      notes: [] as Array<Record<string, unknown>>,
      metadata: {},
      save,
    };
    studentFindById.mockResolvedValue(studentDoc);

    const { updatePendingWebsiteStudentLead } = await import(
      "@/lib/services/website-student-lead.service"
    );

    const updated = await updatePendingWebsiteStudentLead("lead-1", {
      name: "GOWTHAM",
      phone: "9876543210",
      enquiryType: "eligibility",
      loanRequired: false,
    });

    expect(updated).toBeTruthy();
    expect(studentDoc.firstName).toBe("GOWTHAM");
    expect(studentDoc.lastName).toBe(".");
    expect(save).toHaveBeenCalledOnce();
  });
});
