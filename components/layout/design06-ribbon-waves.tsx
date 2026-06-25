"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useId } from "react";

interface Design06RibbonWavesProps {
  className?: string;
  variant?: "hero" | "compact" | "ambient" | "full";
}

/** Contour lines — right half only, no hard left cutoff */
const CONTOUR_PATHS = [
  "M380 205 C480 155, 560 225, 660 175 C740 130, 820 195, 920 145",
  "M395 193 C495 143, 575 213, 675 163 C755 118, 835 183, 935 133",
  "M410 181 C510 131, 590 201, 690 151 C770 106, 850 171, 950 121",
  "M425 169 C525 119, 605 189, 705 139 C785 94, 865 159, 965 109",
  "M440 157 C540 107, 620 177, 720 127 C800 82, 880 147, 980 97",
  "M455 145 C555 95, 635 165, 735 115 C815 70, 895 135, 995 85",
  "M470 133 C570 83, 650 153, 750 103 C830 58, 910 123, 1010 73",
  "M485 121 C585 71, 665 141, 765 91 C845 46, 925 111, 1025 61",
];

const TOPO_ARCS = [
  "M620 18 C680 36, 720 62, 748 98",
  "M642 12 C708 34, 752 66, 782 108",
  "M664 6 C728 28, 778 72, 812 118",
];

const DOT_ROWS = 4;
const DOT_COLS = 8;
const DOT_SPACING = 10;

function AnimatedDotGrid({
  className,
  reducedMotion,
}: {
  className?: string;
  reducedMotion: boolean | null;
}) {
  const dots = Array.from({ length: DOT_ROWS * DOT_COLS }).map((_, index) => {
    const row = Math.floor(index / DOT_COLS);
    const col = index % DOT_COLS;
    const cx = 6 + col * DOT_SPACING;
    const cy = 6 + row * DOT_SPACING;
    const waveDelay = row * 0.22 + col * 0.14;
    return { cx, cy, waveDelay, index };
  });

  return (
    <motion.svg
      className={className}
      viewBox={`0 0 ${6 + (DOT_COLS - 1) * DOT_SPACING + 6} ${6 + (DOT_ROWS - 1) * DOT_SPACING + 6}`}
      aria-hidden
      initial={false}
      animate={
        reducedMotion
          ? undefined
          : { x: [0, 3, 0], y: [0, -2, 0] }
      }
      transition={
        reducedMotion
          ? undefined
          : { duration: 12, repeat: Infinity, ease: "easeInOut" as const }
      }
    >
      {dots.map(({ cx, cy, waveDelay, index }) => (
        <motion.circle
          key={index}
          cx={cx}
          cy={cy}
          fill="#6D5EF7"
          initial={{ r: 1, opacity: 0.18 }}
          animate={
            reducedMotion
              ? { r: 1.2, opacity: 0.28 }
              : {
                  r: [1, 1.8, 1],
                  opacity: [0.12, 0.45, 0.12],
                }
          }
          transition={
            reducedMotion
              ? undefined
              : {
                  duration: 2.8,
                  repeat: Infinity,
                  ease: "easeInOut" as const,
                  delay: waveDelay,
                }
          }
        />
      ))}
      {!reducedMotion &&
        dots
          .filter((_, i) => i % 3 === 0)
          .map(({ cx, cy, waveDelay, index }) => (
            <motion.circle
              key={`glow-${index}`}
              cx={cx + 1.2}
              cy={cy + 1.2}
              fill="#EC4899"
              initial={{ r: 0.5, opacity: 0 }}
              animate={{
                r: [0.4, 1, 0.4],
                opacity: [0, 0.22, 0],
              }}
              transition={{
                duration: 3.4,
                repeat: Infinity,
                ease: "easeInOut" as const,
                delay: waveDelay + 0.5,
              }}
            />
          ))}
    </motion.svg>
  );
}

