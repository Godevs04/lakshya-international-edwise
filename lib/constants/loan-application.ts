import type { ApplicationStatusId } from "@/lib/constants/application-status";

export const LOAN_APPLICATION_HISTORY_ACTIONS = [
  "added",
  "sent_to_bank",
  "status_updated",
  "rejected",
  "lender_changed",
] as const;

export type LoanApplicationHistoryAction = (typeof LOAN_APPLICATION_HISTORY_ACTIONS)[number];

export interface LoanApplicationHistoryItem {
  _id?: string;
  action: LoanApplicationHistoryAction;
  status?: string;
  note?: string;
  createdByName?: string;
  createdAt?: Date | string;
}

export interface LoanApplicationItem {
  _id: string;
  lenderId?: string;
  lenderName?: string;
  lenderSlug?: string;
  applicationStatus: ApplicationStatusId;
  applicationNumber?: string;
  sentToBank: boolean;
  sentToBankAt?: Date | string;
  sentToBankByName?: string;
  rejectedAt?: Date | string;
  rejectedByName?: string;
  rejectionNote?: string;
  isPrimary: boolean;
  history: LoanApplicationHistoryItem[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export function getLoanApplicationHistoryLabel(action: LoanApplicationHistoryAction): string {
  switch (action) {
    case "added":
      return "Application added";
    case "sent_to_bank":
      return "Sent to bank";
    case "status_updated":
      return "Status updated";
    case "rejected":
      return "Rejected by bank";
    case "lender_changed":
      return "Primary lender changed";
    default:
      return action;
  }
}
