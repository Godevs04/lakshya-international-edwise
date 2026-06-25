"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { DEFAULT_APP_LOGO } from "@/lib/brand/app-logo";
import { cn } from "@/lib/utils";

interface SidebarLogoMarkProps {
  src?: string;
  alt: string;
  className?: string;
  size?: "md" | "sm";
}

function isLocalStaticAsset(src: string) {
  return src.startsWith("/") && !src.startsWith("//");
}

export function SidebarLogoMark({
  src,
  alt,
  className,
  size = "md",
}: SidebarLogoMarkProps) {
  const reducedMotion = useReducedMotion();
  const logoSrc = src?.trim() || DEFAULT_APP_LOGO;
  const dimension = size === "sm" ? "h-10 w-10" : "h-12 w-12";
  const glowInset = size === "sm" ? "-inset-0.5" : "-inset-1";

  return (
    <motion.div
      className={cn("relative shrink-0", dimension, className)}
      whileHover={reducedMotion ? undefined : { scale: 1.04 }}
      transition={{ type: "spring", stiffness: 420, damping: 22 }}
    >
      <motion.div
        className={cn(
          "absolute rounded-full bg-gradient-to-br from-[#C4B5FD]/80 via-[#8B5CF6]/60 to-[#F472B6]/50 blur-md",
          glowInset
        )}
        animate={
          reducedMotion
            ? undefined
            : { opacity: [0.4, 0.72, 0.4], scale: [0.96, 1.04, 0.96] }
        }
        transition={
          reducedMotion
            ? undefined
            : { duration: 3.6, repeat: Infinity, ease: "easeInOut" }
        }
        aria-hidden
      />

      <div
        className={cn(
          "relative overflow-hidden rounded-full bg-gradient-to-b from-white to-[#F4F2FF] p-[3px]",
          "shadow-[0_6px_20px_rgba(0,0,0,0.32)] ring-1 ring-white/40",
          dimension
        )}
      >
        <div className="relative h-full w-full overflow-hidden rounded-full bg-[#FAFAFE]">
          <Image
            src={logoSrc}
            alt={alt}
            fill
            quality={100}
            unoptimized={isLocalStaticAsset(logoSrc)}
            priority
            className="object-cover object-center scale-[1.14]"
            sizes={size === "sm" ? "40px" : "48px"}
          />
        </div>
      </div>
    </motion.div>
  );
}
