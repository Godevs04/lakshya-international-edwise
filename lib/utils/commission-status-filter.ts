import type { CommissionStatusFilter } from "@/lib/constants/commission-status";

export interface CommissionFilterRow {
  commissionExpected: number;
  commissionReceived: number;
  pendingReceived: number;
  commissionShared: number;
  pendingShared: number;
}

export function matchesCommissionStatusFilter(
  row: CommissionFilterRow,
  filter: CommissionStatusFilter
): boolean {
  switch (filter) {
    case "all":
      return true;
    case "received_pending":
      return row.pendingReceived > 0 && row.commissionReceived <= 0;
    case "received_partial":
      return row.commissionReceived > 0 && row.pendingReceived > 0;
    case "received_complete":
      return row.commissionExpected > 0 && row.pendingReceived <= 0;
    case "shared_pending":
      return row.pendingShared > 0 && row.commissionShared <= 0;
    case "shared_partial":
      return row.commissionShared > 0 && row.pendingShared > 0;
    case "shared_complete":
      return row.commissionExpected > 0 && row.pendingShared <= 0;
    case "fully_complete":
      return (
        row.commissionExpected > 0 &&
        row.pendingReceived <= 0 &&
        row.pendingShared <= 0
      );
    default:
      return true;
  }
}

export function filterCommissionRows<T extends CommissionFilterRow>(
  rows: T[],
  filter?: CommissionStatusFilter
): T[] {
  if (!filter || filter === "all") return rows;
  return rows.filter((row) => matchesCommissionStatusFilter(row, filter));
}
