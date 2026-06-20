"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  padding?: boolean;
}

export function GlassCard({
  children,
  className,
  hover = false,
  glow = false,
  padding = false,
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      whileHover={
        hover
          ? {
              y: -4,
              transition: { duration: 0.2 },
            }
          : undefined
      }
      className={cn(
        "glass-card relative overflow-hidden rounded-[20px]",
        hover && "cursor-pointer transition-shadow hover:shadow-xl hover:shadow-[#6D5EF7]/10",
        glow && "ring-1 ring-[#6D5EF7]/20",
        padding && "p-6",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
