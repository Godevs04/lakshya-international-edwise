"use client";

import { useEligibilityModal } from "@/hooks/use-eligibility-modal";
import { cn } from "@/lib/utils";

interface EligibilityCtaProps {
  children?: React.ReactNode;
  className?: string;
  preferredLender?: string;
  targetCountry?: string;
  source?: string;
  variant?: "primary" | "outline" | "ghost";
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  "aria-label"?: string;
}

export function EligibilityCta({
  children = "Check Eligibility",
  className,
  preferredLender,
  targetCountry,
  source,
  variant = "primary",
  onClick,
  ...rest
}: EligibilityCtaProps) {
  const { open } = useEligibilityModal();

  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-full font-semibold transition-colors";
  const variants: Record<string, string> = {
    primary: "btn-marketing hover:bg-transparent",
    outline:
      "border border-primary/30 bg-white text-primary hover:border-primary/50 hover:bg-accent/40",
    ghost: "text-primary hover:bg-accent/40",
  };

  return (
    <button
      type="button"
      onClick={(event) => {
        onClick?.(event);
        open({ preferredLender, targetCountry, source });
      }}
      className={cn(base, variants[variant], className)}
      {...rest}
    >
      {children}
    </button>
  );
}
