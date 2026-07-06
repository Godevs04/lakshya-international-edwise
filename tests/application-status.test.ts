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

  it("maps not interested to closed", () => {
    expect(applyApplicationStatus("not_interested")).toEqual({
      applicationStatus: "not_interested",
      status: "closed",
      loggedIn: false,
      pfPaid: false,
    });
  });

  it("maps need callback to contacted", () => {
    expect(applyApplicationStatus("need_callback")).toEqual({
      applicationStatus: "need_callback",
      status: "contacted",
      loggedIn: false,
      pfPaid: false,
    });
  });

  it("maps future intake to contacted", () => {
    expect(applyApplicationStatus("future_intake")).toEqual({
      applicationStatus: "future_intake",
      status: "contacted",
      loggedIn: false,
      pfPaid: false,
    });
  });
});

describe("buildWorkflowMongoFilter", () => {
  it("filters by applicationStatus", () => {
    expect(buildWorkflowMongoFilter("sanctioned")).toEqual({ applicationStatus: "sanctioned" });
    expect(buildWorkflowMongoFilter("not_interested")).toEqual({
      applicationStatus: "not_interested",
    });
    expect(buildWorkflowMongoFilter("rejected")).toEqual({
      $or: [{ applicationStatus: "rejected" }, { status: "rejected" }],
    });
  });
});
