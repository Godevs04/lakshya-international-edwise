"use client";

import { Clock, Landmark, TrendingUp, Users } from "lucide-react";
import { AnimatedCounter } from "@/components/marketing/motion/counter";
import {
  TRUST_METRICS,
  TRUST_METRICS_SOURCE,
} from "@/lib/constants/marketing/lakshya-value-props";
import { cn } from "@/lib/utils";

const METRIC_ICONS = [Users, Landmark, Clock, TrendingUp];

interface HeroTrustMetricsProps {
  compact?: boolean;
  variant?: "default" | "navy-bar";
}

export function HeroTrustMetrics({ compact = false, variant = "default" }: HeroTrustMetricsProps) {
  const isNavyBar = variant === "navy-bar";

  return (
    <div className={cn(isNavyBar && "hero-stats-navy")} aria-label="Key metrics">
      <div
        className={cn(
          isNavyBar
            ? "grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6"
            : compact
              ? "grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5"
              : "grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6"
        )}
      >
        {TRUST_METRICS.map((metric, index) => {
          const Icon = METRIC_ICONS[index] ?? TrendingUp;
          return (
            <div key={metric.label} className="text-center">
              <div
                className={cn(
                  "mx-auto flex items-center justify-center rounded-xl",
                  isNavyBar
                    ? "hero-stats-navy-icon mb-2 h-9 w-9 md:h-10 md:w-10"
                    : compact
                      ? "mb-1.5 h-9 w-9 bg-primary/10 text-primary md:mb-2"
                      : "mb-2 h-10 w-10 bg-primary/10 text-primary md:mb-3"
                )}
              >
                <Icon className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <p
                className={cn(
                  "font-extrabold",
                  isNavyBar
                    ? "hero-stats-navy-value text-xl md:text-2xl"
                    : compact
                      ? "text-xl text-primary md:text-2xl"
                      : "text-2xl text-primary md:text-3xl"
                )}
              >
                {metric.prefix}
                <AnimatedCounter
                  value={metric.value}
                  suffix={metric.suffix}
                  decimals={metric.decimals ?? 0}
                  pulseOnComplete
                />
              </p>
              <p
                className={cn(
                  "mt-0.5",
                  isNavyBar
                    ? "hero-stats-navy-label text-[11px] md:text-xs"
                    : "text-[11px] text-muted-foreground md:text-xs"
                )}
              >
                {metric.label}
              </p>
            </div>
          );
        })}
      </div>
      {!compact && !isNavyBar && (
        <p className="mt-4 text-center text-[11px] text-muted-foreground/80 md:mt-5 md:text-xs">
          {TRUST_METRICS_SOURCE}
        </p>
      )}
    </div>
  );
}
