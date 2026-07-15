"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ArrowRight } from "lucide-react";
import type { MarketingFaq } from "@/types/marketing";
import { cn } from "@/lib/utils";
import { SectionShell } from "@/components/marketing/sections/section-shell";
import { RevealStagger, RevealItem } from "@/components/marketing/motion/reveal";
import { FaqAnswer } from "@/components/marketing/sections/faq-answer";
import { FaqChatbotAside } from "@/components/marketing/sections/faq-chatbot-aside";
import { useMarketingMotion } from "@/lib/motion/use-marketing-motion";

interface FaqSectionProps {
  items: MarketingFaq[];
  title?: string;
  description?: string;
}

export function FaqSection({
  items,
  title = "Frequently asked questions",
  description = "Answers to common questions about education loans, eligibility, and funding your studies abroad.",
}: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { prefersReducedMotion } = useMarketingMotion();

  return (
    <SectionShell
      variant="muted"
      background="grid"
      title={title}
      description={description}
      align="center"
      containerClassName="max-w-6xl"
    >
      <div className="faq-section-layout">
        <div className="faq-section-main">
          <RevealStagger className="space-y-3">
            {items.map((item, index) => {
              const open = openIndex === index;
              return (
                <RevealItem key={item.question}>
                  <div
                    className={cn(
                      "glass-faq overflow-hidden rounded-2xl transition-colors duration-300",
                      open && "bg-white/90 ring-1 ring-primary/10"
                    )}
                  >
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-white/50"
                      onClick={() => setOpenIndex(open ? null : index)}
                      aria-expanded={open}
                    >
                      <span className="font-medium text-secondary">{item.question}</span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300",
                          open && "rotate-180 text-primary"
                        )}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={prefersReducedMotion ? undefined : { height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-border/60 px-5 py-4">
                            <FaqAnswer answer={item.answer} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </RevealItem>
              );
            })}
          </RevealStagger>

          <div className="mt-8 text-center">
            <Link
              href="/faq"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              View all FAQs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <FaqChatbotAside />
      </div>
    </SectionShell>
  );
}
