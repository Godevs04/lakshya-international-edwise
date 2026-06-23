"use client";

import { Progress } from "@/components/ui/progress";
import { getDocumentChecklistProgress } from "@/lib/utils/student-profile";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentDocumentChecklistProps {
  documents: Array<{ name: string }>;
  compact?: boolean;
  className?: string;
}

export function StudentDocumentChecklist({
  documents,
  compact = false,
  className,
}: StudentDocumentChecklistProps) {
  const progress = getDocumentChecklistProgress(documents);

  if (compact) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Documents</span>
          <span className="text-muted-foreground">
            {progress.uploaded} / {progress.total}
          </span>
        </div>
        <Progress value={progress.percent} className="h-2" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Document checklist</p>
            <p className="text-xs text-muted-foreground">
              {progress.uploaded} of {progress.total} required documents uploaded
            </p>
          </div>
          <span className="text-sm font-semibold text-[#6D5EF7]">{progress.percent}%</span>
        </div>
        <Progress value={progress.percent} className="h-2.5" />
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {progress.items.map((item) => (
          <li
            key={item.id}
            className={cn(
              "flex items-start gap-2 rounded-lg border px-3 py-2 text-sm",
              item.uploaded
                ? "border-emerald-500/20 bg-emerald-500/5"
                : "border-border bg-background/50"
            )}
          >
            {item.uploaded ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            <div className="min-w-0">
              <p className="font-medium">{item.label}</p>
              {item.matchedDocumentName && (
                <p className="truncate text-xs text-muted-foreground">
                  Matched: {item.matchedDocumentName}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
