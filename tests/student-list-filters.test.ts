import { describe, expect, it } from "vitest";
import {
  STUDENT_WORKFLOW_FILTERS,
  buildWorkflowMongoFilter,
} from "@/lib/constants/student-workflow-filters";
import {
  buildStudentListQuery,
  countActiveAdvancedFilters,
  parseStatusFilter,
  serializeStatusFilter,
} from "@/lib/utils/student-list-filters";

describe("student workflow filters", () => {
  it("defines workflow tabs including all", () => {
    expect(STUDENT_WORKFLOW_FILTERS.map((workflow) => workflow.id)).toEqual([
      "all",
      "docs_pending",
      "loggedin",
      "sanctioned",
      "pf_paid",
      "pf_pending",
      "disbursed",
      "not_interested",
      "rejected",
    ]);
  });

  it("maps workflow ids to mongo filters", () => {
    expect(buildWorkflowMongoFilter("docs_pending")).toEqual({ applicationStatus: "docs_pending" });
    expect(buildWorkflowMongoFilter("loggedin")).toEqual({ applicationStatus: "loggedin" });
    expect(buildWorkflowMongoFilter("pf_paid")).toEqual({ applicationStatus: "pf_paid" });
    expect(buildWorkflowMongoFilter("not_interested")).toEqual({ applicationStatus: "not_interested" });
    expect(buildWorkflowMongoFilter("rejected")).toEqual({
      $or: [{ applicationStatus: "rejected" }, { status: "rejected" }],
    });
    expect(buildWorkflowMongoFilter("all")).toBeNull();
    expect(buildWorkflowMongoFilter(undefined)).toBeNull();
  });
});

describe("student list filters", () => {
  it("builds query string from active filters", () => {
    const query = buildStudentListQuery({
      search: "kavin",
      workflow: "sanctioned",
      lenderId: "credila",
      mine: "1",
      partnerId: "abc123",
      loanMin: "100000",
    });

    expect(query).toContain("search=kavin");
    expect(query).toContain("workflow=sanctioned");
    expect(query).toContain("lenderId=credila");
    expect(query).toContain("mine=1");
    expect(query).toContain("partnerId=abc123");
    expect(query).toContain("loanMin=100000");
  });

  it("clears filters when overridden with undefined", () => {
    const query = buildStudentListQuery(
      { search: "kavin", partnerId: "abc123", page: "2" },
      { partnerId: undefined, page: undefined }
    );

    expect(query).toBe("search=kavin");
  });

  it("counts advanced filters only", () => {
    expect(
      countActiveAdvancedFilters({
        search: "kavin",
        mine: "1",
        workflow: "loggedin",
        partnerId: "abc",
        loanMax: "500000",
      })
    ).toBe(2);
  });

  it("parses and serializes multi-status filter", () => {
    expect(parseStatusFilter("submitted,approved,invalid")).toEqual(["submitted", "approved"]);
    expect(serializeStatusFilter(["disbursed", "submitted"])).toBe("disbursed,submitted");
    expect(serializeStatusFilter([])).toBeUndefined();
    expect(
      buildStudentListQuery({
        status: "submitted,approved",
      })
    ).toBe("status=submitted%2Capproved");
    expect(
      countActiveAdvancedFilters({
        status: "submitted,approved",
      })
    ).toBe(1);
  });
});
