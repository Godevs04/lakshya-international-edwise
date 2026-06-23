export const PARTNER_ACTION_STATUSES = ["active", "need_action", "call_back"] as const;

export type PartnerActionStatus = (typeof PARTNER_ACTION_STATUSES)[number];

export const PARTNER_ACTION_STATUS_LABELS: Record<PartnerActionStatus, string> = {
  active: "Active",
  need_action: "Need Action",
  call_back: "Call Back",
};
