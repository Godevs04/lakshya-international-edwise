"use client";

import { motion } from "framer-motion";
import { SectionShell } from "@/components/marketing/sections/section-shell";
import { MarketingIcon } from "@/lib/constants/marketing/icons";
import { RevealItem } from "@/components/marketing/motion/reveal";
import { useMarketingMotion } from "@/lib/motion/use-marketing-motion";
import { HOW_IT_WORKS_STEPS } from "@/lib/constants/marketing/lakshya-value-props";
import { Plane } from "lucide-react";

export function FinanceProcessHorizontal() {
  const { scaleIn, prefersReducedMotion } = useMarketingMotion();

  return (
    <SectionShell
      variant="accent"
      background="routes"
      eyebrow="Your Dream, Our Lakshya"
      title="How it works — from eligibility to takeoff"
      description="A clear, fast path with milestones you can actually count on."
    >
      <div className="relative">
        <motion.div
          className="absolute left-5 top-0 h-full w-px origin-top bg-primary md:hidden"
          initial={prefersReducedMotion ? false : { scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true, margin: "-40px", amount: 0.1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden
        />
        <motion.div
          className="absolute left-0 top-8 hidden h-0.5 w-full origin-left bg-primary md:block"
          initial={prefersReducedMotion ? false : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "-80px", amount: 0.1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden
        />
        <div
          className="absolute left-5 top-0 h-full w-px bg-primary/15 md:left-0 md:right-0 md:top-8 md:h-px md:w-auto"
          aria-hidden
        />

        <ol className="relative grid gap-8 md:grid-cols-5 md:gap-6">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <RevealItem key={step.title} className="list-none">
              <motion.div
                className="relative flex flex-col items-center text-center"
                initial={scaleIn.initial}
                whileInView={scaleIn.whileInView}
                viewport={scaleIn.viewport}
                transition={{ ...scaleIn.transition, delay: index * 0.1 }}
              >
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-white text-primary shadow-sm">
                  <MarketingIcon name={step.icon} className="h-7 w-7" />
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                    {index + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">{step.title}</h3>
                <p className="mt-1 text-sm font-medium text-primary">{step.description}</p>
              </motion.div>
            </RevealItem>
          ))}
        </ol>

        {!prefersReducedMotion && (
          <motion.div
            className="absolute bottom-0 right-4 text-primary md:-bottom-2 md:right-0"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <Plane className="h-6 w-6 rotate-[-15deg]" />
          </motion.div>
        )}
      </div>
    </SectionShell>
  );
}
