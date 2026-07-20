"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, Calculator, CircleAlert, Sparkles, Wallet } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useSpring,
  useTransform,
} from "framer-motion";
import { GlassCard } from "@/components/cards/glass-card";
import { SectionShell } from "@/components/marketing/sections/section-shell";
import { Reveal, RevealItem, RevealStagger } from "@/components/marketing/motion/reveal";
import { EligibilityCta } from "@/components/marketing/eligibility/eligibility-cta";
import { LoanCalculatorLottie } from "@/components/marketing/sections/loan-calculator-lottie";
import { useMarketingMotion } from "@/lib/motion/use-marketing-motion";
import { useHydrationSafeReducedMotion } from "@/lib/motion/use-hydration-safe-reduced-motion";

const EASE = [0.22, 1, 0.36, 1] as const;
const CONFETTI_COLORS = ["#0b8fd8", "#38bdf8", "#7dd3fc", "#fbbf24", "#34d399", "#ffffff"];

type ConfettiParticle = {
  id: number;
  color: string;
  size: number;
  angle: number;
  distance: number;
  spin: number;
};

function calculateEmi(principal: number, annualRate: number, tenureYears: number) {
  const monthlyRate = annualRate / 12 / 100;
  const months = tenureYears * 12;
  if (monthlyRate === 0) {
    const emi = principal / months;
    return { emi, totalPayable: principal, totalInterest: 0 };
  }
  const factor = Math.pow(1 + monthlyRate, months);
  const emi = (principal * monthlyRate * factor) / (factor - 1);
  const totalPayable = emi * months;
  return {
    emi,
    totalPayable,
    totalInterest: totalPayable - principal,
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function AnimatedCurrency({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const prefersReducedMotion = useHydrationSafeReducedMotion();
  const spring = useSpring(value, {
    stiffness: 90,
    damping: 22,
    mass: 0.6,
  });

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  const display = useTransform(spring, (latest) =>
    formatCurrency(Math.round(latest)),
  );

  if (prefersReducedMotion) {
    return <span className={className}>{formatCurrency(value)}</span>;
  }

  return (
    <motion.span className={className} aria-live="polite">
      {display}
    </motion.span>
  );
}

type LoanSliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  formatValue: (value: number) => string;
  onChange: (value: number) => void;
};

function LoanSlider({
  label,
  value,
  min,
  max,
  step,
  formatValue,
  onChange,
}: LoanSliderProps) {
  const percent = ((value - min) / (max - min)) * 100;
  const prefersReducedMotion = useHydrationSafeReducedMotion();

  return (
    <div className="loan-calc-slider group">
      <div className="mb-3 flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <motion.span
          key={formatValue(value)}
          className="loan-calc-value-pill text-sm font-semibold tabular-nums text-primary"
          initial={prefersReducedMotion ? false : { opacity: 0.6, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: EASE }}
        >
          {formatValue(value)}
        </motion.span>
      </div>

      <div className="loan-calc-track-wrap">
        <div className="loan-calc-track" aria-hidden>
          <motion.div
            className="loan-calc-track-fill"
            initial={false}
            animate={{ width: `${percent}%` }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 120, damping: 22 }
            }
          />
          <motion.div
            className="loan-calc-thumb-glow"
            initial={false}
            animate={{ left: `calc(${percent}% - 10px)` }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 140, damping: 20 }
            }
          />
        </div>

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          aria-label={label}
          className="loan-calc-range-input"
        />
      </div>
    </div>
  );
}

