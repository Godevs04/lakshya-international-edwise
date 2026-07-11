"use client";

import { motion } from "framer-motion";
import { MARKETING_STATS } from "@/lib/constants/marketing/stats";
import { MarketingIcon } from "@/lib/constants/marketing/icons";
import { AnimatedCounter } from "@/components/marketing/motion/counter";
import { useMarketingMotion } from "@/lib/motion/use-marketing-motion";
import { MarketingContainer } from "@/components/marketing/layout/marketing-container";

export function StatsBar() {
  const motionProps = useMarketingMotion();

  return (
    <section className="section-muted border-y border-border py-12 md:py-14">
      <MarketingContainer>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-5 md:gap-8">
          {MARKETING_STATS.map((stat) => (
              <motion.div
                key={stat.label}
                {...motionProps.fadeInUp}
                className="text-center"
              >
                {stat.icon && (
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <MarketingIcon name={stat.icon} className="h-5 w-5" />
                  </div>
                )}
                <p className="text-2xl font-bold text-primary md:text-3xl">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} variant="scramble" />
                </p>
                <p className="mt-1 text-sm font-medium text-secondary">{stat.label}</p>
                {stat.description && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{stat.description}</p>
                )}
              </motion.div>
          ))}
        </div>
      </MarketingContainer>
    </section>
  );
}
