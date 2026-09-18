import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  COMPLETED_STATUS_BADGE_CLASS,
  getClosedStudentProfileTone,
} from "@/lib/utils/closed-student-profile";
import type { StudentStatus } from "@/lib/constants/statuses";

interface StudentLifecycleBadgeProps {
  status: StudentStatus | string;
  size?: "sm" | "md";
  className?: string;
}

/** Status pill with a clearer Completed treatment (check + teal wash). */
export function StudentLifecycleBadge({
  status,
  size = "sm",
  className,
}: StudentLifecycleBadgeProps) {
  const tone = getClosedStudentProfileTone(status);

  if (tone === "completed") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur-sm",
          COMPLETED_STATUS_BADGE_CLASS,
          size === "md" && "px-3.5 py-1.5 text-sm",
          className
        )}
      >
        <CheckCircle2
          className={cn("h-3.5 w-3.5 shrink-0 text-[#0D9488]", size === "md" && "h-4 w-4")}
          aria-hidden
        />
        Completed
      </span>
    );
  }

  return <StatusBadge status={status} size={size} className={className} />;
}