export function Design06RibbonWaves({
  className,
  variant = "hero",
}: Design06RibbonWavesProps) {
  const uid = useId().replace(/:/g, "");
  const reducedMotion = useReducedMotion();

  const isHero = variant === "hero";
  const isFull = variant === "full";
  const isCompact = variant === "compact";
  const isAmbient = variant === "ambient";

  const gentleDrift = reducedMotion
    ? {}
    : {
        animate: { x: [0, 10, 0], y: [0, -5, 0] },
        transition: { duration: 18, repeat: Infinity, ease: "easeInOut" as const },
      };

  const softPulse = reducedMotion
    ? {}
    : {
        animate: { opacity: [0.5, 0.75, 0.5] },
        transition: { duration: 10, repeat: Infinity, ease: "easeInOut" as const },
      };

  return (
    <div
      className={cn(
        "pointer-events-none select-none",
        isHero && "absolute inset-0 overflow-hidden",
        isFull && "absolute inset-0 overflow-hidden",
        isCompact && "absolute inset-0 overflow-hidden",
        isAmbient && "absolute inset-0 overflow-hidden",
        className
      )}
      aria-hidden
    >
      {!isAmbient && (
        <AnimatedDotGrid
          reducedMotion={reducedMotion}
          className={cn(
            "absolute z-[1]",
            isHero
              ? "left-[28%] top-[4%] h-14 w-32 sm:left-[32%] sm:top-[6%] sm:h-16 sm:w-36"
              : isFull
                ? "left-[18%] top-[8%] h-16 w-40 sm:left-[22%] sm:top-[10%] sm:h-[4.5rem] sm:w-44"
              : "left-[30%] top-2 h-10 w-24"
          )}
        />
      )}

      {/* Soft horizontal fade — graphics dissolve into the card, no hard vertical edge */}
      <div
        className={cn(
          "absolute inset-0",
          isHero && "[mask-image:linear-gradient(to_right,transparent_0%,transparent_22%,rgba(0,0,0,0.4)_45%,black_72%,black_100%)]",
          isFull && "[mask-image:linear-gradient(to_right,transparent_0%,rgba(0,0,0,0.25)_18%,black_55%,black_100%)]",
          isCompact && "[mask-image:linear-gradient(to_right,transparent_0%,transparent_50%,black_85%,black_100%)]",
          isAmbient && "[mask-image:radial-gradient(ellipse_80%_60%_at_70%_40%,black_20%,transparent_70%)]"
        )}
      >
        <svg
          className={cn(
            "absolute h-full w-full",
            isHero && "right-0 top-0",
            isFull && "inset-0 h-full w-full",
            isCompact && "right-0 top-0",
            isAmbient && "left-1/2 top-[6%] -translate-x-1/2 opacity-50"
          )}
          viewBox="0 0 1020 300"
          fill="none"
          preserveAspectRatio="xMaxYMax slice"
        >
          <defs>
            <linearGradient id={`${uid}-fadeH`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="40%" stopColor="white" stopOpacity="0" />
              <stop offset="62%" stopColor="white" stopOpacity="0.5" />
              <stop offset="100%" stopColor="white" stopOpacity="1" />
            </linearGradient>
            <linearGradient id={`${uid}-ribbonA`} x1="0.5" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#A78BFA" stopOpacity="0" />
              <stop offset="35%" stopColor="#8B5CF6" stopOpacity="0.12" />
              <stop offset="70%" stopColor="#7C6CF8" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#EC4899" stopOpacity="0.16" />
            </linearGradient>
            <linearGradient id={`${uid}-ribbonB`} x1="0.55" y1="0" x2="1" y2="0.8">
              <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0" />
              <stop offset="45%" stopColor="#8B5CF6" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#6D5EF7" stopOpacity="0.14" />
            </linearGradient>
            <linearGradient id={`${uid}-stroke`} x1="0.45" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6D5EF7" stopOpacity="0" />
              <stop offset="30%" stopColor="#8B5CF6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.4" />
            </linearGradient>
            <radialGradient id={`${uid}-glow`} cx="0.82" cy="0.55" r="0.42">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.28" />
              <stop offset="55%" stopColor="#8B5CF6" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
            </radialGradient>
            <filter id={`${uid}-soften`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <mask id={`${uid}-hMask`}>
              <rect width="1020" height="300" fill={`url(#${uid}-fadeH)`} />
            </mask>
          </defs>

          <g mask={`url(#${uid}-hMask)`}>
            <motion.g {...softPulse}>
              <ellipse cx="860" cy="175" rx="220" ry="130" fill={`url(#${uid}-glow)`} />
            </motion.g>

            <motion.g {...gentleDrift} filter={`url(#${uid}-soften)`}>
              {/* Organic bottom wave — no vertical left wall */}
              <path
                d="M548 300 C548 268, 588 238, 648 228 C708 218, 758 258, 818 228 C868 203, 918 248, 968 218 C998 200, 1020 212, 1020 212 L1020 300 Z"
                fill={`url(#${uid}-ribbonA)`}
              />
              <path
                d="M580 300 C580 278, 618 252, 678 242 C738 232, 788 268, 848 242 C898 222, 948 262, 1002 238 L1002 300 Z"
                fill={`url(#${uid}-ribbonB)`}
              />
              {(isHero || isFull) && (
                <path
                  d="M420 300 C420 275, 468 248, 528 238 C588 228, 628 268, 688 248 C738 232, 788 272, 848 252 L848 300 Z"
                  fill={`url(#${uid}-ribbonB)`}
                  opacity={isFull ? 0.85 : 0.55}
                />
              )}
            </motion.g>

            <motion.g {...gentleDrift}>
              {CONTOUR_PATHS.map((d, i) => (
                <path
                  key={i}
                  d={d}
                  stroke={`url(#${uid}-stroke)`}
                  strokeWidth={isCompact ? 0.7 : 0.9}
                  strokeLinecap="round"
                  fill="none"
                  opacity={0.14 + (i / CONTOUR_PATHS.length) * 0.32}
                  style={{
                    strokeDasharray: reducedMotion ? undefined : "900",
                    animation: reducedMotion
                      ? undefined
                      : `contour-drift ${16 + (i % 3) * 2}s ease-in-out infinite`,
                    animationDelay: `${i * 0.4}s`,
                  }}
                />
              ))}
            </motion.g>

            <motion.g
              {...(reducedMotion
                ? {}
                : {
                    animate: { opacity: [0.15, 0.3, 0.15] },
                    transition: { duration: 12, repeat: Infinity, ease: "easeInOut" as const },
                  })}
            >
              {TOPO_ARCS.map((d, i) => (
                <path
                  key={i}
                  d={d}
                  stroke="#9B8AFB"
                  strokeWidth={0.75 - i * 0.06}
                  strokeLinecap="round"
                  fill="none"
                  opacity={0.12 + i * 0.04}
                />
              ))}
            </motion.g>
          </g>
        </svg>
      </div>

      {(isHero || isFull) && !reducedMotion && (
        <motion.div
          className={cn(
            "absolute bottom-0 right-0 bg-gradient-to-l from-[#8B5CF6]/8 via-[#8B5CF6]/3 to-transparent",
            isFull ? "h-full w-[65%] from-[#8B5CF6]/12" : "h-40 w-[45%]"
          )}
          animate={{ opacity: [0.6, 0.95, 0.6] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" as const }}
        />
      )}
    </div>
  );
}
