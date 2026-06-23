import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileCompleteBadgeProps {
  verified: boolean;
  className?: string;
  showLabel?: boolean;
}

export function ProfileCompleteBadge({
  verified,
  className,
  showLabel = false,
}: ProfileCompleteBadgeProps) {
  if (!verified) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[#3B82F6]",
        className
      )}
      title="Profile verified"
    >
      <BadgeCheck className="h-4 w-4 shrink-0" aria-hidden />
      {showLabel && <span className="text-xs font-medium">Verified</span>}
      <span className="sr-only">Profile verified</span>
    </span>
  );
}
