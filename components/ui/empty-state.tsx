import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden rounded-[20px] border border-dashed border-[#6D5EF7]/20 bg-gradient-to-br from-[#6D5EF7]/5 to-[#06B6D4]/5 px-6 py-14 text-center",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(109,94,247,0.08),transparent_60%)]" />
      <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[#6D5EF7] to-[#8B5CF6] shadow-lg shadow-[#6D5EF7]/30">
        {icon ?? <Sparkles className="h-7 w-7 text-white" />}
      </div>
      <h3 className="relative text-lg font-bold text-foreground">{title}</h3>
      {description && (
        <p className="relative mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="relative mt-6">{action}</div>}
    </div>
  );
}
