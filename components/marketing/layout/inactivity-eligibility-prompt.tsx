"use client";

import { useCallback, useEffect, useRef } from "react";
import { useEligibilityModal } from "@/hooks/use-eligibility-modal";

const COUNT_KEY = "lie-contact-prompt-count";
const MAX_PROMPTS = 3;
/** Open the eligibility modal up to 3 times per visit, every 2 minutes */
const PROMPT_INTERVAL_MS = 120_000;

/**
 * Schedules the centered eligibility modal (same as "Check Eligibility") —
 * not a corner toast — up to 3 times per session.
 */
export function InactivityEligibilityPrompt() {
  const { open, isOpen } = useEligibilityModal();
  const openRef = useRef(open);
  const isOpenRef = useRef(isOpen);

  useEffect(() => {
    openRef.current = open;
    isOpenRef.current = isOpen;
  }, [open, isOpen]);

  const timerRef = useRef<number | null>(null);
  const autoPromptRef = useRef(false);
  const pendingAfterCloseRef = useRef(false);

  const getCount = () => {
    if (typeof window === "undefined") return 0;
    return Number(sessionStorage.getItem(COUNT_KEY) ?? "0");
  };

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const triggerAutoPrompt = useCallback(() => {
    if (getCount() >= MAX_PROMPTS) return;
    if (isOpenRef.current) {
      pendingAfterCloseRef.current = true;
      return;
    }
    sessionStorage.setItem(COUNT_KEY, String(getCount() + 1));
    autoPromptRef.current = true;
    openRef.current({ source: "session-prompt" });
  }, []);

  const scheduleNext = useCallback(() => {
    if (typeof window === "undefined") return;
    clearTimer();
    if (getCount() >= MAX_PROMPTS) return;

    timerRef.current = window.setTimeout(() => {
      triggerAutoPrompt();
    }, PROMPT_INTERVAL_MS);
  }, [clearTimer, triggerAutoPrompt]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (getCount() >= MAX_PROMPTS) return;

    scheduleNext();
    return clearTimer;
  }, [scheduleNext, clearTimer]);

  useEffect(() => {
    if (isOpen) return;

    if (pendingAfterCloseRef.current) {
      pendingAfterCloseRef.current = false;
      triggerAutoPrompt();
      return;
    }

    if (!autoPromptRef.current) return;

    autoPromptRef.current = false;
    if (getCount() < MAX_PROMPTS) {
      scheduleNext();
    }
  }, [isOpen, scheduleNext, triggerAutoPrompt]);

  return null;
}