function LoanBreakdownDonut({
  principal,
  totalInterest,
}: {
  principal: number;
  totalInterest: number;
}) {
  const prefersReducedMotion = useHydrationSafeReducedMotion();
  const total = principal + totalInterest;
  const principalShare = total > 0 ? principal / total : 0.5;
  const interestShare = 1 - principalShare;

  const size = 92;
  const stroke = 11;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const principalLength = circumference * principalShare;
  const interestLength = circumference * interestShare;
  const principalPct = Math.round(principalShare * 100);
  const interestPct = 100 - principalPct;

  return (
    <div
      className="loan-calc-donut-wrap"
      role="img"
      aria-label={`Principal ${principalPct} percent, interest ${interestPct} percent`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="loan-calc-donut -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={stroke}
        />
        <motion.circle
          key={`principal-${principalPct}`}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#38bdf8"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${principalLength} ${circumference - principalLength}`}
          initial={
            prefersReducedMotion
              ? false
              : { strokeDashoffset: circumference, opacity: 0.4 }
          }
          animate={{ strokeDashoffset: 0, opacity: 1 }}
          transition={{ duration: 0.55, ease: EASE }}
        />
        <motion.circle
          key={`interest-${interestPct}`}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#0b8fd8"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${interestLength} ${circumference - interestLength}`}
          strokeDashoffset={-principalLength}
          initial={
            prefersReducedMotion
              ? false
              : { strokeDashoffset: circumference - principalLength, opacity: 0.4 }
          }
          animate={{ strokeDashoffset: -principalLength, opacity: 1 }}
          transition={{ duration: 0.55, ease: EASE, delay: 0.06 }}
        />
      </svg>
      <div className="loan-calc-donut-center" aria-hidden>
        <span className="text-[10px] uppercase tracking-wider text-white/55">
          Split
        </span>
        <span className="text-sm font-semibold text-white">{principalPct}/{interestPct}</span>
      </div>
    </div>
  );
}

function createConfettiParticles(): ConfettiParticle[] {
  return Array.from({ length: 28 }, (_, index) => ({
    id: index,
    color: CONFETTI_COLORS[index % CONFETTI_COLORS.length]!,
    size: 5 + Math.random() * 5,
    angle: (Math.PI * 2 * index) / 28 + (Math.random() - 0.5) * 0.6,
    distance: 55 + Math.random() * 95,
    spin: (Math.random() - 0.5) * 540,
  }));
}

function LoanCalcConfetti({
  origin,
  particles,
  onComplete,
}: {
  origin: { x: number; y: number };
  particles: ConfettiParticle[];
  onComplete: () => void;
}) {
  return (
    <div className="loan-calc-confetti-layer" aria-hidden>
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="loan-calc-confetti-piece"
          style={{
            left: origin.x,
            top: origin.y,
            width: particle.size,
            height: particle.size * 0.65,
            backgroundColor: particle.color,
          }}
          initial={{ opacity: 1, scale: 0, x: 0, y: 0, rotate: 0 }}
          animate={{
            opacity: [1, 1, 0],
            scale: [0, 1.1, 0.4],
            x: Math.cos(particle.angle) * particle.distance,
            y: Math.sin(particle.angle) * particle.distance + 28,
            rotate: particle.spin,
          }}
          transition={{ duration: 0.95, ease: "easeOut" }}
          onAnimationComplete={
            particle.id === 0 ? onComplete : undefined
          }
        />
      ))}
    </div>
  );
}

