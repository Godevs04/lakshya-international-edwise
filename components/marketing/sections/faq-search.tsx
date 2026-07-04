"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";
import type { MarketingFaq } from "@/types/marketing";
import { cn } from "@/lib/utils";
import { useMarketingMotion } from "@/lib/motion/use-marketing-motion";

export function FaqSearch({ items }: { items: MarketingFaq[] }) {
  const [query, setQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { prefersReducedMotion } = useMarketingMotion();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q)
    );
  }, [items, query]);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpenIndex(null);
          }}
          placeholder="Search questions..."
          aria-label="Search frequently asked questions"
          className="lead-form-field h-12 w-full rounded-xl border border-border/80 bg-white pl-11 pr-4 text-sm text-foreground shadow-sm outline-none placeholder:text-muted-foreground focus-visible:border-primary/40"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No questions match your search. Try different keywords.
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((item, index) => {
            const open = openIndex === index;
            return (
              <div key={item.question} className="card-premium overflow-hidden">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/30"
                  onClick={() => setOpenIndex(open ? null : index)}
                  aria-expanded={open}
                >
                  <span className="font-medium text-foreground">{item.question}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                      open && "rotate-180"
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
      )}
    </div>
  );
}
