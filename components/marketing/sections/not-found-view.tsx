"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Compass, Home, SearchX } from "lucide-react";
import { MarketingLottie } from "@/components/marketing/motion/marketing-lottie";
import { EligibilityCta } from "@/components/marketing/eligibility/eligibility-cta";
import { useMarketingMotion } from "@/lib/motion/use-marketing-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

interface NotFoundViewProps {
  /** When true, page is already inside marketing chrome (navbar/footer). */
  embedded?: boolean;
  /** Hide marketing eligibility CTA (e.g. dashboard 404). */
  showEligibilityCta?: boolean;
  primaryHref?: string;
  primaryLabel?: string;
}

export function NotFoundView({
  embedded = false,
  showEligibilityCta = true,
  primaryHref = "/",
  primaryLabel = "Back to home",
}: NotFoundViewProps) {
  const { prefersReducedMotion, floatSlow } = useMarketingMotion();

  return (
    <section className="not-found-page" aria-labelledby="not-found-title">
      <span className="not-found-glow" aria-hidden />
      <span className="not-found-mesh" aria-hidden />

      <motion.div
        className="not-found-card"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: EASE }}
      >
        <motion.div
          className="not-found-lottie-wrap"
          {...(prefersReducedMotion
            ? {}
            : {
                animate: floatSlow.animate,
                transition: floatSlow.transition,
              })}
        >
          <MarketingLottie
            preset="page-not-found"
            loop
            reveal={false}
            fallbackIcon={SearchX}
            className="not-found-lottie"
            stageClassName="not-found-lottie-stage"
            playerClassName="not-found-lottie-player"
          />
        </motion.div>

        <p className="not-found-eyebrow">404 · Page not found</p>
        <h1 id="not-found-title" className="not-found-title">
          Looks like this page took a detour
        </h1>
        <p className="not-found-subtitle">
          The link may be broken or the page may have moved. Let&apos;s get you back on track.
        </p>

        <div className="not-found-actions">
          <Link
            href={primaryHref}
            className="btn-marketing not-found-btn-primary rounded-full px-6 py-3 text-sm font-semibold"
          >
            <Home className="h-4 w-4" aria-hidden />
            {primaryLabel}
          </Link>
          {showEligibilityCta ? (
            <Link
              href="/lending-partners"
              className="not-found-btn-secondary rounded-full px-6 py-3 text-sm font-semibold"
            >
              <Compass className="h-4 w-4" aria-hidden />
              Explore lenders
            </Link>
          ) : (
            <Link
              href="/"
              className="not-found-btn-secondary rounded-full px-6 py-3 text-sm font-semibold"
            >
              <Compass className="h-4 w-4" aria-hidden />
              Visit website
            </Link>
          )}
        </div>

        {showEligibilityCta ? (
          <>
            <div className="not-found-links">
              <Link href="/faq">FAQ</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/services">Services</Link>
              {!embedded ? (
                <Link href="/" className="inline-flex items-center gap-1">
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                  Start over
                </Link>
              ) : null}
            </div>

            <div className="not-found-upsell">
              <div>
                <p className="not-found-upsell-title">Need a loan check instead?</p>
                <p className="not-found-upsell-text">
                  Compare offers across 20+ lenders in minutes.
                </p>
              </div>
              <EligibilityCta source="not-found-page" className="not-found-upsell-cta" />
            </div>
          </>
        ) : null}
      </motion.div>
    </section>
  );
}
