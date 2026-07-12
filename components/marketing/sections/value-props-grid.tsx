"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { SectionShell } from "@/components/marketing/sections/section-shell";
import { MarketingIcon } from "@/lib/constants/marketing/icons";
import { EligibilityCta } from "@/components/marketing/eligibility/eligibility-cta";
import type { ValueProp } from "@/lib/constants/marketing/lakshya-value-props";
import { useMarketingMotion } from "@/lib/motion/use-marketing-motion";
import { cn } from "@/lib/utils";

interface ValuePropsGridProps {
  id?: string;
  eyebrow: string;
  title: string;
  description?: string;
  items: ValueProp[];
  variant?: "white" | "muted" | "tint" | "accent";
  ctaSource: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;
const HOVER = { duration: 0.28, ease: EASE } as const;

const THEME_BY_VARIANT = {
  white: "accepts",
  muted: "accepts",
  tint: "accepts",
  accent: "gives",
} as const;

function ValuePropCard({
  item,
  index,
  theme,
}: {
  item: ValueProp;
  index: number;
  theme: "accepts" | "gives";
}) {
  const { prefersReducedMotion } = useMarketingMotion();
  const number = String(index + 1).padStart(2, "0");

  return (
    <motion.article
      className={cn("value-props-card", `value-props-card-${theme}`)}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 28, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-30px", amount: 0.12 }}
      transition={{ duration: 0.58, delay: index * 0.07, ease: EASE }}
      whileHover={prefersReducedMotion ? undefined : { y: -8, scale: 1.02, transition: HOVER }}
    >
      <div className="value-props-card-glass" aria-hidden />
      <span className="value-props-card-num" aria-hidden>
        {number}
      </span>

      <div className="value-props-card-body">
        <motion.span
          className="value-props-card-icon"
          whileHover={prefersReducedMotion ? undefined : { rotate: -8, scale: 1.06 }}
          transition={HOVER}
        >
          <MarketingIcon name={item.icon} className="h-6 w-6" />
        </motion.span>

        <div className="value-props-card-copy">
          <h3 className="value-props-card-title">{item.title}</h3>
          <p className="value-props-card-desc">{item.description}</p>
          {item.stat ? (
            <span className="value-props-card-stat">
              <CheckCircle2 className="h-3 w-3" aria-hidden />
              {item.stat}
            </span>
          ) : null}
        </div>
      </div>

      <div className="value-props-card-shimmer" aria-hidden />
    </motion.article>
  );
}

export function ValuePropsGrid({
  id,
  eyebrow,
  title,
  description,
  items,
  variant = "white",
  ctaSource,
}: ValuePropsGridProps) {
  const theme = THEME_BY_VARIANT[variant];
  const { prefersReducedMotion } = useMarketingMotion();

  return (
    <SectionShell
      id={id}
      variant={variant === "accent" ? "muted" : variant}
      background="grid"
      eyebrow={eyebrow}
      title={title}
      description={description}
      className={cn("value-props-section-premium", `value-props-theme-${theme}`)}
      containerClassName="max-w-[90rem]"
    >
      <div className="value-props-bg-orbs" aria-hidden>
        <span className="value-props-bg-orb value-props-bg-orb-1" />
        <span className="value-props-bg-orb value-props-bg-orb-2" />
      </div>

      <motion.div
        className="value-props-proof-strip"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <span className="value-props-proof-chip">
          {theme === "accepts" ? "6 acceptance pathways" : "6 student benefits"}
        </span>
        <span className="value-props-proof-chip">
          {theme === "accepts" ? "Whole-profile review" : "Negotiated partner rates"}
        </span>
        <span className="value-props-proof-chip value-props-proof-chip-highlight">
          {theme === "accepts" ? "No dead ends" : "Real savings"}
        </span>
      </motion.div>

      <div className="value-props-grid">
        {items.map((item, index) => (
          <ValuePropCard key={item.title} item={item} index={index} theme={theme} />
        ))}
      </div>

      <motion.div
        className="value-props-cta-wrap"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
      >
        <EligibilityCta
          source={ctaSource}
          className="services-bento-btn-premium value-props-cta"
        >
          Check Eligibility
          <ArrowRight className="services-bento-btn-arrow h-4 w-4" aria-hidden />
        </EligibilityCta>
      </motion.div>
    </SectionShell>
  );
}
