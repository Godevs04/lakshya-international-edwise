"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useId } from "react";
import { cn } from "@/lib/utils";

interface Design06TopWavesProps {
  className?: string;
}

const WAVE_WIDTH = 1440;
const WAVE_HEIGHT = 320;

const WAVE_LAYERS = [
  {
    d: `M0,${WAVE_HEIGHT} L0,210 C180,150 360,250 540,195 C720,140 900,230 1080,175 C1260,120 1350,165 ${WAVE_WIDTH},140 L${WAVE_WIDTH},${WAVE_HEIGHT} Z`,
    fill: "waveA",
    duration: 28,
    opacity: 0.42,
  },
  {
    d: `M0,${WAVE_HEIGHT} L0,235 C200,185 400,265 600,215 C800,165 1000,245 1200,200 C1320,170 1380,195 ${WAVE_WIDTH},175 L${WAVE_WIDTH},${WAVE_HEIGHT} Z`,
    fill: "waveB",
    duration: 22,
    opacity: 0.32,
    reverse: true,
  },
  {
    d: `M0,${WAVE_HEIGHT} L0,255 C160,220 320,280 480,250 C640,220 800,275 960,245 C1120,215 1280,260 ${WAVE_WIDTH},230 L${WAVE_WIDTH},${WAVE_HEIGHT} Z`,
    fill: "waveC",
    duration: 18,
    opacity: 0.26,
  },
];

const CONTOUR_LINES = [
  "M0 95 C200 72 400 118 600 88 C800 58 1000 108 1200 78 C1320 62 1380 72 1440 68",
  "M0 112 C220 88 440 132 660 102 C880 72 1100 122 1320 92 C1380 86 1410 90 1440 88",
  "M0 128 C240 104 480 148 720 118 C960 88 1200 138 1440 108",
];

function FloatingOrbs({ reducedMotion }: { reducedMotion: boolean | null }) {
  const orbs = [
    { cx: "78%", cy: "18%", r: 110, color: "#F59E0B", delay: 0 },
    { cx: "92%", cy: "32%", r: 72, color: "#FBBF24", delay: 2 },
    { cx: "62%", cy: "8%", r: 52, color: "#E8952E", delay: 4 },
  ];

  return (
    <>
      {orbs.map((orb, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full blur-3xl dark:opacity-60"
          style={{
            left: orb.cx,
            top: orb.cy,
            width: orb.r,
            height: orb.r,
            marginLeft: -orb.r / 2,
            marginTop: -orb.r / 2,
            background: `radial-gradient(circle, ${orb.color}30 0%, ${orb.color}0A 45%, transparent 70%)`,
          }}
          animate={
            reducedMotion
              ? { opacity: 0.35 }
              : {
                  opacity: [0.22, 0.48, 0.22],
                  scale: [1, 1.08, 1],
                  x: [0, index % 2 === 0 ? 12 : -10, 0],
                  y: [0, index % 2 === 0 ? -6 : 5, 0],
                }
          }
          transition={
            reducedMotion
              ? undefined
              : {
                  duration: 12 + index * 2,
                  repeat: Infinity,
                  ease: "easeInOut" as const,
                  delay: orb.delay,
                }
          }
        />
      ))}
    </>
  );
}

function AnimatedDotField({ reducedMotion }: { reducedMotion: boolean | null }) {
  const dots = Array.from({ length: 36 }).map((_, index) => {
    const row = Math.floor(index / 9);
    const col = index % 9;
    return {
      left: `${10 + col * 8.5}%`,
      top: `${8 + row * 6}%`,
      delay: row * 0.15 + col * 0.08,
    };
  });

  return (
    <div className="absolute inset-0">
      {dots.map((dot, index) => (
        <motion.span
          key={index}
          className="absolute h-0.5 w-0.5 rounded-full bg-[#E8952E] dark:bg-[#FCD34D]"
          style={{ left: dot.left, top: dot.top }}
          animate={
            reducedMotion
              ? { opacity: 0.14 }
              : {
                  opacity: [0.05, 0.28, 0.05],
                  scale: [0.85, 1.15, 0.85],
                }
          }
          transition={
            reducedMotion
              ? undefined
              : {
                  duration: 3.6,
                  repeat: Infinity,
                  ease: "easeInOut" as const,
                  delay: dot.delay,
                }
          }
        />
      ))}
    </div>
  );
}

