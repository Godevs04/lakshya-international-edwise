"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useHydrationSafeReducedMotion } from "@/lib/motion/use-hydration-safe-reduced-motion";
import { MessageCircle, Phone, X } from "lucide-react";
import {
  formatMarketingPhoneDisplay,
  toMarketingTelHref,
} from "@/lib/constants/marketing/contact";
import { cn } from "@/lib/utils";

interface FloatingContactBarProps {
  whatsappLink?: string | null;
  phone?: string | null;
}

const EASE = [0.22, 1, 0.36, 1] as const;

export function FloatingContactBar({ whatsappLink, phone }: FloatingContactBarProps) {
  const [open, setOpen] = useState(false);
  const prefersReducedMotion = useHydrationSafeReducedMotion();
  const displayPhone = phone ? formatMarketingPhoneDisplay(phone) : null;
  const telHref = phone ? toMarketingTelHref(phone) : null;

  if (!whatsappLink && !telHref) return null;

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 md:bottom-6 md:right-6">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="floating-contact-panel w-[min(100vw-2.5rem,17rem)] overflow-hidden rounded-2xl border border-white/40 bg-white/95 p-4 shadow-[0_12px_40px_rgba(15,23,42,0.14)] backdrop-blur-xl"
            role="dialog"
            aria-label="Contact options"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Talk to us
            </p>
            {displayPhone && (
              <p className="mt-1 text-base font-semibold tracking-tight text-secondary">
                {displayPhone}
              </p>
            )}
            <div className="mt-3 flex flex-col gap-2">
              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#25D366] text-sm font-semibold text-white transition-transform duration-[250ms] hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
                  aria-label={`Chat on WhatsApp at ${displayPhone ?? "our number"}`}
                >
                  <MessageCircle className="h-4 w-4" aria-hidden />
                  WhatsApp
                </a>
              )}
              {telHref && (
                <a
                  href={telHref}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-primary/25 bg-primary/5 text-sm font-semibold text-primary transition-[transform,background] duration-[250ms] hover:scale-[1.02] hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  aria-label={`Call ${displayPhone ?? "us"}`}
                >
                  <Phone className="h-4 w-4" aria-hidden />
                  Call now
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((value) => !value)}
        whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
        transition={{ duration: 0.2, ease: EASE }}
        className={cn(
          "floating-contact-fab inline-flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_8px_28px_rgba(37,211,102,0.45)] transition-colors duration-[250ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2",
          open ? "bg-secondary" : "bg-[#25D366]"
        )}
        aria-expanded={open}
        aria-label={open ? "Close contact options" : "Open WhatsApp and call options"}
      >
        {open ? (
          <X className="h-6 w-6" aria-hidden />
        ) : (
          <MessageCircle className="h-6 w-6" aria-hidden />
        )}
      </motion.button>
    </div>
  );
}
