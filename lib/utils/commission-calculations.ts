import { roundMoney } from "@/lib/utils/format";

/** Section 194H-style TDS withheld from partner share payouts. */
export const PARTNER_TDS_PERCENT = 2;

export function resolvePartnerSharePercent(
  partnerPercent: number,
  studentOverride?: number | null
): number {
  if (studentOverride != null && !Number.isNaN(studentOverride)) {
    return studentOverride;
  }
  return partnerPercent;
}

export function calculateExpectedCommission(
  totalDisbursed: number,
  ourCommissionPercent: number
): number {
  if (totalDisbursed <= 0 || ourCommissionPercent <= 0) {
    return 0;
  }
  return roundMoney((totalDisbursed * ourCommissionPercent) / 100);
}

export function calculatePartnerShareExpected(
  totalDisbursed: number,
  partnerSharePercent: number
): number {
  if (totalDisbursed <= 0 || partnerSharePercent <= 0) {
    return 0;
  }
  return roundMoney((totalDisbursed * partnerSharePercent) / 100);
}

export function calculatePendingReceived(expected: number, received: number): number {
  return roundMoney(Math.max(0, expected - Math.max(0, received)));
}

export function calculatePendingShared(shareExpected: number, shared: number): number {
  return roundMoney(Math.max(0, shareExpected - Math.max(0, shared)));
}

export function calculateNetEarned(received: number, shared: number): number {
  return roundMoney(Math.max(0, received) - Math.max(0, shared));
}

export function calculateProjectedNetEarned(
  expectedCommission: number,
  partnerShareExpected: number
): number {
  return calculateNetEarned(expectedCommission, partnerShareExpected);
}

export function calculateTdsAmount(
  grossAmount: number,
  tdsPercent: number = PARTNER_TDS_PERCENT
): number {
  if (grossAmount <= 0 || tdsPercent <= 0) {
    return 0;
  }
  return roundMoney((grossAmount * tdsPercent) / 100);
}

export function calculateNetAfterTds(
  grossAmount: number,
  tdsPercent: number = PARTNER_TDS_PERCENT
): number {
  return roundMoney(Math.max(0, grossAmount) - calculateTdsAmount(grossAmount, tdsPercent));
}

/** Agreed cash to the partner. Blank override keeps the calculated net. Never above calculated. */
export function resolveAgreedNetPayable(calculatedNet: number, override?: number | null): number {
  const calculated = roundMoney(Math.max(0, calculatedNet));
  if (override == null || Number.isNaN(Number(override))) return calculated;
  return roundMoney(Math.min(calculated, Math.max(0, override)));
}

export function calculateRetainedFromNet(calculatedNet: number, agreedNet: number): number {
  return roundMoney(Math.max(0, calculatedNet - agreedNet));
}

/**
 * Gross settlement that transfers exactly `agreedNet` after TDS.
 * Used only when the agreed net is below the calculated net.
 */
export function grossSettlementForAgreedNet(
  agreedNet: number,
  tdsPercent: number = PARTNER_TDS_PERCENT
): number {
  const target = roundMoney(Math.max(0, agreedNet));
  if (target <= 0 || tdsPercent >= 100) return 0;

  const ratio = 1 - tdsPercent / 100;
  let gross = roundMoney(target / ratio);
  for (let step = 0; step < 4; step += 1) {
    const net = calculateNetAfterTds(gross, tdsPercent);
    if (net === target) return gross;
    gross = roundMoney(gross + (target - net) / ratio);
  }
  return gross;
}

/** Gross still owed to clear the partner. Unchanged when there is no agreed-net override. */
export function settlementObligationGross(
  partnerShareExpected: number,
  calculatedNet: number,
  agreedNet: number
): number {
  const share = roundMoney(Math.max(0, partnerShareExpected));
  if (agreedNet >= calculatedNet) return share;
  return grossSettlementForAgreedNet(agreedNet);
}
