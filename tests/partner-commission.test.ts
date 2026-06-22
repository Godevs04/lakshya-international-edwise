import { describe, expect, it } from "vitest";
import { calculateCommissionPayout } from "@/lib/services/partner-commission.service";

describe("calculateCommissionPayout", () => {
  it("returns zero when disbursed or percent is zero", () => {
    expect(calculateCommissionPayout(0, 10)).toBe(0);
    expect(calculateCommissionPayout(100000, 0)).toBe(0);
    expect(calculateCommissionPayout(0, 0)).toBe(0);
  });

  it("calculates payout from disbursed amount and commission percent", () => {
    expect(calculateCommissionPayout(1_000_000, 10)).toBe(100_000);
    expect(calculateCommissionPayout(250_000, 2.5)).toBe(6_250);
  });

  it("rounds payout to nearest rupee", () => {
    expect(calculateCommissionPayout(100_001, 3)).toBe(3_000);
  });
});
