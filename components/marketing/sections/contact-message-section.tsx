"use client";

import { motion } from "framer-motion";
import { Clock, MessageCircle, ShieldCheck, Users } from "lucide-react";
import { ContactForm } from "@/components/marketing/forms/contact-form";
import { EligibilityCta } from "@/components/marketing/eligibility/eligibility-cta";
import { MarketingLottie } from "@/components/marketing/motion/marketing-lottie";
import { useMarketingMotion } from "@/lib/motion/use-marketing-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

const TRUST_ITEMS = [
  { icon: Clock, label: "Reply within 1 business day" },
  { icon: ShieldCheck, label: "Free, no-obligation guidance" },
  { icon: Users, label: "Trusted by 20,000+ students" },
] as const;

export function ContactMessageSection() {
  const { prefersReducedMotion } = useMarketingMotion();

  return (
    <div className="contact-message-panel">
      <span className="contact-message-glow" aria-hidden />
      <span className="contact-message-mesh" aria-hidden />

      <motion.div
        className="contact-message-hero"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, ease: EASE }}
      >
        <div className="contact-message-lottie-wrap">
          <MarketingLottie
            preset="live-chatbot"
            loop
            reveal={false}
            fallbackIcon={MessageCircle}
            className="contact-message-lottie"
            stageClassName="contact-message-lottie-stage"
            playerClassName="contact-message-lottie-player"
          />
        </div>

        <div className="contact-message-hero-copy">
          <span className="contact-message-badge">Send us a message</span>
          <h2 className="contact-message-title">Tell us what you need — we&apos;ll guide you</h2>
          <p className="contact-message-subtitle">
            Education loans, forex, blocked accounts, or study-abroad financing — our advisors
            respond with clear next steps, not generic replies.
          </p>
        </div>
      </motion.div>

      <ul className="contact-message-trust">
        {TRUST_ITEMS.map(({ icon: Icon, label }, index) => (
          <motion.li
            key={label}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.08 + index * 0.06, ease: EASE }}
          >
            <Icon className="contact-message-trust-icon" aria-hidden />
            {label}
          </motion.li>
        ))}
      </ul>

      <ContactForm embedded />

      <motion.div
        className="contact-message-upsell"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
      >
        <div>
          <h3 className="contact-message-upsell-title">Prefer a faster loan check?</h3>
          <p className="contact-message-upsell-text">
            Compare offers across 20+ lenders in under 7 minutes.
          </p>
        </div>
        <EligibilityCta source="contact-page" className="contact-message-upsell-cta" />
      </motion.div>
    </div>
  );
}
