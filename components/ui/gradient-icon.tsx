import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface GradientIconProps {
  icon: LucideIcon;
  gradient?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: { box: "h-8 w-8", icon: "h-4 w-4" },
  md: { box: "h-10 w-10", icon: "h-5 w-5" },
  lg: { box: "h-12 w-12", icon: "h-6 w-6" },
};

export function GradientIcon({
  icon: Icon,
  gradient = "from-[#E8952E] to-[#F59E0B]",
  size = "md",
  className,
}: GradientIconProps) {
  const s = sizes[size];
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg",
        gradient,
        s.box,
        className
      )}
    >
      <Icon className={cn(s.icon, "text-white")} />
    </div>
  );
}
