import { describe, expect, it } from "vitest";
import {
  calculateExpectedCommission,
  calculatePartnerShareExpected,
  calculatePendingReceived,
  calculatePendingShared,
  calculateNetEarned,
  allocateSettledToStudents,
  resolvePartnerSharePercent,
  formatCommissionMonth,
  matchesCommissionStatusFilter,
  calculateCommissionPayout,
  calculatePendingCommission,
  resolveCommissionPercent,
  calculateTdsAmount,
  calculateNetAfterTds,
  resolveAgreedNetPayable,
  calculateRetainedFromNet,
  grossSettlementForAgreedNet,
  settlementObligationGross,
  grossForSyncedPaidCash,
  isStudentPayoutComplete,
} from "@/lib/services/partner-commission.service";

describe("two-tier commission formulas", () => {
  it("calculates expected commission from disbursement and our rate", () => {
    expect(calculateExpectedCommission(100_000, 1.6)).toBe(1_600);
    expect(calculateExpectedCommission(0, 1.6)).toBe(0);
    expect(calculateExpectedCommission(100_000, 0)).toBe(0);
  });

  it("calculates partner share from disbursement", () => {
    expect(calculatePartnerShareExpected(100_000, 0.8)).toBe(800);
  });

  it("calculates pending received and shared", () => {
    expect(calculatePendingReceived(1_600, 1_000)).toBe(600);
    expect(calculatePendingShared(800, 5)).toBe(795);
  });

  it("calculates net earned as received minus shared", () => {
    expect(calculateNetEarned(1_600, 800)).toBe(800);
  });

  it("withholds 2% TDS from partner share automatically", () => {
    expect(calculateTdsAmount(24_000)).toBe(480);
    expect(calculateNetAfterTds(24_000)).toBe(23_520);
    expect(calculateTdsAmount(0)).toBe(0);
    expect(calculateNetAfterTds(0)).toBe(0);
  });

  it("keeps an agreed net below calculated and tallies the retained gap", () => {
    const calculatedNet = 42_000;
    const agreedNet = resolveAgreedNetPayable(calculatedNet, 40_000);
    expect(agreedNet).toBe(40_000);
    expect(calculateRetainedFromNet(calculatedNet, agreedNet)).toBe(2_000);
    expect(resolveAgreedNetPayable(calculatedNet, null)).toBe(42_000);
    expect(resolveAgreedNetPayable(calculatedNet, 50_000)).toBe(42_000);

    const share = 42_857.14;
    expect(calculateNetAfterTds(share)).toBe(42_000);
    const obligation = settlementObligationGross(share, calculatedNet, agreedNet);
    expect(calculateNetAfterTds(obligation)).toBe(40_000);
    expect(grossSettlementForAgreedNet(40_000)).toBe(obligation);
    expect(calculatePendingShared(obligation, obligation)).toBe(0);
    expect(settlementObligationGross(share, calculatedNet, calculatedNet)).toBe(share);
  });

  it("syncs a paid cash above the old pending remainder to the same final net", () => {
    const share = 23_045.83;
    const calculatedNet = calculateNetAfterTds(share);
    const alreadyPaidGross = 20_580;
    const pendingRemainder = calculatePendingShared(share, alreadyPaidGross);
    const paidCash = 20_580;

    expect(calculatedNet).toBe(22_584.91);
    expect(pendingRemainder).toBe(2_465.83);
    expect(paidCash).toBeGreaterThan(pendingRemainder);
    expect(paidCash).toBeLessThan(calculatedNet);

    const finalNet = resolveAgreedNetPayable(calculatedNet, paidCash);
    const gross = grossForSyncedPaidCash(share, calculatedNet, paidCash);
    expect(finalNet).toBe(paidCash);
    expect(calculateNetAfterTds(gross)).toBe(paidCash);
    expect(calculatePendingShared(gross, gross)).toBe(0);
    expect(calculateRetainedFromNet(calculatedNet, finalNet)).toBe(2_004.91);
    expect(isStudentPayoutComplete(share, calculatePendingShared(gross, gross), paidCash)).toBe(
      true
    );
    expect(gross).toBe(21_000);
    expect(calculateNetEarned(52_676.19, paidCash)).toBe(32_096.19);
    expect(calculateNetEarned(52_676.19, gross)).toBe(31_676.19);
  });

  it("matches the user example end-to-end", () => {
    const disbursed = 4_000_000;
    const ourRate = 1.2;
    const partnerRate = 0.6;
    const expected = calculateExpectedCommission(disbursed, ourRate);
    const share = calculatePartnerShareExpected(disbursed, partnerRate);
    expect(expected).toBe(48_000);
    expect(share).toBe(24_000);
    expect(calculateTdsAmount(share)).toBe(480);
    expect(calculateNetAfterTds(share)).toBe(23_520);
    expect(calculateNetEarned(expected, share)).toBe(24_000);
  });
});

