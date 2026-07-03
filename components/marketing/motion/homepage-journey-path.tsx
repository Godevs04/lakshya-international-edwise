"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Subtle SVG journey path that draws as homepage sections enter view.
 */
export function HomepageJourneyPath() {
  const prefersReducedMotion = useReducedMotion();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const nodes = document.querySelectorAll("[data-journey-node]");
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).length;
        const total = nodes.length;
        setProgress(Math.min(visible / total, 1));
      },
      { threshold: 0.3, rootMargin: "-10% 0px" }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  const pathLength = 1200;
  const dashOffset = pathLength * (1 - progress);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[1] opacity-40 sm:opacity-60 lg:opacity-100"
      aria-hidden
    >
      <svg
        className="h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M 8 12 Q 25 25 35 35 T 55 50 T 75 65 T 92 88"
          stroke="rgba(11, 143, 216, 0.15)"
          strokeWidth="0.15"
          strokeLinecap="round"
          strokeDasharray={pathLength}
          strokeDashoffset={dashOffset}
          vectorEffect="non-scaling-stroke"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.22, 1, 0.36, 1)" }}
        />
      </svg>
    </div>
  );
}
