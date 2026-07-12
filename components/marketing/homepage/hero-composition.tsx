"use client";

import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useCallback } from "react";
import {
  BookOpen,
  GraduationCap,
  Stamp,
  TrendingUp,
} from "lucide-react";
import { useMarketingMotion } from "@/lib/motion/use-marketing-motion";
import { AnimatedCounter } from "@/components/marketing/motion/counter";

const ASSETS = {
  landmarks: "/assets/hero/Multiple.png",
  globe: "/assets/icons/global-network-digital-earth-visualization.png",
  lenders: [
    "/assets/partners/sbi.png",
    "/assets/partners/credila.png",
    "/assets/partners/icici.png",
    "/assets/partners/axis.png",
  ],
} as const;

function useParallaxLayer(strength: number) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 140, damping: 22 });
  const sy = useSpring(my, { stiffness: 140, damping: 22 });

  return {
    x: useTransform(sx, (v) => v * strength),
    y: useTransform(sy, (v) => v * strength),
    bind: (clientX: number, clientY: number, rect: DOMRect) => {
      mx.set(((clientX - rect.left - rect.width / 2) / rect.width) * 12);
      my.set(((clientY - rect.top - rect.height / 2) / rect.height) * 12);
    },
    reset: () => {
      mx.set(0);
      my.set(0);
    },
  };
}

export function HeroComposition() {
  const { prefersReducedMotion, floatSlow } = useMarketingMotion();
  const globe = useParallaxLayer(0.35);
  const landmarks = useParallaxLayer(0.55);
  const cards = useParallaxLayer(0.4);

  const onMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (prefersReducedMotion) return;
      const rect = event.currentTarget.getBoundingClientRect();
      globe.bind(event.clientX, event.clientY, rect);
      landmarks.bind(event.clientX, event.clientY, rect);
      cards.bind(event.clientX, event.clientY, rect);
    },
    [prefersReducedMotion, globe, landmarks, cards]
  );

  const onLeave = useCallback(() => {
    globe.reset();
    landmarks.reset();
    cards.reset();
  }, [globe, landmarks, cards]);

  return (
    <div
      className="hero-composition"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      aria-hidden
    >
      <motion.div className="hero-comp-globe" style={{ x: globe.x, y: globe.y }}>
        <Image
          src={ASSETS.globe}
          alt=""
          width={420}
          height={420}
          className="hero-comp-globe-img"
          priority
        />
      </motion.div>

      <motion.div
        className="hero-comp-float hero-comp-cap"
        {...(prefersReducedMotion ? {} : floatSlow)}
      >
        <GraduationCap className="h-5 w-5 text-primary" />
      </motion.div>

      <motion.div
        className="hero-comp-float hero-comp-passport"
        animate={prefersReducedMotion ? undefined : { y: [0, -5, 0] }}
        transition={
          prefersReducedMotion
            ? undefined
            : { duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }
        }
      >
        <BookOpen className="h-4 w-4 text-primary" />
      </motion.div>

      <motion.div
        className="hero-comp-float hero-comp-visa"
        animate={prefersReducedMotion ? undefined : { y: [0, -4, 0] }}
        transition={
          prefersReducedMotion
            ? undefined
            : { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.2 }
        }
      >
        <Stamp className="h-4 w-4 text-primary" />
      </motion.div>

      <div className="hero-comp-landmarks">
        <motion.div style={{ x: landmarks.x, y: landmarks.y }}>
          <Image
            src={ASSETS.landmarks}
            alt="Global landmarks representing study abroad destinations"
            width={680}
            height={280}
            priority
            className="hero-comp-landmarks-img"
          />
        </motion.div>
      </div>

      <motion.div className="hero-comp-cards" style={{ x: cards.x, y: cards.y }}>
        <motion.div
          className="hero-glass-card hero-glass-loan"
          {...(prefersReducedMotion ? {} : floatSlow)}
        >
          <p className="hero-glass-label">Loan Summary</p>
          <p className="hero-glass-value">
            <AnimatedCounter
              value={4500000}
              prefix="₹"
              duration={2000}
              variant="scramble"
              pulseOnComplete
            />
          </p>
          <p className="hero-glass-meta flex items-center gap-1 text-primary">
            <TrendingUp className="h-3 w-3" />
            ROI from{" "}
            <AnimatedCounter
              value={8.25}
              suffix="%"
              decimals={2}
              duration={1600}
              variant="scramble"
              className="font-semibold"
            />
          </p>
        </motion.div>

        <motion.div
          className="hero-glass-card hero-glass-approval"
          animate={prefersReducedMotion ? undefined : { y: [0, -4, 0] }}
          transition={
            prefersReducedMotion
              ? undefined
              : { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
          }
        >
          <p className="hero-glass-label">Approval Status</p>
          <div className="hero-approval-bar">
            <motion.span
              className="hero-approval-fill"
              initial={prefersReducedMotion ? false : { width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.2, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <p className="hero-glass-meta text-emerald-600">
            Approved ·{" "}
            <AnimatedCounter
              value={73}
              suffix=" hrs"
              duration={1700}
              variant="scramble"
              className="font-semibold"
            />
          </p>
        </motion.div>

        <motion.div
          className="hero-glass-card hero-glass-student"
          animate={prefersReducedMotion ? undefined : { y: [0, -5, 0] }}
          transition={
            prefersReducedMotion
              ? undefined
              : { duration: 6.8, repeat: Infinity, ease: "easeInOut", delay: 1 }
          }
        >
          <p className="hero-glass-label">Destination</p>
          <p className="hero-glass-value text-base">Canada · MS CS</p>
          <p className="hero-glass-meta">Visa ready</p>
        </motion.div>
      </motion.div>

      <div className="hero-comp-lenders">
        {ASSETS.lenders.map((logo, index) => (
          <motion.div
            key={logo}
            className="hero-comp-lender-chip"
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
            whileHover={prefersReducedMotion ? undefined : { y: -4, scale: 1.04 }}
          >
            <Image src={logo} alt="" width={64} height={32} className="hero-comp-lender-img" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
