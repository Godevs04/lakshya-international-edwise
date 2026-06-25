import type { ReactNode } from "react";
import { GlassCard } from "@/components/cards/glass-card";
import { cn } from "@/lib/utils";

interface FormSectionProps {
  id?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  highlighted?: boolean;
}

export function FormSection({
  id,
  title,
  description,
  children,
  className,
  highlighted = false,
}: FormSectionProps) {
  return (
    <GlassCard
      id={id}
      className={cn(
        "scroll-mt-24 p-6 transition-shadow",
        highlighted && "ring-2 ring-[#E8952E]/50",
        className
      )}
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold">{title}</h3>
        {description ? (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </GlassCard>
  );
}
