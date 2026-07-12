"use client";

import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import type { LottieComponentProps } from "lottie-react";
import {
  MARKETING_LOTTIE_PRESETS,
  type MarketingLottiePreset,
} from "@/lib/constants/marketing/lottie-presets";
import { cn } from "@/lib/utils";

const Lottie = dynamic<LottieComponentProps>(
  () => import("lottie-react"),
  { ssr: false }
);

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
  const prefersReducedMotion = useReducedMotion();
  const animationData = MARKETING_LOTTIE_PRESETS[preset];

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
      ) : (
        <Lottie
          animationData={animationData}
          loop={loop}
          className={cn("marketing-lottie-player", playerClassName)}
        />
      )}
    </div>
  );

  if (variant === "inline") {
    return (
      <div
        className={cn("marketing-lottie-inline-wrap", className)}
        aria-hidden={ariaHidden}
      >
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
