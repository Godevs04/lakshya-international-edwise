"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useMarketingMotion } from "@/lib/motion/use-marketing-motion";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const motionProps = useMarketingMotion();

  return (
    <motion.div
      className={cn(className)}
      initial={motionProps.fadeInUp.initial}
      whileInView={motionProps.fadeInUp.whileInView}
      viewport={motionProps.fadeInUp.viewport}
      transition={{ ...motionProps.fadeInUp.transition, delay }}
    >
      {children}
    </motion.div>
  );
}

interface RevealStaggerProps {
  children: React.ReactNode;
  className?: string;
}

export function RevealStagger({ children, className }: RevealStaggerProps) {
  const motionProps = useMarketingMotion();

  return (
    <motion.div
      className={cn(className)}
      initial={motionProps.staggerContainer.initial}
      whileInView={motionProps.staggerContainer.whileInView}
      viewport={motionProps.staggerContainer.viewport}
    >
      {children}
    </motion.div>
  );
}

interface RevealItemProps {
  children: React.ReactNode;
  className?: string;
}

export function RevealItem({ children, className }: RevealItemProps) {
  const motionProps = useMarketingMotion();

  return (
    <motion.div
      className={cn(className)}
      initial={motionProps.item.initial}
      whileInView={motionProps.item.whileInView}
      transition={motionProps.item.transition}
    >
      {children}
    </motion.div>
  );
}
