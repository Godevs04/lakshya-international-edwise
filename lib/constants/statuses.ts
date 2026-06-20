export const STUDENT_STATUSES = [
  "new",
  "contacted",
  "documents_pending",
  "submitted",
  "under_verification",
  "approved",
  "sanctioned",
  "disbursed",
  "rejected",
  "closed",
] as const;

export type StudentStatus = (typeof STUDENT_STATUSES)[number];

export const PARTNER_STATUSES = ["active", "inactive", "pending", "suspended"] as const;
export type PartnerStatus = (typeof PARTNER_STATUSES)[number];

export const APPLICATION_STATUSES = [
  "new",
  "contacted",
  "documents_pending",
  "submitted",
  "under_verification",
  "approved",
  "sanctioned",
  "disbursed",
  "rejected",
  "closed",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const USER_STATUSES = ["active", "inactive", "suspended"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export interface StatusConfig {
  label: string;
  color: string;
  dotColor: string;
}

export const STUDENT_STATUS_CONFIG: Record<StudentStatus, StatusConfig> = {
  new: {
    label: "New",
    color: "bg-[#6D5EF7]/12 text-[#6D5EF7] border-[#6D5EF7]/25",
    dotColor: "bg-[#6D5EF7]",
  },
  contacted: {
    label: "Contacted",
    color: "bg-[#3B82F6]/12 text-[#3B82F6] border-[#3B82F6]/25",
    dotColor: "bg-[#3B82F6]",
  },
  documents_pending: {
    label: "Documents Pending",
    color: "bg-[#F59E0B]/12 text-[#F59E0B] border-[#F59E0B]/25",
    dotColor: "bg-[#F59E0B]",
  },
  submitted: {
    label: "Submitted",
    color: "bg-[#8B5CF6]/12 text-[#8B5CF6] border-[#8B5CF6]/25",
    dotColor: "bg-[#8B5CF6]",
  },
  under_verification: {
    label: "Under Verification",
    color: "bg-[#EC4899]/12 text-[#EC4899] border-[#EC4899]/25",
    dotColor: "bg-[#EC4899]",
  },
  approved: {
    label: "Approved",
    color: "bg-[#22C55E]/12 text-[#22C55E] border-[#22C55E]/25",
    dotColor: "bg-[#22C55E]",
  },
  sanctioned: {
    label: "Sanctioned",
    color: "bg-emerald-500/12 text-emerald-600 border-emerald-500/25 dark:text-emerald-400",
    dotColor: "bg-emerald-500",
  },
  disbursed: {
    label: "Disbursed",
    color: "bg-[#06B6D4]/12 text-[#06B6D4] border-[#06B6D4]/25",
    dotColor: "bg-[#06B6D4]",
  },
  rejected: {
    label: "Rejected",
    color: "bg-[#EF4444]/12 text-[#EF4444] border-[#EF4444]/25",
    dotColor: "bg-[#EF4444]",
  },
  closed: {
    label: "Closed",
    color: "bg-slate-400/12 text-slate-500 border-slate-400/25 dark:text-slate-400",
    dotColor: "bg-slate-400",
  },
};

export const PARTNER_STATUS_CONFIG: Record<PartnerStatus, StatusConfig> = {
  active: {
    label: "Active",
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    dotColor: "bg-emerald-500",
  },
  inactive: {
    label: "Inactive",
    color: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
    dotColor: "bg-gray-500",
  },
  pending: {
    label: "Pending",
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    dotColor: "bg-amber-500",
  },
  suspended: {
    label: "Suspended",
    color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    dotColor: "bg-red-500",
  },
};

export const PENDING_STATUSES: StudentStatus[] = [
  "new",
  "contacted",
  "documents_pending",
  "submitted",
  "under_verification",
  "approved",
];
