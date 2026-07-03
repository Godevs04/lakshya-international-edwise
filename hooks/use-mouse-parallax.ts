"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

const MAX_OFFSET = 3;

export function useMouseParallax(enabled = true) {
  const prefersReducedMotion = useReducedMotion();
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled || prefersReducedMotion) return;
    if (typeof window === "undefined") return;

    const isTouch = window.matchMedia("(pointer: coarse)").matches;

    if (isTouch) {
      const onScroll = () => {
        const y = Math.min(window.scrollY * 0.015, MAX_OFFSET);
        setOffset({ x: 0, y });
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }

    const onMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * MAX_OFFSET * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * MAX_OFFSET * 2;
      setOffset({ x, y });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [enabled, prefersReducedMotion]);

  return offset;
}
