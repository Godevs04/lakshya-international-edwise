"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { MarketingFaq } from "@/types/marketing";
import { cn } from "@/lib/utils";

interface FaqSectionProps {
  items: MarketingFaq[];
  title?: string;
}

export function FaqSection({ items, title = "Frequently asked questions" }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="section-padding">
      <div className="container mx-auto max-w-3xl px-4">
        <h2 className="mb-6 text-center text-3xl font-bold text-secondary">{title}</h2>
        <div className="space-y-3">
          {items.map((item, index) => {
            const open = openIndex === index;
            return (
              <div key={item.question} className="rounded-2xl border border-border bg-white">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
                  onClick={() => setOpenIndex(open ? null : index)}
                  aria-expanded={open}
                >
                  <span className="font-medium text-secondary">{item.question}</span>
                  <ChevronDown className={cn("h-4 w-4 shrink-0 transition", open && "rotate-180")} />
                </button>
                {open && (
                  <div className="border-t border-border px-4 py-4 text-sm leading-relaxed text-muted-foreground">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
