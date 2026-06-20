"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

export function GlassCard({
  children,
  className,
  hover = false,
  gradient = false,
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : undefined}
      className={cn(
        "relative rounded-xl border bg-card/80 backdrop-blur-sm shadow-sm",
        gradient &&
          "before:absolute before:inset-0 before:rounded-xl before:p-[1px] before:bg-gradient-to-br before:from-primary/20 before:via-transparent before:to-accent/20 before:-z-10",
        hover && "transition-shadow hover:shadow-md",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
