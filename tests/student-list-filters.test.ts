import { describe, expect, it } from "vitest";
import { getStatusesForLoanStage, STUDENT_LOAN_STAGES } from "@/lib/constants/student-loan-stages";
import {
  buildStudentListQuery,
  countActiveAdvancedFilters,
} from "@/lib/utils/student-list-filters";

describe("student loan stages", () => {
  it("defines pipeline tabs including all", () => {
    expect(STUDENT_LOAN_STAGES.map((stage) => stage.id)).toEqual([
      "all",
      "new",
      "documents",
      "submitted",
      "sanctioned",
      "disbursed",
    ]);
  });

  it("maps stage ids to status groups", () => {
    expect(getStatusesForLoanStage("documents")).toEqual(["documents_pending"]);
    expect(getStatusesForLoanStage("submitted")).toEqual([
      "submitted",
      "under_verification",
      "approved",
    ]);
    expect(getStatusesForLoanStage("all")).toBeUndefined();
    expect(getStatusesForLoanStage(undefined)).toBeUndefined();
  });
});

describe("student list filters", () => {
  it("builds query string from active filters", () => {
    const query = buildStudentListQuery({
      search: "kavin",
      stage: "submitted",
      mine: "1",
      partnerId: "abc123",
      loanMin: "100000",
    });

    expect(query).toContain("search=kavin");
    expect(query).toContain("stage=submitted");
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
        stage: "new",
        partnerId: "abc",
        loanMax: "500000",
      })
    ).toBe(2);
  });
});
