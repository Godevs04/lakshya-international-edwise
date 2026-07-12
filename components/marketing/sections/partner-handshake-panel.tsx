"use client";

import { HeartHandshake } from "lucide-react";
import { MarketingLottie } from "@/components/marketing/motion/marketing-lottie";

export function PartnerHandshakePanel() {
  return (
    <MarketingLottie
      preset="partner-handshake"
      variant="panel"
      fallbackIcon={HeartHandshake}
      panelClassName="partner-handshake-panel"
      stageClassName="partner-handshake-stage"
      playerClassName="partner-handshake-player"
    >
      <div className="partner-handshake-copy">
        <p className="partner-handshake-eyebrow">Partnership that works</p>
        <p className="partner-handshake-title">Let&apos;s grow together</p>
        <p className="partner-handshake-subtitle">
          Join counsellors and consultancies who refer students for education loans — we handle
          funding, you keep the relationship.
        </p>
      </div>
    </MarketingLottie>
  );
}
