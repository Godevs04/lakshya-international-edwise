import type { Types } from "mongoose";

export const SUPPORT_CONVERSATION_STATUSES = [
  "waiting",
  "assigned",
  "in_progress",
  "resolved",
  "closed",
] as const;

export type SupportConversationStatus = (typeof SUPPORT_CONVERSATION_STATUSES)[number];

export const SUPPORT_MESSAGE_SENDER_TYPES = ["visitor", "agent", "bot", "system"] as const;
export type SupportMessageSenderType = (typeof SUPPORT_MESSAGE_SENDER_TYPES)[number];

export const SUPPORT_MESSAGE_TYPES = ["text", "image", "file"] as const;
export type SupportMessageType = (typeof SUPPORT_MESSAGE_TYPES)[number];

export const SUPPORT_ADMISSION_STATUSES = [
  "exploring",
  "applied",
  "got_admission",
  "visa",
] as const;
export type SupportAdmissionStatus = (typeof SUPPORT_ADMISSION_STATUSES)[number];

export const SUPPORT_COLLATERAL_PREFERENCES = [
  "with_collateral",
  "without_collateral",
  "unsure",
] as const;
export type SupportCollateralPreference = (typeof SUPPORT_COLLATERAL_PREFERENCES)[number];

export interface SupportQualification {
  country?: string;
  degree?: string;
  admissionStatus?: SupportAdmissionStatus;
  collateralPreference?: SupportCollateralPreference;
  loanRequired?: boolean;
  name?: string;
  phone?: string;
  email?: string;
}

export type SupportConversationId = Types.ObjectId | string;
