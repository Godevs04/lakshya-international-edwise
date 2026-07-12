"use client";

import { GraduationCap, Sparkles } from "lucide-react";
import { MarketingLottie } from "@/components/marketing/motion/marketing-lottie";

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
  return (
    <MarketingLottie
      preset="loan-calculator"
      variant="panel"
      panelClassName="loan-calc-lottie-panel"
      stageClassName="loan-calc-lottie-stage"
      playerClassName="loan-calc-lottie-player"
      fallbackIcon={GraduationCap}
    >
      <LottieCopy />
    </MarketingLottie>
  );
}
