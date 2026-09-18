import type { StudentStatus } from "@/lib/constants/statuses";

export const APPLICATION_STATUS_VALUES = [
  "docs_pending",
  "need_callback",
  "future_intake",
  "loggedin",
  "sanctioned",
  "pf_paid",
  "pf_pending",
  "disbursed",
  "completed",
  "not_interested",
  "rejected",
] as const;

export type ApplicationStatusId = (typeof APPLICATION_STATUS_VALUES)[number];

export const APPLICATION_STATUS_OPTIONS: Array<{ value: ApplicationStatusId; label: string }> = [
  { value: "docs_pending", label: "Docs Pending" },
  { value: "need_callback", label: "Need Call Back" },
  { value: "future_intake", label: "Future Intake" },
  { value: "loggedin", label: "Logged In" },
  { value: "sanctioned", label: "Sanctioned" },
  { value: "pf_paid", label: "PF Paid" },
  { value: "pf_pending", label: "PF Pending" },
  { value: "disbursed", label: "Disbursed" },
  { value: "completed", label: "Completed" },
  { value: "not_interested", label: "Not Interested" },
  { value: "rejected", label: "Rejected" },
];

/** Terminal / closed-style application statuses (easy to spot in lists). */
export const CLOSED_APPLICATION_STATUSES: ApplicationStatusId[] = [
  "completed",
  "not_interested",
  "rejected",
];

export function isClosedApplicationStatus(status?: string | null): status is ApplicationStatusId {
  return Boolean(status && CLOSED_APPLICATION_STATUSES.includes(status as ApplicationStatusId));
}

const STATUS_LABELS = Object.fromEntries(
  APPLICATION_STATUS_OPTIONS.map((option) => [option.value, option.label])
) as Record<ApplicationStatusId, string>;

export function getApplicationStatusLabel(status?: string | null): string {
  if (!status) return "Docs Pending";
  return STATUS_LABELS[status as ApplicationStatusId] ?? status.replace(/_/g, " ");
}

interface StudentApplicationInput {
  applicationStatus?: string | null;
  status?: string;
  loggedIn?: boolean;
  loan?: { pfPaid?: boolean; processingFee?: number };
}

export function deriveApplicationStatus(student: StudentApplicationInput): ApplicationStatusId {
  if (
    student.applicationStatus &&
    APPLICATION_STATUS_VALUES.includes(student.applicationStatus as ApplicationStatusId)
  ) {
    return student.applicationStatus as ApplicationStatusId;
  }

  if (student.status === "rejected") return "rejected";
  if (student.status === "completed") return "completed";
  if (student.status === "closed") return "not_interested";
  if (student.status === "disbursed") return "disbursed";
  if (student.status === "documents_pending") return "docs_pending";
  if (student.loan?.pfPaid) return "pf_paid";
  if ((student.loan?.processingFee ?? 0) > 0 && !student.loan?.pfPaid) return "pf_pending";
  if (student.status === "sanctioned") return "sanctioned";
  if (student.loggedIn) return "loggedin";

  return "docs_pending";
}

export function applyApplicationStatus(applicationStatus: ApplicationStatusId): {
  applicationStatus: ApplicationStatusId;
  status: StudentStatus;
  loggedIn: boolean;
  pfPaid: boolean;
} {
  switch (applicationStatus) {
    case "docs_pending":
      return { applicationStatus, status: "documents_pending", loggedIn: false, pfPaid: false };
    case "need_callback":
      return { applicationStatus, status: "contacted", loggedIn: false, pfPaid: false };
    case "future_intake":
      return { applicationStatus, status: "contacted", loggedIn: false, pfPaid: false };
    case "loggedin":
      return { applicationStatus, status: "submitted", loggedIn: true, pfPaid: false };
    case "sanctioned":
      return { applicationStatus, status: "sanctioned", loggedIn: false, pfPaid: false };
    case "pf_paid":
      return { applicationStatus, status: "sanctioned", loggedIn: true, pfPaid: true };
    case "pf_pending":
      return { applicationStatus, status: "sanctioned", loggedIn: true, pfPaid: false };
    case "disbursed":
      return { applicationStatus, status: "disbursed", loggedIn: true, pfPaid: true };
    case "completed":
      return { applicationStatus, status: "completed", loggedIn: true, pfPaid: true };
    case "not_interested":
      return { applicationStatus, status: "closed", loggedIn: false, pfPaid: false };
    case "rejected":
      return { applicationStatus, status: "rejected", loggedIn: false, pfPaid: false };
    default:
      return {
        applicationStatus: "docs_pending",
        status: "documents_pending",
        loggedIn: false,
        pfPaid: false,
      };
  }
}
