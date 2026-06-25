"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useId } from "react";

interface Design06RibbonWavesProps {
  className?: string;
  variant?: "hero" | "compact" | "ambient" | "full";
}

const CONTOUR_PATHS = [
  "M380 205 C480 155, 560 225, 660 175 C740 130, 820 195, 920 145",
  "M395 193 C495 143, 575 213, 675 163 C755 118, 835 183, 935 133",
  "M410 181 C510 131, 590 201, 690 151 C770 106, 850 171, 950 121",
  "M425 169 C525 119, 605 189, 705 139 C785 94, 865 159, 965 109",
  "M440 157 C540 107, 620 177, 720 127 C800 82, 880 147, 980 97",
  "M455 145 C555 95, 635 165, 735 115 C815 70, 895 135, 995 85",
];

const TOPO_ARCS = [
  "M620 18 C680 36, 720 62, 748 98",
  "M642 12 C708 34, 752 66, 782 108",
  "M664 6 C728 28, 778 72, 812 118",
];

const DOT_ROWS = 3;
const DOT_COLS = 7;
const DOT_SPACING = 11;

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
      animate={reducedMotion ? undefined : { x: [0, 2, 0], y: [0, -1.5, 0] }}
      transition={
        reducedMotion
          ? undefined
          : { duration: 14, repeat: Infinity, ease: "easeInOut" as const }
      }
    >
      {dots.map(({ cx, cy, waveDelay, index }) => (
        <motion.circle
          key={index}
          cx={cx}
          cy={cy}
          fill="#E8952E"
          initial={{ r: 0.75, opacity: 0.12 }}
          animate={
            reducedMotion
              ? { r: 0.9, opacity: 0.18 }
              : {
                  r: [0.75, 1.2, 0.75],
                  opacity: [0.08, 0.28, 0.08],
                }
          }
          transition={
            reducedMotion
              ? undefined
              : {
                  duration: 3.2,
                  repeat: Infinity,
                  ease: "easeInOut" as const,
                  delay: waveDelay,
                }
          }
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
        animate: { x: [0, 8, 0], y: [0, -4, 0] },
        transition: { duration: 20, repeat: Infinity, ease: "easeInOut" as const },
      };

  const softPulse = reducedMotion
    ? {}
    : {
        animate: { opacity: [0.35, 0.55, 0.35] },
        transition: { duration: 12, repeat: Infinity, ease: "easeInOut" as const },
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
              ? "left-[28%] top-[4%] h-12 w-28 sm:left-[32%] sm:top-[6%] sm:h-14 sm:w-32"
              : isFull
                ? "left-[18%] top-[8%] h-14 w-36 sm:left-[22%] sm:top-[10%] sm:h-16 sm:w-40"
                : "left-[30%] top-2 h-9 w-20"
          )}
        />
      )}

      <div
        className={cn(
          "absolute inset-0",
          isHero && "[mask-image:linear-gradient(to_right,transparent_0%,transparent_24%,rgba(0,0,0,0.35)_48%,black_74%,black_100%)]",
          isFull && "[mask-image:linear-gradient(to_right,transparent_0%,rgba(0,0,0,0.2)_20%,black_58%,black_100%)]",
          isCompact && "[mask-image:linear-gradient(to_right,transparent_0%,transparent_52%,black_88%,black_100%)]",
          isAmbient && "[mask-image:radial-gradient(ellipse_75%_55%_at_72%_38%,black_15%,transparent_72%)]"
        )}
      >
        <svg
          className={cn(
            "absolute h-full w-full",
            isHero && "right-0 top-0",
            isFull && "inset-0 h-full w-full",
            isCompact && "right-0 top-0",
            isAmbient && "left-1/2 top-[6%] -translate-x-1/2 opacity-40"
          )}
          viewBox="0 0 1020 300"
          fill="none"
          preserveAspectRatio="xMaxYMax slice"
        >
          <defs>
            <linearGradient id={`${uid}-fadeH`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="42%" stopColor="white" stopOpacity="0" />
              <stop offset="64%" stopColor="white" stopOpacity="0.45" />
              <stop offset="100%" stopColor="white" stopOpacity="1" />
            </linearGradient>
            <linearGradient id={`${uid}-ribbonA`} x1="0.5" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FCD34D" stopOpacity="0" />
              <stop offset="35%" stopColor="#F59E0B" stopOpacity="0.08" />
              <stop offset="70%" stopColor="#EA580C" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#FB923C" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id={`${uid}-ribbonB`} x1="0.55" y1="0" x2="1" y2="0.8">
              <stop offset="0%" stopColor="#FDE68A" stopOpacity="0" />
              <stop offset="45%" stopColor="#F59E0B" stopOpacity="0.07" />
              <stop offset="100%" stopColor="#E8952E" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id={`${uid}-stroke`} x1="0.45" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#E8952E" stopOpacity="0" />
              <stop offset="30%" stopColor="#F59E0B" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#FBBF24" stopOpacity="0.28" />
            </linearGradient>
            <radialGradient id={`${uid}-glow`} cx="0.82" cy="0.55" r="0.4">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.18" />
              <stop offset="55%" stopColor="#F59E0B" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
            </radialGradient>
            <filter id={`${uid}-soften`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <mask id={`${uid}-hMask`}>
              <rect width="1020" height="300" fill={`url(#${uid}-fadeH)`} />
            </mask>
          </defs>

          <g mask={`url(#${uid}-hMask)`}>
            <motion.g {...softPulse}>
              <ellipse cx="860" cy="175" rx="200" ry="118" fill={`url(#${uid}-glow)`} />
            </motion.g>

            <motion.g {...gentleDrift} filter={`url(#${uid}-soften)`}>
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
                  opacity={isFull ? 0.75 : 0.45}
                />
              )}
            </motion.g>

            <motion.g {...gentleDrift}>
              {CONTOUR_PATHS.map((d, i) => (
                <path
                  key={i}
                  d={d}
                  stroke={`url(#${uid}-stroke)`}
                  strokeWidth={isCompact ? 0.45 : 0.55}
                  strokeLinecap="round"
                  fill="none"
                  opacity={0.1 + (i / CONTOUR_PATHS.length) * 0.22}
                  style={{
                    strokeDasharray: reducedMotion ? undefined : "900",
                    animation: reducedMotion
                      ? undefined
                      : `contour-drift ${18 + (i % 3) * 2}s ease-in-out infinite`,
                    animationDelay: `${i * 0.45}s`,
                  }}
                />
              ))}
            </motion.g>

            <motion.g
              {...(reducedMotion
                ? {}
                : {
                    animate: { opacity: [0.1, 0.22, 0.1] },
                    transition: { duration: 14, repeat: Infinity, ease: "easeInOut" as const },
                  })}
            >
              {TOPO_ARCS.map((d, i) => (
                <path
                  key={i}
                  d={d}
                  stroke="#FBBF24"
                  strokeWidth={0.55 - i * 0.05}
                  strokeLinecap="round"
                  fill="none"
                  opacity={0.08 + i * 0.03}
                />
              ))}
            </motion.g>
          </g>
        </svg>
      </div>

      {(isHero || isFull) && !reducedMotion && (
        <motion.div
          className={cn(
            "absolute bottom-0 right-0 bg-gradient-to-l from-[#F59E0B]/6 via-[#F59E0B]/2 to-transparent",
            isFull ? "h-full w-[62%] from-[#F59E0B]/9" : "h-36 w-[42%]"
          )}
          animate={{ opacity: [0.45, 0.75, 0.45] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" as const }}
        />
      )}
    </div>
  );
}
