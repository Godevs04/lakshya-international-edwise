"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEligibilityModal } from "@/hooks/use-eligibility-modal";

const COUNT_KEY = "lie-eligibility-prompt-count";
const MAX_PROMPTS = 3;
const INACTIVITY_MS = 60_000;

export function InactivityEligibilityPrompt() {
  const { open } = useEligibilityModal();
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<number | null>(null);

  const getCount = () => {
    if (typeof window === "undefined") return 0;
    return Number(sessionStorage.getItem(COUNT_KEY) ?? "0");
  };

  const scheduleTimer = useCallback(() => {
    if (typeof window === "undefined") return;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (getCount() >= MAX_PROMPTS) return;
    timerRef.current = window.setTimeout(() => {
      if (getCount() >= MAX_PROMPTS) return;
      setVisible(true);
      sessionStorage.setItem(COUNT_KEY, String(getCount() + 1));
    }, INACTIVITY_MS);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (getCount() >= MAX_PROMPTS) return;

    const reset = () => {
      if (!visible) scheduleTimer();
    };

    const events = ["mousemove", "keydown", "scroll", "touchstart"] as const;
    events.forEach((event) =>
      window.addEventListener(event, reset, { passive: true })
    );
    scheduleTimer();

    return () => {
      events.forEach((event) => window.removeEventListener(event, reset));
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [visible, scheduleTimer]);

  function dismiss() {
    setVisible(false);
    scheduleTimer();
  }

  function handleCheck() {
    setVisible(false);
    open({ source: "inactivity-prompt" });
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.25 }}
          className="glass-card fixed bottom-20 left-4 z-40 max-w-xs rounded-2xl p-4 shadow-xl md:bottom-24 md:left-6"
          role="dialog"
          aria-label="Financing help"
        >
          <button
            type="button"
            onClick={dismiss}
            className="absolute right-2 top-2 rounded-full p-1 text-muted-foreground hover:text-foreground"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="pr-4 text-sm font-semibold text-foreground">
            Need help financing your education?
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Check your loan eligibility in under 7 minutes.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={handleCheck}
              className="btn-marketing rounded-full px-3.5 py-2 text-xs font-semibold hover:bg-transparent"
            >
              Check Eligibility
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="rounded-full px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Dismiss
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
