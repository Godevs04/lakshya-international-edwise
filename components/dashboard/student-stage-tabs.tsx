"use client";

import { cn } from "@/lib/utils";
import { STUDENT_LOAN_STAGES } from "@/lib/constants/student-loan-stages";

interface StudentStageTabsProps {
  activeStage: string;
  onStageChange: (stageId: string) => void;
  className?: string;
}

export function StudentStageTabs({
  activeStage,
  onStageChange,
  className,
}: StudentStageTabsProps) {
  const currentStage = activeStage || "all";

  return (
    <div
      className={cn(
        "flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className
      )}
    >
      {STUDENT_LOAN_STAGES.map((stage) => {
        const isActive = currentStage === stage.id;
        return (
          <button
            key={stage.id}
            type="button"
            onClick={() => onStageChange(stage.id)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "border-[#6D5EF7] bg-[#6D5EF7] text-white shadow-sm"
                : "border-[#6D5EF7]/15 bg-white/60 text-muted-foreground hover:border-[#6D5EF7]/30 hover:bg-[#6D5EF7]/8 hover:text-foreground dark:bg-white/5"
            )}
          >
            {stage.label}
          </button>
        );
      })}
    </div>
  );
}
