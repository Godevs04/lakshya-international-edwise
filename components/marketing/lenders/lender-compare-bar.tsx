"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Scale, X, ArrowRight } from "lucide-react";
import type { MarketingLender } from "@/types/marketing";
import { useMarketingMotion } from "@/lib/motion/use-marketing-motion";

interface LenderCompareBarProps {
  lenders: MarketingLender[];
  maxCount: number;
  onRemove: (slug: string) => void;
  onClear: () => void;
  onCompare: () => void;
}

export function LenderCompareBar({
  lenders,
  maxCount,
  onRemove,
  onClear,
  onCompare,
}: LenderCompareBarProps) {
  const { prefersReducedMotion } = useMarketingMotion();
  const canCompare = lenders.length >= 2;

  return (
    <AnimatePresence>
      {lenders.length > 0 ? (
        <motion.div
          className="lender-compare-bar"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 24, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, y: 16, x: "-50%" }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          role="region"
          aria-label="Lender comparison selection"
        >
          <div className="lender-compare-bar-inner">
            <div className="lender-compare-bar-chips">
              <span className="lender-compare-bar-label">
                <Scale className="h-4 w-4 text-primary" aria-hidden />
                {lenders.length} of {maxCount} selected
              </span>
              <ul className="lender-compare-chip-list">
                {lenders.map((lender) => (
                  <li key={lender.slug} className="lender-compare-chip">
                    <span>{lender.name}</span>
                    <button
                      type="button"
                      className="lender-compare-chip-remove"
                      onClick={() => onRemove(lender.slug)}
                      aria-label={`Remove ${lender.name} from comparison`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lender-compare-bar-actions">
              <button type="button" className="lender-compare-bar-clear" onClick={onClear}>
                Clear
              </button>
              <button
                type="button"
                className="lender-compare-bar-go"
                disabled={!canCompare}
                onClick={onCompare}
              >
                Compare
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
