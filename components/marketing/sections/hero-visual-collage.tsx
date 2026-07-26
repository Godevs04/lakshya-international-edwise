"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useHeroMotion } from "@/hooks/use-hero-motion";

const ASSETS = {
  landmarks: "/assets/hero/Multiple.png",
} as const;

/** Compact Multiple.png collage for secondary hero surfaces. */
export function HeroVisualCollage() {
  const { prefersReducedMotion } = useHeroMotion();

  return (
    <div className="hero-visual-collage">
      <motion.div
        className="hero-collage-landmarks"
        animate={prefersReducedMotion ? undefined : { y: [0, -4, 0] }}
        transition={
          prefersReducedMotion ? undefined : { duration: 7, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <Image
          src={ASSETS.landmarks}
          alt="Global landmarks representing study abroad destinations"
          width={560}
          height={594}
          priority
          className="hero-collage-landmarks-img"
          sizes="(max-width: 1024px) 90vw, 520px"
          quality={80}
        />
      </motion.div>
    </div>
  );
}
