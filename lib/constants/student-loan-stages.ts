import type { StudentStatus } from "@/lib/constants/statuses";

export interface StudentLoanStage {
  id: string;
  label: string;
  statuses?: StudentStatus[];
}

export const STUDENT_LOAN_STAGES: StudentLoanStage[] = [
  { id: "all", label: "All" },
  { id: "new", label: "New", statuses: ["new", "contacted"] },
  { id: "documents", label: "Documents", statuses: ["documents_pending"] },
  {
    id: "submitted",
    label: "Submitted",
    statuses: ["submitted", "under_verification", "approved"],
  },
  { id: "sanctioned", label: "Sanctioned", statuses: ["sanctioned"] },
  { id: "disbursed", label: "Disbursed", statuses: ["disbursed"] },
];

export function getStatusesForLoanStage(stageId?: string): StudentStatus[] | undefined {
  if (!stageId || stageId === "all") return undefined;
  return STUDENT_LOAN_STAGES.find((stage) => stage.id === stageId)?.statuses;
}
