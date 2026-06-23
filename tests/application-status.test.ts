import { describe, expect, it } from "vitest";
import {
  applyApplicationStatus,
  deriveApplicationStatus,
} from "@/lib/constants/application-status";
import { buildWorkflowMongoFilter } from "@/lib/constants/student-workflow-filters";

describe("application status", () => {
  it("derives pf pending from loan fields", () => {
    expect(
      deriveApplicationStatus({
        status: "sanctioned",
        loggedIn: true,
        loan: { processingFee: 25000, pfPaid: false },
      })
    ).toBe("pf_pending");
  });

  it("applies rejected status mapping", () => {
    expect(applyApplicationStatus("rejected")).toEqual({
      applicationStatus: "rejected",
      status: "rejected",
      loggedIn: false,
      pfPaid: false,
    });
  });
});

describe("buildWorkflowMongoFilter", () => {
  it("filters by applicationStatus", () => {
    expect(buildWorkflowMongoFilter("sanctioned")).toEqual({ applicationStatus: "sanctioned" });
    expect(buildWorkflowMongoFilter("rejected")).toEqual({
      $or: [{ applicationStatus: "rejected" }, { status: "rejected" }],
    });
  });
});
