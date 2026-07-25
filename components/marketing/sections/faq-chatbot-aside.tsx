"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { MarketingLottie } from "@/components/marketing/motion/marketing-lottie";
import { getWhatsAppLink } from "@/lib/config/marketing";

export function FaqChatbotAside() {
  const whatsapp = getWhatsAppLink("Hello, I have a question about education loans.");

  return (
    <aside className="faq-section-aside" aria-label="Get help">
      {/* Decorative animation stays aria-hidden; interactive copy sits outside it. */}
      <div className="faq-chatbot-lottie-panel">
        <MarketingLottie
          preset="live-chatbot"
          variant="inline"
          stageClassName="faq-chatbot-lottie-stage"
          playerClassName="faq-chatbot-lottie-player"
          ariaHidden
        />
        <div className="faq-chatbot-copy">
          <p className="faq-chatbot-eyebrow">Need a quick answer?</p>
          <p className="faq-chatbot-title">Our advisors are here to help</p>
          <p className="faq-chatbot-subtitle">
            Can&apos;t find what you&apos;re looking for? Chat with us for personalized loan
            guidance in minutes.
          </p>
          {whatsapp ? (
            <Link href={whatsapp} target="_blank" rel="noreferrer" className="faq-chatbot-cta">
              <MessageCircle className="h-4 w-4" aria-hidden />
              Chat on WhatsApp
            </Link>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
