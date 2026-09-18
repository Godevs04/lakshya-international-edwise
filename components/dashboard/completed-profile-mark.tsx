"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompletedProfileMarkProps {
  className?: string;
}

/** Soft green completion mark — no extra copy, just a calm animated check. */
export function CompletedProfileMark({ className }: CompletedProfileMarkProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "mt-3 inline-flex items-center gap-2.5 rounded-full border border-[#22C55E]/25 bg-[#22C55E]/10 px-3.5 py-2",
        "shadow-[0_8px_24px_-14px_rgba(34,197,94,0.7)]",
        className
      )}
    >
      <span className="relative flex h-8 w-8 items-center justify-center">
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full bg-[#22C55E]/20"
          animate={{ scale: [1, 1.28, 1], opacity: [0.55, 0.15, 0.55] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.span
          aria-hidden
          className="absolute inset-[3px] rounded-full border border-[#22C55E]/35"
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          style={{
            borderTopColor: "#22C55E",
            borderRightColor: "transparent",
          }}
        />
        <motion.span
          className="relative flex h-6 w-6 items-center justify-center rounded-full bg-[#22C55E] text-white shadow-sm"
          initial={{ scale: 0.7 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 420, damping: 18, delay: 0.08 }}
        >
          <motion.span
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.25 }}
          >
            <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
          </motion.span>
        </motion.span>
      </span>
      <span className="pr-0.5 text-sm font-semibold tracking-tight text-[#15803D]">Completed</span>
    </motion.div>
  );
}
