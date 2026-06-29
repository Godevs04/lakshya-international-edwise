import { cn } from "@/lib/utils";

interface NavBadgeProps {
  count: number;
  className?: string;
  collapsed?: boolean;
}

export function NavBadge({ count, className, collapsed = false }: NavBadgeProps) {
  if (count <= 0) return null;

  const label = count > 9 ? "9+" : String(count);

  return (
    <span
      className={cn(
        "absolute flex items-center justify-center rounded-full bg-[#EF4444] font-bold text-white shadow-sm ring-2 ring-white",
        collapsed
          ? "right-0 top-0 h-4 min-w-4 px-1 text-[9px]"
          : "right-0 top-0 h-4 min-w-4 px-1 text-[10px]",
        className
      )}
      aria-label={`${count} overdue task${count === 1 ? "" : "s"}`}
    >
      {label}
    </span>
  );
}
