"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { SectionShell } from "@/components/marketing/sections/section-shell";
import { MarketingIcon } from "@/lib/constants/marketing/icons";
import {
  TRUST_METRICS,
  WHY_LAKSHYA,
  WHAT_LAKSHYA_ACCEPTS,
  WHAT_LAKSHYA_GIVES_BACK,
} from "@/lib/constants/marketing/lakshya-value-props";
import { useMarketingMotion } from "@/lib/motion/use-marketing-motion";

const EASE = [0.22, 1, 0.36, 1] as const;
const HOVER = { duration: 0.28, ease: EASE } as const;

const BRANCHES = [
  {
    key: "why",
    index: "01",
    title: "Why Lakshya",
    blurb: "The finance partner built around students.",
    items: WHY_LAKSHYA.slice(0, 4),
    accent: "blue" as const,
  },
  {
    key: "accepts",
    index: "02",
    title: "What Lakshya Accepts",
    blurb: "Profiles others turn away, we take forward.",
    items: WHAT_LAKSHYA_ACCEPTS.slice(0, 4),
    accent: "violet" as const,
  },
  {
    key: "gives",
    index: "03",
    title: "What Lakshya Gives Back",
    blurb: "Real savings and support, not just approvals.",
    items: WHAT_LAKSHYA_GIVES_BACK.slice(0, 4),
    accent: "gold" as const,
  },
];

function ConnectorPaths() {
  const { prefersReducedMotion } = useMarketingMotion();

  const paths = [
    "M 400 60 C 400 120, 140 120, 140 200",
    "M 400 60 C 400 120, 400 120, 400 200",
    "M 400 60 C 400 120, 660 120, 660 200",
  ];

  return (
    <svg
      className="why-lakshya-connectors"
      viewBox="0 0 800 240"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="why-lakshya-line" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0b8fd8" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#4fc3f7" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      {paths.map((d, i) => (
        <motion.path
          key={d}
          d={d}
          fill="none"
          stroke="url(#why-lakshya-line)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={prefersReducedMotion ? { pathLength: 1, opacity: 0.5 } : { pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.55 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.15 + i * 0.12, ease: EASE }}
        />
      ))}
    </svg>
  );
}

function HubNode() {
  const { prefersReducedMotion, floatSlow } = useMarketingMotion();

  return (
    <motion.div
      className="why-lakshya-hub"
      initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.9, y: 16 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      <span className="why-lakshya-hub-ring why-lakshya-hub-ring-1" aria-hidden />
      <span className="why-lakshya-hub-ring why-lakshya-hub-ring-2" aria-hidden />
      <motion.div
        className="why-lakshya-hub-core"
        {...(prefersReducedMotion ? {} : { animate: floatSlow.animate, transition: floatSlow.transition })}
      >
        <Sparkles className="why-lakshya-hub-icon h-5 w-5" aria-hidden />
        <span className="why-lakshya-hub-label">Lakshya</span>
        <span className="why-lakshya-hub-tag">Your finance partner</span>
      </motion.div>
    </motion.div>
  );
}

function TrustMetricPills() {
  const { prefersReducedMotion } = useMarketingMotion();

  return (
    <ul className="why-lakshya-metrics">
      {TRUST_METRICS.map((metric, i) => (
        <motion.li
          key={metric.label}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.1 + i * 0.06, ease: EASE }}
        >
          <strong>
            {metric.prefix ?? ""}
            {metric.decimals != null ? metric.value.toFixed(metric.decimals) : metric.value}
            {metric.suffix}
          </strong>
          <span>{metric.label}</span>
        </motion.li>
      ))}
    </ul>
  );
}

function BranchCard({
  branch,
  index,
}: {
  branch: (typeof BRANCHES)[number];
  index: number;
}) {
  const { prefersReducedMotion } = useMarketingMotion();

  return (
    <motion.article
      className={`why-lakshya-card why-lakshya-card-${branch.accent}`}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 32, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px", amount: 0.15 }}
      transition={{ duration: 0.62, delay: 0.12 + index * 0.1, ease: EASE }}
      whileHover={prefersReducedMotion ? undefined : { y: -8, scale: 1.02, transition: HOVER }}
    >
      <div className="why-lakshya-card-glass" aria-hidden />
      <span className="why-lakshya-card-accent-bar" aria-hidden />

      <header className="why-lakshya-card-head">
        <span className="why-lakshya-card-index">{branch.index}</span>
        <h3 className="why-lakshya-card-title">{branch.title}</h3>
        <p className="why-lakshya-card-blurb">{branch.blurb}</p>
      </header>

      <ul className="why-lakshya-card-list">
        {branch.items.map((item, i) => (
          <motion.li
            key={item.title}
            initial={prefersReducedMotion ? false : { opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 + index * 0.08 + i * 0.05, ease: EASE }}
          >
            <span className="why-lakshya-item-icon">
              <MarketingIcon name={item.icon} className="h-5 w-5" />
            </span>
            <span className="why-lakshya-item-copy">
              <span className="why-lakshya-item-title-row">
                <strong>{item.title}</strong>
                {"stat" in item && item.stat ? (
                  <span className="why-lakshya-item-stat">{item.stat}</span>
                ) : null}
              </span>
              <span className="why-lakshya-item-desc">{item.description}</span>
            </span>
          </motion.li>
        ))}
      </ul>
    </motion.article>
  );
}

export function LakshyaRootMap() {
  return (
    <SectionShell
      variant="muted"
      background="grid"
      eyebrow="Why Choose Us"
      title="One partner, three promises"
      description="From eligibility to disbursement, here is what sets Lakshya apart."
      align="center"
      className="why-lakshya-section-premium"
      containerClassName="max-w-[90rem]"
    >
      <div className="why-lakshya-bg-orbs" aria-hidden>
        <span className="why-lakshya-bg-orb why-lakshya-bg-orb-1" />
        <span className="why-lakshya-bg-orb why-lakshya-bg-orb-2" />
      </div>

      <div className="why-lakshya-premium">
        <div className="why-lakshya-hub-row">
          <HubNode />
          <TrustMetricPills />
        </div>

        <ConnectorPaths />

        <div className="why-lakshya-cards">
          {BRANCHES.map((branch, i) => (
            <BranchCard key={branch.key} branch={branch} index={i} />
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
