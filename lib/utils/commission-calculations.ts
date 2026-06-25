import { roundMoney } from "@/lib/utils/format";

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
