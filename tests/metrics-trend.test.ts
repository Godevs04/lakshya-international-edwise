import { describe, expect, it } from "vitest";
import { formatMetricTrend } from "@/lib/utils/metrics-trend";

describe("formatMetricTrend", () => {
  it("returns empty when both values are zero", () => {
    expect(formatMetricTrend(0, 0)).toEqual({});
  });

  it("shows positive percentage change", () => {
    expect(formatMetricTrend(150, 100)).toEqual({ trend: "↑ 50%", trendUp: true });
  });

  it("shows negative percentage change", () => {
    expect(formatMetricTrend(80, 100)).toEqual({ trend: "↓ 20%", trendUp: false });
  });

  it("shows new label when previous is zero", () => {
    expect(formatMetricTrend(5, 0)).toEqual({ trend: "↑ new", trendUp: true });
  });
});
