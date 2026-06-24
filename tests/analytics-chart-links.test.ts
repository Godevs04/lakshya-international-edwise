import { describe, expect, it } from "vitest";
import {
  analyticsChartPointHref,
  analyticsCourseHref,
  analyticsFunnelHref,
  analyticsGenderHref,
  analyticsLenderHref,
  analyticsLoanRangeHref,
  analyticsStateHref,
} from "@/lib/utils/analytics-chart-links";

describe("analytics-chart-links", () => {
  it("builds workflow funnel links", () => {
    expect(analyticsFunnelHref("docs_pending", "workflow")).toBe(
      "/dashboard/students?workflow=docs_pending"
    );
    expect(analyticsFunnelHref("disbursed", "workflow")).toBe(
      "/dashboard/students?workflow=disbursed"
    );
  });

  it("builds lifecycle status links", () => {
    expect(analyticsFunnelHref("documents_pending", "status")).toBe(
      "/dashboard/students?status=documents_pending"
    );
    expect(analyticsFunnelHref("rejected", "status")).toBe(
      "/dashboard/students?status=rejected"
    );
  });

  it("builds demographic and loan drill-down links", () => {
    expect(analyticsStateHref("Tamil Nadu")).toBe(
      "/dashboard/students?state=Tamil%20Nadu"
    );
    expect(analyticsCourseHref("MBA")).toBe("/dashboard/students?course=MBA");
    expect(analyticsGenderHref("female")).toBe("/dashboard/students?gender=female");
    expect(analyticsLoanRangeHref(100000, 299999)).toBe(
      "/dashboard/students?loanMin=100000&loanMax=299999"
    );
    expect(analyticsLenderHref("Credila")).toBe("/dashboard/students?lenderId=credila");
  });

  it("resolves chart point hrefs only when value is positive", () => {
    expect(
      analyticsChartPointHref({ name: "Docs Pending", value: 0, key: "docs_pending" }, "workflow")
    ).toBeNull();
    expect(
      analyticsChartPointHref({ name: "Docs Pending", value: 3, key: "docs_pending" }, "workflow")
    ).toBe("/dashboard/students?workflow=docs_pending");
    expect(
      analyticsChartPointHref(
        { name: "1L-3L", value: 2, loanMin: 100000, loanMax: 299999 },
        "loan"
      )
    ).toBe("/dashboard/students?loanMin=100000&loanMax=299999");
  });
});
