"use client";

import { useEffect, useRef, useState } from "react";
import { useMarketingMotion } from "@/lib/motion/use-marketing-motion";
import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  /** Milliseconds to wait after entering view before counting */
  delay?: number;
  decimals?: number;
  className?: string;
  pulseOnComplete?: boolean;
  /** Linear count-up or scramble-then-settle */
  variant?: "linear" | "scramble";
  locale?: string;
}

function formatCount(value: number, decimals: number, locale: string) {
  return value.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function AnimatedCounter({
  value,
  suffix = "",
  prefix = "",
  duration = 1600,
  delay = 0,
  decimals = 0,
  className,
  pulseOnComplete = false,
  variant = "scramble",
  locale = "en-IN",
}: AnimatedCounterProps) {
  const { prefersReducedMotion } = useMarketingMotion();
  // Always animate from 0 on first paint so SSR and hydration match. Reduced-motion
  // users skip the animation by deriving the final value after hydration.
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const [pulsed, setPulsed] = useState(false);
  const [settled, setSettled] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const settleFromRef = useRef(value * 0.82);
  const displayCount = prefersReducedMotion ? value : count;
  const isSettled = prefersReducedMotion || settled;

  useEffect(() => {
    if (prefersReducedMotion) return;

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!started || prefersReducedMotion) return;

    let cancelled = false;
    let rafId = 0;
    let delayTimer: number | undefined;

    const runAnimation = () => {
      if (cancelled) return;

      if (variant === "linear") {
        const startTime = performance.now();

        const tick = (now: number) => {
          if (cancelled) return;
          const elapsed = now - startTime;
          const t = Math.min(elapsed / duration, 1);
          setCount(value * easeOutCubic(t));

          if (t < 1) {
            rafId = requestAnimationFrame(tick);
          } else {
            setCount(value);
            setSettled(true);
            if (pulseOnComplete) setPulsed(true);
          }
        };

        rafId = requestAnimationFrame(tick);
        return;
      }

      const scrambleEnd = duration * 0.72;
      const startTime = performance.now();

      const tick = (now: number) => {
        if (cancelled) return;
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);

        if (elapsed < scrambleEnd) {
          const scrambleProgress = elapsed / scrambleEnd;
          const trend = value * scrambleProgress * (0.55 + Math.random() * 0.45);
          const noise = (Math.random() - 0.45) * value * 0.22 * (1 - scrambleProgress * 0.85);
          const next = Math.max(0, trend + noise);
          setCount(next);
          settleFromRef.current = next;
        } else {
          const settleProgress = (elapsed - scrambleEnd) / (duration - scrambleEnd);
          const eased = easeOutCubic(Math.min(settleProgress, 1));
          const from = settleFromRef.current;
          setCount(from + (value - from) * eased);
        }

        if (t < 1) {
          rafId = requestAnimationFrame(tick);
        } else {
          setCount(value);
          setSettled(true);
          if (pulseOnComplete) setPulsed(true);
        }
      };

      rafId = requestAnimationFrame(tick);
    };

    if (delay > 0) {
      delayTimer = window.setTimeout(runAnimation, delay);
    } else {
      runAnimation();
    }

    return () => {
      cancelled = true;
      if (delayTimer !== undefined) window.clearTimeout(delayTimer);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [started, value, duration, delay, prefersReducedMotion, pulseOnComplete, variant]);

  return (
    <span
      ref={ref}
      className={cn(
        "animated-counter tabular-nums",
        !isSettled && variant === "scramble" && "animated-counter-scrambling",
        pulsed && pulseOnComplete && "counter-pulse inline-block",
        className
      )}
    >
      {prefix}
      {formatCount(displayCount, decimals, locale)}
      {suffix}
    </span>
  );
}
