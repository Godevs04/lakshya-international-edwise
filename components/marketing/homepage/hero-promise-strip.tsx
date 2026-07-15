"use client";

import { motion } from "framer-motion";
import { GraduationCap, Landmark, Users } from "lucide-react";
import { useMarketingMotion } from "@/lib/motion/use-marketing-motion";

const PROMISES = [
  { icon: GraduationCap, label: "Non-cosigner — no repayment during school" },
  { icon: Users, label: "Cosigner loans up to ₹1.5 Cr" },
  { icon: Landmark, label: "Collateral loans up to ₹2 Cr" },
] as const;

export function HeroPromiseStrip() {
  const { prefersReducedMotion } = useMarketingMotion();

  return (
    <ul className="hero-promise-strip mt-6" aria-label="Why students choose Lakshya">
      {PROMISES.map(({ icon: Icon, label }, index) => (
        <motion.li
          key={label}
          className="hero-promise-item"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.3 + index * 0.08,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <span className="hero-promise-icon">
            <Icon className="h-4 w-4" aria-hidden />
          </span>
          <span className="hero-promise-label">{label}</span>
        </motion.li>
      ))}
    </ul>
  );
}
