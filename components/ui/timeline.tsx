import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils/format";
import { Activity, FileText, UserPlus, CheckCircle, Clock } from "lucide-react";

interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: Date | string;
  icon?: React.ReactNode;
  color?: string;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

const DOT_COLORS = [
  "from-[#E8952E] to-[#F59E0B]",
  "from-[#3B82F6] to-[#06B6D4]",
  "from-[#22C55E] to-[#10B981]",
  "from-[#F59E0B] to-[#EF4444]",
  "from-[#EC4899] to-[#F59E0B]",
];

const DEFAULT_ICONS = [Activity, UserPlus, FileText, CheckCircle, Clock];

export function Timeline({ items, className }: TimelineProps) {
  if (items.length === 0) return null;

  return (
    <div className={cn("space-y-0", className)}>
      {items.map((item, index) => {
        const gradient = item.color ?? DOT_COLORS[index % DOT_COLORS.length];
        const DefaultIcon = DEFAULT_ICONS[index % DEFAULT_ICONS.length];

        return (
          <div key={item.id} className="relative flex gap-4 pb-6 last:pb-0">
            {index < items.length - 1 && (
              <div className="absolute left-[19px] top-10 h-[calc(100%-20px)] w-px bg-gradient-to-b from-[#E8952E]/30 to-transparent" />
            )}
            <div
              className={cn(
                "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br shadow-md",
                gradient
              )}
            >
              {item.icon ?? <DefaultIcon className="h-4 w-4 text-white" />}
            </div>
            <div className="min-w-0 flex-1 rounded-2xl bg-[#E8952E]/4 p-3 transition-colors hover:bg-[#E8952E]/8">
              <p className="text-sm font-semibold text-foreground">{item.title}</p>
              {item.description && (
                <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
              )}
              <p className="mt-1.5 text-[11px] font-medium text-[#E8952E]/70">
                {formatDateTime(item.timestamp)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
