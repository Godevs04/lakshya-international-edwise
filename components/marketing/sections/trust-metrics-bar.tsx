"use client";

import { Users, Landmark, Clock, TrendingUp } from "lucide-react";
import { MarketingContainer } from "@/components/marketing/layout/marketing-container";
import { AnimatedCounter } from "@/components/marketing/motion/counter";
import { RevealStagger, RevealItem } from "@/components/marketing/motion/reveal";
import { TRUST_METRICS, TRUST_METRICS_SOURCE } from "@/lib/constants/marketing/lakshya-value-props";

const METRIC_ICONS = [Users, Landmark, Clock, TrendingUp];

export function TrustMetricsBar() {
  return (
    <section
      data-journey-node="process"
      className="section-relative border-y border-border/60 bg-white py-10"
      aria-label="Key metrics"
    >
      <MarketingContainer>
        <RevealStagger className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {TRUST_METRICS.map((metric, index) => {
            const Icon = METRIC_ICONS[index] ?? TrendingUp;
            return (
              <RevealItem key={metric.label} className="text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-3xl font-extrabold text-primary md:text-4xl">
                  {metric.prefix}
                  <AnimatedCounter
                    value={metric.value}
                    suffix={metric.suffix}
                    decimals={metric.decimals ?? 0}
                    pulseOnComplete
                  />
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{metric.label}</p>
              </RevealItem>
            );
          })}
        </RevealStagger>
        <p className="mt-6 text-center text-xs text-muted-foreground/80">{TRUST_METRICS_SOURCE}</p>
      </MarketingContainer>
    </section>
  );
}