function LoanSummaryFooter({
  totalPayable,
  totalInterest,
  onCtaClick,
  prefersReducedMotion,
}: {
  totalPayable: number;
  totalInterest: number;
  onCtaClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  prefersReducedMotion: boolean | null;
}) {
  return (
    <div className="loan-calc-footer">
      <p className="loan-calc-footer-label">Loan summary</p>

      <div className="loan-calc-stats">
        <motion.div
          className="loan-calc-stat-card"
          key={`payable-${Math.round(totalPayable / 1000)}`}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
        >
          <span className="loan-calc-stat-icon" aria-hidden>
            <Wallet className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <span className="loan-calc-stat-label">Total payable</span>
            <AnimatedCurrency
              value={totalPayable}
              className="loan-calc-stat-value block truncate"
            />
          </div>
        </motion.div>

        <motion.div
          className="loan-calc-stat-card loan-calc-stat-card--accent"
          key={`interest-${Math.round(totalInterest / 1000)}`}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE, delay: 0.05 }}
        >
          <span className="loan-calc-stat-icon loan-calc-stat-icon--accent" aria-hidden>
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <span className="loan-calc-stat-label">Total interest</span>
            <AnimatedCurrency
              value={totalInterest}
              className="loan-calc-stat-value loan-calc-stat-value--accent block truncate"
            />
          </div>
        </motion.div>
      </div>

      <div className="loan-calc-action-panel">
        <motion.div
          className="loan-calc-cta-wrap"
          whileHover={prefersReducedMotion ? undefined : { scale: 1.015 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.985 }}
          transition={{ type: "spring", stiffness: 400, damping: 24 }}
        >
          <EligibilityCta
            source="loan-calculator"
            className="loan-calc-cta group w-full rounded-full py-3.5 text-sm font-semibold sm:py-3.5"
            onClick={onCtaClick}
          >
            <span>Check actual eligibility</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </EligibilityCta>
        </motion.div>

        <div className="loan-calc-disclaimer">
          <CircleAlert className="loan-calc-disclaimer-icon h-3.5 w-3.5 shrink-0" aria-hidden />
          <p>
            Indicative estimate only. Actual lender rates, moratorium, margin
            money, and repayment terms may vary.
          </p>
        </div>
      </div>
    </div>
  );
}

