"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import type { MarketingService } from "@/types/marketing";
import { MarketingIcon } from "@/lib/constants/marketing/icons";
import { EligibilityCta } from "@/components/marketing/eligibility/eligibility-cta";
import { MARKETING_SERVICES } from "@/lib/constants/marketing/services";
import { useMarketingMotion } from "@/lib/motion/use-marketing-motion";
import { ServicesFeaturedPanel } from "@/components/marketing/homepage/services-featured-panel";
import { ServiceCardAccent } from "@/components/marketing/homepage/service-card-accent";
import { ServiceCardPreview } from "@/components/marketing/homepage/service-card-preview";
import { MarketingLottie } from "@/components/marketing/motion/marketing-lottie";

const EASE = [0.22, 1, 0.36, 1] as const;
const HOVER_TRANSITION = { duration: 0.28, ease: EASE } as const;

const BENTO_SLOTS: { slug: string; slot: string }[] = [
  { slug: "education-loan", slot: "featured" },
  { slug: "accommodation", slot: "side-a" },
  { slug: "blocked-account-gic", slot: "side-b" },
  { slug: "forex-transfers", slot: "base-a" },
  { slug: "test-preparation", slot: "base-b" },
  { slug: "credit-cards", slot: "base-c" },
];

function getService(slug: string): MarketingService {
  return MARKETING_SERVICES.find((s) => s.slug === slug)!;
}

function slotClass(slug: string) {
  return `services-bento-${BENTO_SLOTS.find((s) => s.slug === slug)?.slot ?? "base-a"}`;
}

function useReveal(index: number) {
  const { prefersReducedMotion } = useMarketingMotion();
  return {
    initial: prefersReducedMotion
      ? false
      : { opacity: 0, y: 28, scale: 0.98, filter: "blur(6px)" },
    whileInView: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
    viewport: { once: true, margin: "-40px", amount: 0.12 } as const,
    transition: { duration: 0.68, delay: index * 0.07, ease: EASE },
    hover: prefersReducedMotion
      ? undefined
      : { y: -8, scale: 1.02, transition: HOVER_TRANSITION },
  };
}

function FeaturedServiceCard({ service, index }: { service: MarketingService; index: number }) {
  const motionProps = useReveal(index);
  const { prefersReducedMotion } = useMarketingMotion();

  return (
    <motion.article
      className={`services-bento-tile services-bento-tile-featured ${slotClass(service.slug)}`}
      initial={motionProps.initial}
      whileInView={motionProps.whileInView}
      viewport={motionProps.viewport}
      transition={motionProps.transition}
      whileHover={motionProps.hover}
    >
      <div className="services-bento-featured-inner">
        <div className="services-bento-featured-glass" aria-hidden />
        <span className="services-bento-featured-glow" aria-hidden />
        <span className="services-bento-featured-orb services-bento-featured-orb-1" aria-hidden />
        <span className="services-bento-featured-orb services-bento-featured-orb-2" aria-hidden />

        <div className="services-bento-featured-layout">
          <div className="services-bento-featured-copy">
            <div className="services-bento-featured-head">
              <span className="services-bento-featured-badge">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                Flagship service
              </span>
              <motion.div
                className="services-bento-icon-glass services-bento-icon-glass-featured"
                whileHover={prefersReducedMotion ? undefined : { rotate: 8, scale: 1.05 }}
                transition={HOVER_TRANSITION}
              >
                <MarketingIcon name={service.icon} className="h-12 w-12" />
              </motion.div>
            </div>

            <motion.h3
              className="services-bento-featured-title"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
            >
              {service.title}
            </motion.h3>
            <motion.p
              className="services-bento-featured-desc"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.16, ease: EASE }}
            >
              {service.description}
            </motion.p>

            {service.highlights && (
              <ul className="services-bento-featured-highlights">
                {service.highlights.map((item, i) => (
                  <motion.li
                    key={item}
                    initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.92 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.2 + i * 0.06, ease: EASE }}
                  >
                    {item}
                  </motion.li>
                ))}
              </ul>
            )}

            <motion.div
              className="services-bento-analysis-visual"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 12, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.34, ease: EASE }}
            >
              <span className="services-bento-analysis-glow" aria-hidden />
              <MarketingLottie
                preset="business-analysis"
                loop
                reveal={false}
                className="services-bento-analysis-lottie"
                stageClassName="services-bento-analysis-stage"
                playerClassName="services-bento-analysis-player"
              />
              <div className="services-bento-analysis-label" aria-hidden>
                <span className="services-bento-analysis-dot" />
                Smart loan analysis
              </div>
            </motion.div>

            <div className="services-bento-featured-actions">
              <EligibilityCta
                source={`service-card-${service.slug}`}
                className="services-bento-btn-premium services-bento-featured-cta"
              >
                Check Eligibility
                <ArrowRight className="services-bento-btn-arrow h-4 w-4" aria-hidden />
              </EligibilityCta>
              <Link href={`/services/${service.slug}`} className="services-bento-featured-link">
                Explore loan options
                <ArrowUpRight className="services-bento-link-arrow h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>

          <ServicesFeaturedPanel />
        </div>
      </div>
    </motion.article>
  );
}

