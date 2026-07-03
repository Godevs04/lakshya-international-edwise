"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { MarketingFaq } from "@/types/marketing";
import { cn } from "@/lib/utils";
import { SectionShell } from "@/components/marketing/sections/section-shell";
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
      title={title}
      description={description}
      align="center"
      containerClassName="max-w-3xl"
    >
      <div className="space-y-3">
        {items.map((item, index) => {
          const open = openIndex === index;
          return (
            <div key={item.question} className="card-premium overflow-hidden">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/30"
                onClick={() => setOpenIndex(open ? null : index)}
                aria-expanded={open}
              >
                <span className="font-medium text-secondary">{item.question}</span>
                <ChevronDown
                  className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200", open && "rotate-180")}
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
                    <div className="border-t border-border px-5 py-4 text-sm leading-relaxed text-muted-foreground">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}
