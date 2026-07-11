"use client";

import { useEffect, useRef, useState } from "react";
import { useMarketingMotion } from "@/lib/motion/use-marketing-motion";
import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
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
  decimals = 0,
  className,
  pulseOnComplete = false,
  variant = "scramble",
  locale = "en-IN",
}: AnimatedCounterProps) {
  const { prefersReducedMotion } = useMarketingMotion();
  const [count, setCount] = useState(prefersReducedMotion ? value : 0);
  const [started, setStarted] = useState(prefersReducedMotion);
  const [pulsed, setPulsed] = useState(false);
  const [settled, setSettled] = useState(prefersReducedMotion);
  const ref = useRef<HTMLSpanElement>(null);
  const settleFromRef = useRef(value * 0.82);

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

    if (variant === "linear") {
      let frame = 0;
      const totalFrames = Math.max(24, Math.round(duration / 16));
      const timer = window.setInterval(() => {
        frame += 1;
        const progress = frame / totalFrames;
        setCount(value * easeOutCubic(progress));
        if (frame >= totalFrames) {
          setCount(value);
          setSettled(true);
          if (pulseOnComplete) setPulsed(true);
          window.clearInterval(timer);
        }
      }, duration / totalFrames);

      return () => window.clearInterval(timer);
    }

    const scrambleEnd = duration * 0.72;
    const startTime = performance.now();
    let rafId = 0;

    const tick = (now: number) => {
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
    return () => cancelAnimationFrame(rafId);
  }, [started, value, duration, prefersReducedMotion, pulseOnComplete, variant]);

  return (
    <span
      ref={ref}
      className={cn(
        "animated-counter tabular-nums",
        !settled && variant === "scramble" && "animated-counter-scrambling",
        pulsed && pulseOnComplete && "counter-pulse inline-block",
        className
      )}
    >
      {prefix}
      {formatCount(count, decimals, locale)}
      {suffix}
    </span>
  );
}
