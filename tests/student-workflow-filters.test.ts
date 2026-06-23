import { describe, expect, it } from "vitest";
import { buildWorkflowMongoFilter } from "@/lib/constants/student-workflow-filters";
import { loanStatusChartHref } from "@/lib/utils/loan-status-chart";

describe("buildWorkflowMongoFilter", () => {
  it("returns null for all or empty workflow", () => {
    expect(buildWorkflowMongoFilter()).toBeNull();
    expect(buildWorkflowMongoFilter("all")).toBeNull();
  });

  it("maps workflow tabs to applicationStatus", () => {
    expect(buildWorkflowMongoFilter("docs_pending")).toEqual({ applicationStatus: "docs_pending" });
    expect(buildWorkflowMongoFilter("loggedin")).toEqual({ applicationStatus: "loggedin" });
    expect(buildWorkflowMongoFilter("pf_paid")).toEqual({ applicationStatus: "pf_paid" });
  });
});

describe("loanStatusChartHref", () => {
  it("maps chart labels to student list filters", () => {
    expect(loanStatusChartHref("documents pending")).toBe("/dashboard/students?workflow=docs_pending");
    expect(loanStatusChartHref("sanctioned")).toBe("/dashboard/students?workflow=sanctioned");
    expect(loanStatusChartHref("disbursed")).toBe("/dashboard/students?workflow=disbursed");
    expect(loanStatusChartHref("rejected")).toBe("/dashboard/students?status=rejected");
    expect(loanStatusChartHref("new")).toBe("/dashboard/students?status=new");
  });
});
