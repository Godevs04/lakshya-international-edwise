"use client";

import { useEffect, useRef, useState } from "react";
import { useMarketingMotion } from "@/lib/motion/use-marketing-motion";
import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  duration?: number;
  decimals?: number;
  className?: string;
  pulseOnComplete?: boolean;
}

export function AnimatedCounter({
  value,
  suffix = "",
  duration = 1200,
  decimals = 0,
  className,
  pulseOnComplete = false,
}: AnimatedCounterProps) {
  const { prefersReducedMotion } = useMarketingMotion();
  const [count, setCount] = useState(prefersReducedMotion ? value : 0);
  const [started, setStarted] = useState(prefersReducedMotion);
  const [pulsed, setPulsed] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

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
      { threshold: 0.3 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!started || prefersReducedMotion) return;

    let frame = 0;
    const totalFrames = Math.max(20, Math.round(duration / 16));
    const timer = window.setInterval(() => {
      frame += 1;
      setCount((value * frame) / totalFrames);
      if (frame >= totalFrames) {
        setCount(value);
        if (pulseOnComplete) setPulsed(true);
        window.clearInterval(timer);
      }
    }, duration / totalFrames);

    return () => window.clearInterval(timer);
  }, [started, value, duration, prefersReducedMotion, pulseOnComplete]);

  return (
    <span
      ref={ref}
      className={cn(className, pulsed && pulseOnComplete && "counter-pulse inline-block")}
    >
      {count.toLocaleString("en-IN", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}
