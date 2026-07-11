"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useHeroMotion } from "@/hooks/use-hero-motion";

const ASSETS = {
  airplane: "/assets/icons/Aeroplane_1.png",
  landmarks: "/assets/hero/Multiple.png",
} as const;

export function HeroVisualCollage() {
  const { planeFly, prefersReducedMotion } = useHeroMotion();

  return (
    <div className="hero-visual-collage">
      <div className="hero-collage-landmarks">
        <Image
          src={ASSETS.landmarks}
          alt="Global landmarks representing study abroad destinations"
          width={680}
          height={280}
          priority
          className="hero-collage-landmarks-img"
        />
      </div>

      <motion.div className="hero-collage-plane" {...(prefersReducedMotion ? {} : planeFly)}>
        <Image
          src={ASSETS.airplane}
          alt=""
          width={180}
          height={100}
          className="hero-collage-plane-img"
        />
      </motion.div>
    </div>
  );
}
