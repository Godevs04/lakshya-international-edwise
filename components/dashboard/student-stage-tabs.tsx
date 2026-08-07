"use client";

import { cn } from "@/lib/utils";
import { STUDENT_WORKFLOW_FILTERS } from "@/lib/constants/student-workflow-filters";

interface StudentStageTabsProps {
  activeWorkflow: string;
  onWorkflowChange: (workflowId: string) => void;
  className?: string;
}

export function StudentStageTabs({
  activeWorkflow,
  onWorkflowChange,
  className,
}: StudentStageTabsProps) {
  const currentWorkflow = activeWorkflow || "all";

  return (
    <div
      className={cn(
        "flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className
      )}
    >
      {STUDENT_WORKFLOW_FILTERS.map((workflow) => {
        const isActive = currentWorkflow === workflow.id;
        return (
          <button
            key={workflow.id}
            type="button"
            onClick={() => onWorkflowChange(workflow.id)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "border-[#0B8FD8] bg-[#0B8FD8] text-white shadow-sm"
                : "border-[#0B8FD8]/15 bg-white/60 text-muted-foreground hover:border-[#0B8FD8]/30 hover:bg-[#0B8FD8]/8 hover:text-foreground dark:bg-white/5"
            )}
          >
            {workflow.label}
          </button>
        );
      })}
    </div>
  );
}
