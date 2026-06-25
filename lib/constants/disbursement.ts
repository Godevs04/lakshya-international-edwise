export const DISBURSEMENT_TYPES = ["full", "tranche"] as const;

export type DisbursementType = (typeof DISBURSEMENT_TYPES)[number];

export const DISBURSEMENT_TYPE_OPTIONS: Array<{ value: DisbursementType; label: string }> = [
  { value: "full", label: "Full" },
  { value: "tranche", label: "Tranche" },
];

export function getDisbursementTypeLabel(type?: string | null): string {
  if (type === "full") return "Full";
  if (type === "tranche") return "Tranche";
  return "—";
}

export function normalizeDisbursementType(value?: string): DisbursementType | undefined {
  const trimmed = value?.trim().toLowerCase();
  if (!trimmed) return undefined;
  if (trimmed === "full") return "full";
  if (trimmed === "tranche") return "tranche";
  return undefined;
}
