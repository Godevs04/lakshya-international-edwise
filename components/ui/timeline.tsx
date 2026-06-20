import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils/format";

interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: Date | string;
  icon?: React.ReactNode;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-0", className)}>
      {items.map((item, index) => (
        <div key={item.id} className="relative flex gap-4 pb-6 last:pb-0">
          {index < items.length - 1 && (
            <div className="absolute left-[15px] top-8 h-[calc(100%-16px)] w-px bg-border" />
          )}
          <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background">
            {item.icon ?? <div className="h-2 w-2 rounded-full bg-primary" />}
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium">{item.title}</p>
            {item.description && (
              <p className="mt-0.5 text-sm text-muted-foreground">{item.description}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              {formatDateTime(item.timestamp)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
