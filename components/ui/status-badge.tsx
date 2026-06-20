import { cn } from "@/lib/utils";
import {
  STUDENT_STATUS_CONFIG,
  PARTNER_STATUS_CONFIG,
  type StudentStatus,
  type PartnerStatus,
} from "@/lib/constants/statuses";

interface StatusBadgeProps {
  status: StudentStatus | PartnerStatus | string;
  type?: "student" | "partner";
  className?: string;
}

export function StatusBadge({ status, type = "student", className }: StatusBadgeProps) {
  const config =
    type === "partner"
      ? PARTNER_STATUS_CONFIG[status as PartnerStatus]
      : STUDENT_STATUS_CONFIG[status as StudentStatus];

  if (!config) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
          "bg-muted text-muted-foreground",
          className
        )}
      >
        {status.replace(/_/g, " ")}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.color,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dotColor)} />
      {config.label}
    </span>
  );
}