export function Design06TopWaves({ className }: Design06TopWavesProps) {
  const uid = useId().replace(/:/g, "");
  const reducedMotion = useReducedMotion();

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 z-0 h-[min(36vh,280px)] overflow-hidden sm:h-[min(40vh,320px)]",
        className
      )}
      aria-hidden
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#FFF8ED]/88 via-[#FFFBF5]/50 to-transparent dark:from-[#1c1917]/88 dark:via-[#292524]/36 dark:to-transparent" />

      <FloatingOrbs reducedMotion={reducedMotion} />
      <AnimatedDotField reducedMotion={reducedMotion} />

      <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,black_0%,black_50%,transparent_100%)]">
        <svg
          className="absolute bottom-0 left-0 h-[88%] w-full"
          viewBox={`0 0 ${WAVE_WIDTH} ${WAVE_HEIGHT}`}
          preserveAspectRatio="none"
          fill="none"
        >
          <defs>
            <linearGradient id={`${uid}-waveA`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.18" />
              <stop offset="45%" stopColor="#F59E0B" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#E8952E" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id={`${uid}-waveB`} x1="0" y1="0" x2="1" y2="0.8">
              <stop offset="0%" stopColor="#FCD34D" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#EA580C" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#FB923C" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id={`${uid}-waveC`} x1="0.2" y1="0" x2="0.9" y2="1">
              <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.08" />
            </linearGradient>
            <linearGradient id={`${uid}-stroke`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#E8952E" stopOpacity="0.06" />
              <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#FBBF24" stopOpacity="0.08" />
            </linearGradient>
          </defs>

          {WAVE_LAYERS.map((layer, layerIndex) => {
            const fillId =
              layer.fill === "waveA"
                ? `${uid}-waveA`
                : layer.fill === "waveB"
                  ? `${uid}-waveB`
                  : `${uid}-waveC`;

            const scrollAnimation = reducedMotion
              ? {}
              : {
                  animate: { x: layer.reverse ? ["-50%", "0%"] : ["0%", "-50%"] },
                  transition: {
                    duration: layer.duration,
                    repeat: Infinity,
                    ease: "linear" as const,
                  },
                };

            return (
              <motion.g key={layerIndex} {...scrollAnimation} style={{ opacity: layer.opacity }}>
                <path d={layer.d} fill={`url(#${fillId})`} />
                <path d={layer.d} fill={`url(#${fillId})`} transform={`translate(${WAVE_WIDTH}, 0)`} />
              </motion.g>
            );
          })}

          <motion.g
            {...(reducedMotion
              ? {}
              : {
                  animate: { x: ["0%", "-50%"] },
                  transition: { duration: 36, repeat: Infinity, ease: "linear" as const },
                })}
          >
            {[0, WAVE_WIDTH].map((offset) => (
              <g key={offset} transform={`translate(${offset}, 0)`}>
                {CONTOUR_LINES.map((d, index) => (
                  <path
                    key={index}
                    d={d}
                    stroke={`url(#${uid}-stroke)`}
                    strokeWidth={0.55}
                    strokeLinecap="round"
                    fill="none"
                    opacity={0.12 + index * 0.05}
                    style={
                      reducedMotion
                        ? undefined
                        : {
                            strokeDasharray: 600,
                            animation: `contour-drift ${16 + index * 2}s ease-in-out infinite`,
                            animationDelay: `${index * 0.5}s`,
                          }
                    }
                  />
                ))}
              </g>
            ))}
          </motion.g>
        </svg>
      </div>

      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#E8952E]/18 to-transparent dark:via-[#FBBF24]/14" />
    </div>
  );
}
