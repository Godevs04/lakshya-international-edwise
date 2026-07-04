"use client";

import dynamic from "next/dynamic";
import { GraduationCap, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { LottieComponentProps } from "lottie-react";
import loanCalculatorAnimation from "@/public/lottie/loan-calculator.json";

const Lottie = dynamic<LottieComponentProps>(
  () => import("lottie-react"),
  { ssr: false },
);

const EASE = [0.22, 1, 0.36, 1] as const;

function LottieCopy() {
  return (
    <div className="loan-calc-lottie-copy text-center">
      <p className="loan-calc-lottie-eyebrow">
        <Sparkles className="h-3.5 w-3.5" aria-hidden />
        Your study abroad journey
      </p>
      <p className="loan-calc-lottie-title">Plan with confidence</p>
      <p className="loan-calc-lottie-subtitle">
        A quick EMI snapshot before you speak with our loan experts
      </p>
    </div>
  );
}

export function LoanCalculatorLottie() {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className="loan-calc-lottie-panel" aria-hidden>
        <div className="loan-calc-lottie-fallback">
          <GraduationCap className="h-10 w-10 text-primary/70" />
        </div>
        <LottieCopy />
      </div>
    );
  }

  return (
    <motion.div
      className="loan-calc-lottie-panel"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.55, ease: EASE }}
    >
      <div className="loan-calc-lottie-glow" aria-hidden />
      <div className="loan-calc-lottie-stage">
        <Lottie
          animationData={loanCalculatorAnimation}
          loop
          className="loan-calc-lottie-player"
        />
      </div>
      <LottieCopy />
    </motion.div>
  );
}
