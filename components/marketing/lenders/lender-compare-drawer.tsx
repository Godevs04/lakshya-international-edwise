"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Scale } from "lucide-react";
import type { MarketingLender } from "@/types/marketing";
import { LENDER_CATEGORY_LABELS, getLenderCollateralLabel } from "@/lib/constants/marketing/lenders";
import { EligibilityCta } from "@/components/marketing/eligibility/eligibility-cta";
import { useMarketingMotion } from "@/lib/motion/use-marketing-motion";

interface LenderCompareDrawerProps {
  lenders: MarketingLender[];
  open: boolean;
  onClose: () => void;
}

const ROWS: { key: string; label: string; get: (l: MarketingLender) => string }[] = [
  { key: "category", label: "Category", get: (l) => LENDER_CATEGORY_LABELS[l.category] },
  { key: "roi", label: "ROI from", get: (l) => `${l.roiFrom}%` },
  { key: "loan", label: "Max loan", get: (l) => l.maxLoanLabel },
  { key: "approval", label: "Approval", get: (l) => l.processingLabel },
  {
    key: "collateral",
    label: "Collateral",
    get: getLenderCollateralLabel,
  },
  { key: "fee", label: "Lakshya fee", get: () => "Zero service charge" },
];

export function LenderCompareDrawer({ lenders, open, onClose }: LenderCompareDrawerProps) {
  const { prefersReducedMotion } = useMarketingMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && lenders.length > 0 ? (
        <>
          <motion.button
            type="button"
            className="lender-compare-backdrop"
            aria-label="Close comparison"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <div className="lender-compare-drawer-shell">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="lender-compare-title"
              className="lender-compare-drawer"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: 24 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
            <div className="lender-compare-drawer-header">
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" aria-hidden />
                <h2 id="lender-compare-title" className="text-lg font-bold text-secondary">
                  Compare lenders
                </h2>
              </div>
              <button
                type="button"
                className="lender-compare-close"
                onClick={onClose}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="lender-compare-table-wrap">
              <table className="lender-compare-table">
                <thead>
                  <tr>
                    <th scope="col" className="lender-compare-th-feature">
                      Feature
                    </th>
                    {lenders.map((lender) => (
                      <th key={lender.slug} scope="col" className="lender-compare-th-lender">
                        {lender.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((row) => (
                    <tr key={row.key}>
                      <th scope="row" className="lender-compare-td-label">
                        {row.label}
                      </th>
                      {lenders.map((lender) => (
                        <td key={lender.slug} className="lender-compare-td-value">
                          {row.get(lender)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="lender-compare-drawer-footer">
              <p className="text-xs text-muted-foreground">
                Comparing {lenders.length} lender{lenders.length > 1 ? "s" : ""} side by side
              </p>
              <EligibilityCta source="lending-partners-compare" className="lender-compare-cta">
                Check best match
                <ArrowRight className="h-4 w-4" aria-hidden />
              </EligibilityCta>
            </div>
          </motion.div>
          </div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