function CompactServiceCard({
  service,
  index,
  number,
}: {
  service: MarketingService;
  index: number;
  number: string;
}) {
  const motionProps = useReveal(index);
  const { prefersReducedMotion } = useMarketingMotion();
  const slot = BENTO_SLOTS.find((s) => s.slug === service.slug)?.slot ?? "base-a";
  const isSide = slot === "side-a" || slot === "side-b";

  return (
    <motion.article
      className={`services-bento-tile services-bento-tile-compact services-bento-variant-${service.slug} ${slotClass(service.slug)}${isSide ? " services-bento-tile-side" : ""}`}
      initial={motionProps.initial}
      whileInView={motionProps.whileInView}
      viewport={motionProps.viewport}
      transition={motionProps.transition}
      whileHover={motionProps.hover}
    >
      <div className="services-bento-compact-inner group">
        <div className="services-bento-compact-mesh" aria-hidden />
        <span className="services-bento-compact-num" aria-hidden>
          {number}
        </span>

        <ServiceCardAccent slug={service.slug} />

        <div className="services-bento-compact-header">
          <motion.div
            className="services-bento-icon-glass"
            whileHover={prefersReducedMotion ? undefined : { rotate: -8, scale: 1.06 }}
            transition={HOVER_TRANSITION}
          >
            <MarketingIcon name={service.icon} className="h-12 w-12" />
          </motion.div>

          <div className="services-bento-compact-copy">
            <Link href={`/services/${service.slug}`} className="services-bento-compact-title-link">
              <h3 className="services-bento-compact-title">{service.title}</h3>
            </Link>
            <p className="services-bento-compact-desc">{service.shortDescription}</p>
          </div>

          <Link
            href={`/services/${service.slug}`}
            className="services-bento-compact-arrow"
            aria-label={`View ${service.title} details`}
          >
            <ArrowUpRight className="services-bento-link-arrow h-5 w-5" />
          </Link>
        </div>

        {service.highlights && service.highlights.length > 0 && (
          <ul className="services-bento-compact-highlights">
            {service.highlights.slice(0, isSide ? 3 : 2).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}

        <ServiceCardPreview slug={service.slug} />

        <div className="services-bento-compact-cta">
          <EligibilityCta
            source={`service-card-${service.slug}`}
            className="services-bento-btn-premium services-bento-compact-btn"
          >
            Check Eligibility
            <ArrowRight className="services-bento-btn-arrow h-3.5 w-3.5" aria-hidden />
          </EligibilityCta>
        </div>
      </div>
    </motion.article>
  );
}

export function ServicesBentoGrid() {
  const featured = getService("education-loan");
  const compactSlugs = BENTO_SLOTS.filter((s) => s.slug !== "education-loan").map((s) => s.slug);

  return (
    <div className="services-bento-grid">
      <FeaturedServiceCard service={featured} index={0} />
      {compactSlugs.map((slug, i) => (
        <CompactServiceCard
          key={slug}
          service={getService(slug)}
          index={i + 1}
          number={String(i + 2).padStart(2, "0")}
        />
      ))}
    </div>
  );
}
