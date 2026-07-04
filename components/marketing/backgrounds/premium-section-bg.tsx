import { cn } from "@/lib/utils";

export type PremiumBackgroundVariant = "none" | "grid" | "map" | "routes" | "radial";

const bgClasses: Record<PremiumBackgroundVariant, string> = {
  none: "",
  grid: "bg-finance-grid",
  map: "bg-world-texture",
  routes: "bg-route-lines",
  radial: "bg-radial-soft",
};

interface PremiumSectionBgProps {
  variant?: PremiumBackgroundVariant;
  className?: string;
}

export function PremiumSectionBg({ variant = "none", className }: PremiumSectionBgProps) {
  if (variant === "none") return null;

  return (
    <div
      className={cn("section-bg-layer", bgClasses[variant], className)}
      aria-hidden
    />
  );
}
