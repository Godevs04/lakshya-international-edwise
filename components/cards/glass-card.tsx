"use client";

import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  padding?: boolean;
  animate?: boolean;
}

export function GlassCard({
  children,
  className,
  hover = false,
  glow = false,
  padding = false,
  animate = false,
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-card relative overflow-hidden rounded-[20px]",
        animate && "animate-fade-in-up",
        hover && "cursor-pointer transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#6D5EF7]/10",
        glow && "ring-1 ring-[#6D5EF7]/20",
        padding && "p-6",
        className
      )}
    >
      {children}
    </div>
  );
}