describe("legacy aliases", () => {
  it("keeps calculateCommissionPayout as expected commission", () => {
    expect(calculateCommissionPayout(100_000, 1.6)).toBe(1_600);
  });

  it("keeps resolveCommissionPercent as partner share resolver", () => {
    expect(resolveCommissionPercent(0.8, 1)).toBe(1);
    expect(resolvePartnerSharePercent(0.8, null)).toBe(0.8);
  });

  it("keeps calculatePendingCommission as pending shared", () => {
    expect(calculatePendingCommission(800, 5)).toBe(795);
  });
});

describe("allocateSettledToStudents", () => {
  it("allocates partner settlements proportionally across partner share expected", () => {
    const rows = [
      { id: "a", partnerShareExpected: 10 },
      { id: "b", partnerShareExpected: 5 },
      { id: "c", partnerShareExpected: 5 },
    ];

    const allocation = allocateSettledToStudents(rows, 12);

    expect(allocation.get("a")).toEqual({ settled: 6, pending: 4 });
    expect(allocation.get("b")).toEqual({ settled: 3, pending: 2 });
    expect(allocation.get("c")).toEqual({ settled: 3, pending: 2 });
  });
});

describe("matchesCommissionStatusFilter", () => {
  const row = {
    commissionExpected: 1_600,
    commissionReceived: 0,
    pendingReceived: 600,
    commissionShared: 0,
    pendingShared: 795,
  };

  it("filters received pending", () => {
    expect(matchesCommissionStatusFilter(row, "received_pending")).toBe(true);
    expect(matchesCommissionStatusFilter({ ...row, pendingReceived: 0 }, "received_pending")).toBe(
      false
    );
    expect(
      matchesCommissionStatusFilter(
        { ...row, commissionReceived: 500, pendingReceived: 100 },
        "received_pending"
      )
    ).toBe(false);
  });

  it("filters received partial", () => {
    expect(
      matchesCommissionStatusFilter(
        { ...row, commissionReceived: 1_000, pendingReceived: 600 },
        "received_partial"
      )
    ).toBe(true);
    expect(matchesCommissionStatusFilter(row, "received_partial")).toBe(false);
  });

  it("filters shared partial", () => {
    expect(
      matchesCommissionStatusFilter(
        { ...row, commissionShared: 3, pendingShared: 400 },
        "shared_partial"
      )
    ).toBe(true);
  });

  it("filters fully complete", () => {
    expect(
      matchesCommissionStatusFilter(
        {
          commissionExpected: 100,
          commissionReceived: 100,
          pendingReceived: 0,
          commissionShared: 50,
          pendingShared: 0,
        },
        "fully_complete"
      )
    ).toBe(true);
  });
});

describe("formatCommissionMonth", () => {
  it("formats dates as YYYY-MM", () => {
    expect(formatCommissionMonth(new Date("2026-03-15T10:00:00Z"))).toBe("2026-03");
  });
});
