"use client";

import { Headphones } from "lucide-react";
import { MarketingLottie } from "@/components/marketing/motion/marketing-lottie";

export function ContactUsLottiePanel() {
  return (
    <MarketingLottie
      preset="contact-us"
      variant="panel"
      fallbackIcon={Headphones}
      panelClassName="contact-lottie-panel"
      stageClassName="contact-lottie-stage"
      playerClassName="contact-lottie-player"
    >
      <div className="contact-lottie-copy">
        <p className="contact-lottie-eyebrow">We&apos;re here for you</p>
        <p className="contact-lottie-title">Reach out anytime</p>
        <p className="contact-lottie-subtitle">
          Our loan experts respond within one business day — by form, phone, or WhatsApp.
        </p>
      </div>
    </MarketingLottie>
  );
}
