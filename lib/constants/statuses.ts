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
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    dotColor: "bg-blue-500",
  },
  contacted: {
    label: "Contacted",
    color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
    dotColor: "bg-cyan-500",
  },
  documents_pending: {
    label: "Documents Pending",
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    dotColor: "bg-amber-500",
  },
  submitted: {
    label: "Submitted",
    color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    dotColor: "bg-indigo-500",
  },
  under_verification: {
    label: "Under Verification",
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    dotColor: "bg-purple-500",
  },
  approved: {
    label: "Approved",
    color: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
    dotColor: "bg-teal-500",
  },
  sanctioned: {
    label: "Sanctioned",
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    dotColor: "bg-emerald-500",
  },
  disbursed: {
    label: "Disbursed",
    color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    dotColor: "bg-green-500",
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    dotColor: "bg-red-500",
  },
  closed: {
    label: "Closed",
    color: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
    dotColor: "bg-gray-500",
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
