import { describe, expect, it } from "vitest";
import {
  calculateCommissionPayout,
  calculatePendingCommission,
  allocateSettledToStudents,
  resolveCommissionPercent,
  formatCommissionMonth,
} from "@/lib/services/partner-commission.service";

describe("calculateCommissionPayout", () => {
  it("returns zero when disbursed or percent is zero", () => {
    expect(calculateCommissionPayout(0, 10)).toBe(0);
    expect(calculateCommissionPayout(100000, 0)).toBe(0);
    expect(calculateCommissionPayout(0, 0)).toBe(0);
  });

  it("calculates payout from disbursed amount and commission percent", () => {
    expect(calculateCommissionPayout(1_000_000, 10)).toBe(100_000);
    expect(calculateCommissionPayout(250_000, 2.5)).toBe(6_250);
    expect(calculateCommissionPayout(2_280_000, 1)).toBe(22_800);
    expect(calculateCommissionPayout(2_280_000, 1.5)).toBe(34_200);
  });

  it("rounds payout to two decimal places", () => {
    expect(calculateCommissionPayout(100_001, 3)).toBe(3_000.03);
    expect(calculateCommissionPayout(100_000, 2.555)).toBe(2_555);
  });
});

describe("resolveCommissionPercent", () => {
  it("uses student override when provided", () => {
    expect(resolveCommissionPercent(2, 1.5)).toBe(1.5);
    expect(resolveCommissionPercent(2, 0)).toBe(0);
  });

  it("falls back to partner default when override is missing", () => {
    expect(resolveCommissionPercent(2.5, null)).toBe(2.5);
    expect(resolveCommissionPercent(2.5, undefined)).toBe(2.5);
  });
});

describe("calculatePendingCommission", () => {
  it("returns earned minus settled, never below zero", () => {
    expect(calculatePendingCommission(22_800, 10_000)).toBe(12_800);
    expect(calculatePendingCommission(22_800, 22_800)).toBe(0);
    expect(calculatePendingCommission(22_800, 30_000)).toBe(0);
  });
});

describe("allocateSettledToStudents", () => {
  it("allocates partner settlements proportionally across students", () => {
    const rows = [
      { id: "a", commissionEarned: 10_000 },
      { id: "b", commissionEarned: 5_000 },
      { id: "c", commissionEarned: 5_000 },
    ];

    const allocation = allocateSettledToStudents(rows, 12_000);

    expect(allocation.get("a")).toEqual({ settled: 6_000, pending: 4_000 });
    expect(allocation.get("b")).toEqual({ settled: 3_000, pending: 2_000 });
    expect(allocation.get("c")).toEqual({ settled: 3_000, pending: 2_000 });
  });

  it("returns zero allocation when no commission is earned", () => {
    const allocation = allocateSettledToStudents(
      [{ id: "a", commissionEarned: 0 }],
      1_000
    );
    expect(allocation.get("a")).toEqual({ settled: 0, pending: 0 });
  });
});

describe("formatCommissionMonth", () => {
  it("formats dates as YYYY-MM", () => {
    expect(formatCommissionMonth(new Date("2026-03-15T10:00:00Z"))).toBe("2026-03");
  });
});
