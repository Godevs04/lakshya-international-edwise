"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { GraduationCap, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const LOAN_CALC_LOTTIE_SRC =
  "https://assets4.lottiefiles.com/packages/lf20_touohxv0.json";

const EASE = [0.22, 1, 0.36, 1] as const;

export function LoanCalculatorLottie() {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className="loan-calc-lottie-panel" aria-hidden>
        <div className="loan-calc-lottie-fallback">
          <GraduationCap className="h-10 w-10 text-primary/70" />
        </div>
        <div className="loan-calc-lottie-copy text-center">
          <p className="loan-calc-lottie-title">Fund your global dream</p>
          <p className="loan-calc-lottie-subtitle">
            Plan smarter before you apply
          </p>
        </div>
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
        <DotLottieReact
          src={LOAN_CALC_LOTTIE_SRC}
          loop
          autoplay
          speed={0.85}
          className="loan-calc-lottie-player"
        />
      </div>
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
    </motion.div>
  );
}
