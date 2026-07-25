"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import type { LottieComponentProps } from "lottie-react";
import {
  loadMarketingLottiePreset,
  type MarketingLottieAnimation,
  type MarketingLottiePreset,
} from "@/lib/constants/marketing/lottie-presets";
import { useHydrationSafeReducedMotion } from "@/lib/motion/use-hydration-safe-reduced-motion";
import { cn } from "@/lib/utils";

const Lottie = dynamic<LottieComponentProps>(() => import("lottie-react"), { ssr: false });

const EASE = [0.22, 1, 0.36, 1] as const;

export interface MarketingLottieProps {
  preset: MarketingLottiePreset;
  /** Panel wrapper — glow + stage + optional copy */
  variant?: "inline" | "panel";
  loop?: boolean;
  className?: string;
  panelClassName?: string;
  stageClassName?: string;
  playerClassName?: string;
  fallbackIcon?: LucideIcon;
  /** Decorative — hidden from assistive tech by default */
  ariaHidden?: boolean;
  reveal?: boolean;
  children?: React.ReactNode;
}

export function MarketingLottie({
  preset,
  variant = "inline",
  loop = true,
  className,
  panelClassName,
  stageClassName,
  playerClassName,
  fallbackIcon: FallbackIcon,
  ariaHidden = true,
  reveal = true,
  children,
}: MarketingLottieProps) {
  const prefersReducedMotion = useHydrationSafeReducedMotion();
  const [animationData, setAnimationData] = useState<MarketingLottieAnimation | null>(null);

  useEffect(() => {
    let cancelled = false;
    void loadMarketingLottiePreset(preset).then((data) => {
      if (!cancelled) setAnimationData(data);
    });
    return () => {
      cancelled = true;
    };
  }, [preset]);

  const player = (
    <div
      className={cn(
        variant === "panel" ? "marketing-lottie-stage" : "marketing-lottie-inline",
        stageClassName
      )}
    >
      {prefersReducedMotion && FallbackIcon ? (
        <div className="marketing-lottie-fallback" aria-hidden={ariaHidden}>
          <FallbackIcon className="h-10 w-10 text-primary/70" />
        </div>
      ) : animationData ? (
        <Lottie
          animationData={animationData}
          loop={loop}
          className={cn("marketing-lottie-player", playerClassName)}
        />
      ) : (
        <div className={cn("marketing-lottie-player", playerClassName)} aria-hidden />
      )}
    </div>
  );

  if (variant === "inline") {
    return (
      <div className={cn("marketing-lottie-inline-wrap", className)} aria-hidden={ariaHidden}>
        {player}
      </div>
    );
  }

  const panel = (
    <div
      className={cn("marketing-lottie-panel", panelClassName, className)}
      aria-hidden={ariaHidden}
    >
      <div className="marketing-lottie-glow" aria-hidden />
      {player}
      {children}
    </div>
  );

  if (!reveal || prefersReducedMotion) {
    return panel;
  }

  return (
    <motion.div
      className="marketing-lottie-reveal"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.55, ease: EASE }}
    >
      {panel}
    </motion.div>
  );
}