export function LoanCalculatorSection() {
  const { scaleIn } = useMarketingMotion();
  const prefersReducedMotion = useHydrationSafeReducedMotion();

  const [amount, setAmount] = useState(4_000_000);
  const [rate, setRate] = useState(10.5);
  const [tenure, setTenure] = useState(10);
  const [confettiBurst, setConfettiBurst] = useState<{
    id: number;
    origin: { x: number; y: number };
    particles: ConfettiParticle[];
  } | null>(null);

  const { emi, totalPayable, totalInterest } = useMemo(
    () => calculateEmi(amount, rate, tenure),
    [amount, rate, tenure],
  );

  const total = amount + totalInterest;
  const principalPct = total > 0 ? Math.round((amount / total) * 100) : 50;
  const interestPct = 100 - principalPct;

  const handleCtaClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (prefersReducedMotion) return;
      const rect = event.currentTarget.getBoundingClientRect();
      setConfettiBurst({
        id: Date.now(),
        origin: {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        },
        particles: createConfettiParticles(),
      });
    },
    [prefersReducedMotion],
  );

  return (
    <SectionShell
      withReveal
      eyebrow="Loan calculator"
      title="Estimate your education loan EMI"
      description="Use this quick static estimate to plan your budget before speaking with our loan team."
    >
      <Reveal>
        <GlassCard className="loan-calc-shell overflow-hidden rounded-3xl border-border/60 p-0 shadow-[0_24px_60px_-28px_rgba(11,143,216,0.35)]">
          <div className="loan-calc-ambient" aria-hidden />

          <div className="loan-calc-grid relative">
            <RevealStagger className="loan-calc-controls">
              <div className="space-y-7 sm:space-y-8">
                <RevealItem>
                  <LoanSlider
                    label="Loan amount"
                    value={amount}
                    min={500_000}
                    max={15_000_000}
                    step={100_000}
                    formatValue={(value) => formatCurrency(value)}
                    onChange={setAmount}
                  />
                </RevealItem>
                <RevealItem>
                  <LoanSlider
                    label="Interest rate"
                    value={rate}
                    min={8}
                    max={16}
                    step={0.1}
                    formatValue={(value) => `${value.toFixed(1)}%`}
                    onChange={setRate}
                  />
                </RevealItem>
                <RevealItem>
                  <LoanSlider
                    label="Tenure"
                    value={tenure}
                    min={1}
                    max={15}
                    step={1}
                    formatValue={(value) => `${value} years`}
                    onChange={setTenure}
                  />
                </RevealItem>
              </div>

              <RevealItem>
                <LoanCalculatorLottie />
              </RevealItem>

              <div className="loan-calc-mobile-emi lg:hidden">
                <p className="text-xs font-medium uppercase tracking-wider text-primary/80">
                  Live estimate
                </p>
                <AnimatedCurrency
                  value={emi}
                  className="mt-1 text-2xl font-bold tabular-nums text-primary"
                />
                <p className="mt-1 text-xs text-muted-foreground">per month</p>
              </div>
            </RevealStagger>

            <motion.aside
              className="loan-calc-summary"
              initial={scaleIn.initial}
              whileInView={scaleIn.whileInView}
              viewport={scaleIn.viewport}
              transition={"transition" in scaleIn ? scaleIn.transition : undefined}
            >
              <div className="loan-calc-summary-bg" aria-hidden />
              <div className="loan-calc-summary-orb loan-calc-summary-orb--one" aria-hidden />
              <div className="loan-calc-summary-orb loan-calc-summary-orb--two" aria-hidden />

              <div className="relative z-10 flex h-full flex-col p-5 sm:p-7">
                <motion.div
                  className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white shadow-[0_0_24px_rgba(11,143,216,0.35)] sm:mb-5"
                  animate={
                    prefersReducedMotion
                      ? undefined
                      : { y: [0, -3, 0], rotate: [0, 2, 0, -2, 0] }
                  }
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Calculator className="h-5 w-5" aria-hidden />
                </motion.div>

                <div className="hidden lg:block">
                  <p className="text-sm text-white/70">Estimated monthly EMI</p>
                  <div className="mt-2 flex items-start gap-2">
                    <AnimatedCurrency
                      value={emi}
                      className="loan-calc-emi text-3xl font-bold tracking-tight text-white sm:text-4xl"
                    />
                    <motion.span
                      className="mt-1 inline-flex text-sky-300/80"
                      animate={
                        prefersReducedMotion
                          ? undefined
                          : { opacity: [0.45, 1, 0.45], scale: [0.95, 1, 0.95] }
                      }
                      transition={{ duration: 2.4, repeat: Infinity }}
                      aria-hidden
                    >
                      <Sparkles className="h-4 w-4" />
                    </motion.span>
                  </div>

                  <motion.div
                    className="loan-calc-divider my-4 sm:my-5"
                    layout
                    transition={{ duration: 0.35, ease: EASE }}
                  />
                </div>

                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-white/55 lg:hidden">
                  Payment breakdown
                </p>

                <div className="loan-calc-breakdown">
                  <LoanBreakdownDonut
                    principal={amount}
                    totalInterest={totalInterest}
                  />
                  <div className="loan-calc-legend">
                    <div className="loan-calc-legend-row">
                      <span className="loan-calc-legend-dot loan-calc-legend-dot--principal" />
                      <span>Principal</span>
                      <span className="ml-auto font-medium tabular-nums text-white">
                        {principalPct}%
                      </span>
                    </div>
                    <div className="loan-calc-legend-row">
                      <span className="loan-calc-legend-dot loan-calc-legend-dot--interest" />
                      <span>Interest</span>
                      <span className="ml-auto font-medium tabular-nums text-sky-200">
                        {interestPct}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="loan-calc-divider loan-calc-divider--soft my-4 sm:my-5" />

                <LoanSummaryFooter
                  totalPayable={totalPayable}
                  totalInterest={totalInterest}
                  onCtaClick={handleCtaClick}
                  prefersReducedMotion={prefersReducedMotion}
                />
              </div>
            </motion.aside>
          </div>
        </GlassCard>
      </Reveal>

      <AnimatePresence>
        {confettiBurst ? (
          <LoanCalcConfetti
            key={confettiBurst.id}
            origin={confettiBurst.origin}
            particles={confettiBurst.particles}
            onComplete={() => setConfettiBurst(null)}
          />
        ) : null}
      </AnimatePresence>
    </SectionShell>
  );
}
