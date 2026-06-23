export interface StudentWorkflowFilter {
  id: string;
  label: string;
}

export const STUDENT_WORKFLOW_FILTERS: StudentWorkflowFilter[] = [
  { id: "all", label: "All" },
  { id: "docs_pending", label: "Docs Pending" },
  { id: "loggedin", label: "Logged In" },
  { id: "sanctioned", label: "Sanctioned" },
  { id: "pf_paid", label: "PF Paid" },
  { id: "pf_pending", label: "PF Pending" },
  { id: "disbursed", label: "Disbursed" },
  { id: "rejected", label: "Rejected" },
];

export type StudentWorkflowFilterId = (typeof STUDENT_WORKFLOW_FILTERS)[number]["id"];

export function buildWorkflowMongoFilter(workflow?: string): Record<string, unknown> | null {
  if (!workflow || workflow === "all") return null;

  if (workflow === "rejected") {
    return {
      $or: [{ applicationStatus: "rejected" }, { status: "rejected" }],
    };
  }

  return { applicationStatus: workflow };
}
