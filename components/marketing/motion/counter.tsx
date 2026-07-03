"use client";

import { useEffect, useRef, useState } from "react";
import { useMarketingMotion } from "@/lib/motion/use-marketing-motion";

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  duration?: number;
  decimals?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  suffix = "",
  duration = 1200,
  decimals = 0,
  className,
}: AnimatedCounterProps) {
  const { prefersReducedMotion } = useMarketingMotion();
  const [count, setCount] = useState(prefersReducedMotion ? value : 0);
  const [started, setStarted] = useState(prefersReducedMotion);
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
        window.clearInterval(timer);
      }
    }, duration / totalFrames);

    return () => window.clearInterval(timer);
  }, [started, value, duration, prefersReducedMotion]);

  return (
    <span ref={ref} className={className}>
      {count.toLocaleString("en-IN", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}
