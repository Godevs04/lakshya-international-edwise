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
  size?: "sm" | "md";
}

export function StatusBadge({ status, type = "student", className, size = "sm" }: StatusBadgeProps) {
  const config =
    type === "partner"
      ? PARTNER_STATUS_CONFIG[status as PartnerStatus]
      : STUDENT_STATUS_CONFIG[status as StudentStatus];

  if (!config) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold capitalize shadow-sm",
          "bg-muted/80 text-muted-foreground border-border/50",
          size === "md" && "px-3.5 py-1.5 text-sm",
          className
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
        {status.replace(/_/g, " ")}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur-sm",
        config.color,
        size === "md" && "px-3.5 py-1.5 text-sm",
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full shadow-sm", config.dotColor)} />
      {config.label}
    </span>
  );
}
