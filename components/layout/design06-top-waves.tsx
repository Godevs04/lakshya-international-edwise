"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useId } from "react";
import { cn } from "@/lib/utils";

interface Design06TopWavesProps {
  className?: string;
}

const WAVE_WIDTH = 1440;
const WAVE_HEIGHT = 320;

/** Seamless tile — duplicated for infinite horizontal scroll */
const WAVE_LAYERS = [
  {
    d: `M0,${WAVE_HEIGHT} L0,210 C180,150 360,250 540,195 C720,140 900,230 1080,175 C1260,120 1350,165 ${WAVE_WIDTH},140 L${WAVE_WIDTH},${WAVE_HEIGHT} Z`,
    fill: "waveA",
    duration: 28,
    opacity: 0.55,
  },
  {
    d: `M0,${WAVE_HEIGHT} L0,235 C200,185 400,265 600,215 C800,165 1000,245 1200,200 C1320,170 1380,195 ${WAVE_WIDTH},175 L${WAVE_WIDTH},${WAVE_HEIGHT} Z`,
    fill: "waveB",
    duration: 22,
    opacity: 0.45,
    reverse: true,
  },
  {
    d: `M0,${WAVE_HEIGHT} L0,255 C160,220 320,280 480,250 C640,220 800,275 960,245 C1120,215 1280,260 ${WAVE_WIDTH},230 L${WAVE_WIDTH},${WAVE_HEIGHT} Z`,
    fill: "waveC",
    duration: 18,
    opacity: 0.38,
  },
];

const CONTOUR_LINES = [
  "M0 95 C200 72 400 118 600 88 C800 58 1000 108 1200 78 C1320 62 1380 72 1440 68",
  "M0 112 C220 88 440 132 660 102 C880 72 1100 122 1320 92 C1380 86 1410 90 1440 88",
  "M0 128 C240 104 480 148 720 118 C960 88 1200 138 1440 108",
];

function FloatingOrbs({ reducedMotion }: { reducedMotion: boolean | null }) {
  const orbs = [
    { cx: "78%", cy: "18%", r: 120, color: "#8B5CF6", delay: 0 },
    { cx: "92%", cy: "32%", r: 80, color: "#EC4899", delay: 2 },
    { cx: "62%", cy: "8%", r: 60, color: "#6D5EF7", delay: 4 },
  ];

  return (
    <>
      {orbs.map((orb, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full blur-3xl"
          style={{
            left: orb.cx,
            top: orb.cy,
            width: orb.r,
            height: orb.r,
            marginLeft: -orb.r / 2,
            marginTop: -orb.r / 2,
            background: `radial-gradient(circle, ${orb.color}40 0%, ${orb.color}12 45%, transparent 70%)`,
          }}
          animate={
            reducedMotion
              ? { opacity: 0.5 }
              : {
                  opacity: [0.35, 0.7, 0.35],
                  scale: [1, 1.12, 1],
                  x: [0, index % 2 === 0 ? 18 : -14, 0],
                  y: [0, index % 2 === 0 ? -10 : 8, 0],
                }
          }
          transition={
            reducedMotion
              ? undefined
              : {
                  duration: 10 + index * 2,
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
  const dots = Array.from({ length: 48 }).map((_, index) => {
    const row = Math.floor(index / 12);
    const col = index % 12;
    return {
      left: `${8 + col * 7.2}%`,
      top: `${6 + row * 5.5}%`,
      delay: row * 0.15 + col * 0.08,
    };
  });

  return (
    <div className="absolute inset-0">
      {dots.map((dot, index) => (
        <motion.span
          key={index}
          className="absolute h-1 w-1 rounded-full bg-[#6D5EF7]"
          style={{ left: dot.left, top: dot.top }}
          animate={
            reducedMotion
              ? { opacity: 0.2 }
              : {
                  opacity: [0.08, 0.42, 0.08],
                  scale: [0.8, 1.35, 0.8],
                }
          }
          transition={
            reducedMotion
              ? undefined
              : {
                  duration: 3.2,
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
        "pointer-events-none absolute inset-x-0 top-0 z-0 h-[min(38vh,300px)] overflow-hidden sm:h-[min(42vh,340px)]",
        className
      )}
      aria-hidden
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#F3F0FF]/90 via-[#F8F7FF]/55 to-transparent" />

      <FloatingOrbs reducedMotion={reducedMotion} />
      <AnimatedDotField reducedMotion={reducedMotion} />

      <div
        className="absolute inset-0 [mask-image:linear-gradient(to_bottom,black_0%,black_55%,transparent_100%)]"
      >
        <svg
          className="absolute bottom-0 left-0 h-[88%] w-full"
          viewBox={`0 0 ${WAVE_WIDTH} ${WAVE_HEIGHT}`}
          preserveAspectRatio="none"
          fill="none"
        >
          <defs>
            <linearGradient id={`${uid}-waveA`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.35" />
              <stop offset="45%" stopColor="#8B5CF6" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#6D5EF7" stopOpacity="0.22" />
            </linearGradient>
            <linearGradient id={`${uid}-waveB`} x1="0" y1="0" x2="1" y2="0.8">
              <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#7C6CF8" stopOpacity="0.26" />
              <stop offset="100%" stopColor="#EC4899" stopOpacity="0.18" />
            </linearGradient>
            <linearGradient id={`${uid}-waveC`} x1="0.2" y1="0" x2="0.9" y2="1">
              <stop offset="0%" stopColor="#DDD6FE" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.14" />
            </linearGradient>
            <linearGradient id={`${uid}-stroke`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6D5EF7" stopOpacity="0.15" />
              <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#EC4899" stopOpacity="0.2" />
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
                  transition: { duration: 32, repeat: Infinity, ease: "linear" as const },
                })}
          >
            {[0, WAVE_WIDTH].map((offset) => (
              <g key={offset} transform={`translate(${offset}, 0)`}>
                {CONTOUR_LINES.map((d, index) => (
                  <path
                    key={index}
                    d={d}
                    stroke={`url(#${uid}-stroke)`}
                    strokeWidth={0.85}
                    strokeLinecap="round"
                    fill="none"
                    opacity={0.2 + index * 0.08}
                    style={
                      reducedMotion
                        ? undefined
                        : {
                            strokeDasharray: 600,
                            animation: `contour-drift ${14 + index * 2}s ease-in-out infinite`,
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

      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#6D5EF7]/25 to-transparent" />

      <motion.div
        className="absolute left-[12%] top-[22%] h-px w-[35%] bg-gradient-to-r from-transparent via-[#8B5CF6]/30 to-transparent"
        animate={reducedMotion ? undefined : { opacity: [0.2, 0.55, 0.2], scaleX: [0.85, 1, 0.85] }}
        transition={
          reducedMotion
            ? undefined
            : { duration: 8, repeat: Infinity, ease: "easeInOut" as const }
        }
      />
      <motion.div
        className="absolute right-[8%] top-[14%] h-px w-[28%] bg-gradient-to-r from-transparent via-[#EC4899]/25 to-transparent"
        animate={reducedMotion ? undefined : { opacity: [0.15, 0.45, 0.15], scaleX: [0.9, 1.05, 0.9] }}
        transition={
          reducedMotion
            ? undefined
            : { duration: 10, repeat: Infinity, ease: "easeInOut" as const, delay: 1.5 }
        }
      />
    </div>
  );
}
