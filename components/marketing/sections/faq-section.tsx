"use client";

import type { MarketingFaq } from "@/types/marketing";
import { FaqSearch } from "@/components/marketing/sections/faq-search";
import { FaqChatbotAside } from "@/components/marketing/sections/faq-chatbot-aside";

interface FaqSectionProps {
  items: MarketingFaq[];
}

export function FaqPageSection({ items }: FaqSectionProps) {
  return (
    <div className="faq-section-layout">
      <div className="faq-section-main">
        <FaqSearch items={items} />
      </div>
      <FaqChatbotAside />
    </div>
  );
}
