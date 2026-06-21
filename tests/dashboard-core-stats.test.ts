import { describe, expect, it, vi, beforeEach } from "vitest";
import { formatMetricTrend } from "@/lib/utils/metrics-trend";

const studentAggregate = vi.fn();
const partnerAggregate = vi.fn();
const applicationAggregate = vi.fn();
const studentCountDocuments = vi.fn();

vi.mock("@/lib/db/mongoose", () => ({
  connectDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/models/Student", () => ({
  Student: {
    aggregate: (...args: unknown[]) => studentAggregate(...args),
    countDocuments: (...args: unknown[]) => studentCountDocuments(...args),
  },
}));

vi.mock("@/models/Partner", () => ({
  Partner: {
    aggregate: (...args: unknown[]) => partnerAggregate(...args),
  },
}));

vi.mock("@/models/Application", () => ({
  Application: {
    aggregate: (...args: unknown[]) => applicationAggregate(...args),
  },
}));

describe("dashboard core stats mapping", () => {
  it("formats trend deltas consistently", () => {
    expect(formatMetricTrend(10, 5)).toEqual({ trend: "↑ 100%", trendUp: true });
    expect(formatMetricTrend(0, 0)).toEqual({});
    expect(formatMetricTrend(3, 0)).toEqual({ trend: "↑ new", trendUp: true });
  });
});

describe("getDashboardCoreStats query count", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    studentAggregate.mockResolvedValue([
      {
        totalStudents: 100,
        newStudentsToday: 2,
        sanctioned: 10,
        disbursed: 8,
        rejected: 3,
        totalLoanAmount: 500000,
        todaysCollection: 10000,
        studentsThisMonth: 20,
        studentsLastMonth: 15,
        studentsToday: 2,
        studentsYesterday: 1,
        sanctionedThisMonth: 4,
        sanctionedLastMonth: 3,
        disbursedThisMonth: 2,
        disbursedLastMonth: 1,
        rejectedThisMonth: 1,
        rejectedLastMonth: 0,
        loanThisMonth: 100000,
        loanLastMonth: 80000,
        collectionToday: 10000,
        collectionYesterday: 5000,
      },
    ]);
    partnerAggregate.mockResolvedValue([
      { totalPartners: 5, partnersThisMonth: 1, partnersLastMonth: 2 },
    ]);
    applicationAggregate.mockResolvedValue([
      { pendingApplications: 4, pendingLastMonth: 6 },
    ]);
  });

  it("uses exactly 3 aggregate queries and no countDocuments", async () => {
    const { getDashboardCoreStats } = await import("@/lib/services/dashboard.service");
    const result = await getDashboardCoreStats();

    expect(studentAggregate).toHaveBeenCalledTimes(1);
    expect(partnerAggregate).toHaveBeenCalledTimes(1);
    expect(applicationAggregate).toHaveBeenCalledTimes(1);
    expect(studentCountDocuments).not.toHaveBeenCalled();

    expect(result.metrics.totalStudents).toBe(100);
    expect(result.metrics.totalPartners).toBe(5);
    expect(result.trends.totalStudents).toEqual({ trend: "↑ 33%", trendUp: true });
  });
});
