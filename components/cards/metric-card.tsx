"use client";

import Link from "next/link";
import {
  Users,
  UserPlus,
  Handshake,
  Clock,
  CheckCircle,
  Banknote,
  XCircle,
  IndianRupee,
  Wallet,
  TrendingUp,
  TrendingDown,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/cards/glass-card";
import { KPI_GRADIENTS } from "@/lib/design/tokens";
import { METRIC_THEMES, type MetricThemeKey } from "@/lib/design/metric-themes";

export type { MetricThemeKey };

export const METRIC_ICONS = {
  users: Users,
  "user-plus": UserPlus,
  handshake: Handshake,
  clock: Clock,
  "check-circle": CheckCircle,
  banknote: Banknote,
  "x-circle": XCircle,
  "indian-rupee": IndianRupee,
  wallet: Wallet,
} as const;

export type MetricIconName = keyof typeof METRIC_ICONS;

function sparklinePoints(seed: number): number[] {
  return Array.from({ length: 12 }, (_, i) => {
    const hash = ((seed * 2654435761) ^ (i * 2246822519)) >>> 0;
    return 8 + (hash % 28);
  });
}

function buildSparklinePaths(seed: number): { area: string; line: string } {
  const points = sparklinePoints(seed);
  const max = Math.max(...points);
  const line = points
    .map((p, i) => {
      const x = +((i / (points.length - 1)) * 100).toFixed(2);
      const y = +(40 - (p / max) * 35).toFixed(2);
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

  return { area: `${line} L100,40 L0,40 Z`, line };
}

function Sparkline({ seed, color }: { seed: number; color: string }) {
  const { area, line } = buildSparklinePaths(seed);

  return (
    <svg viewBox="0 0 100 40" className="h-10 w-full" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={`spark-${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#spark-${seed})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: MetricIconName;
  trend?: string;
  trendUp?: boolean;
  index?: number;
  theme?: MetricThemeKey;
  className?: string;
  href?: string;
}

export function MetricCard({
  title,
  value,
  icon,
  trend,
  trendUp = true,
  index = 0,
  theme,
  className,
  href,
}: MetricCardProps) {
  const Icon: LucideIcon = METRIC_ICONS[icon];
  const palette = theme ? METRIC_THEMES[theme] : null;
  const gradient = palette?.gradient ?? KPI_GRADIENTS[index % KPI_GRADIENTS.length];
  const formatted =
    typeof value === "number" ? value.toLocaleString("en-IN") : String(value);
  const sparkColor = palette?.spark ?? (
    gradient.includes("#6D5EF7") ? "#6D5EF7" :
    gradient.includes("#3B82F6") ? "#3B82F6" :
    gradient.includes("#22C55E") ? "#22C55E" :
    gradient.includes("#F59E0B") ? "#F59E0B" :
    gradient.includes("#EC4899") ? "#EC4899" : "#06B6D4"
  );

  const card = (
    <GlassCard hover className={cn("p-5", href && "cursor-pointer", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} shadow-lg`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-2xl font-bold tracking-tight sm:text-3xl">{formatted}</span>
            <p className="mt-0.5 text-sm font-medium text-muted-foreground">{title}</p>
          </div>
          {trend && (
            <div className="flex items-center gap-1.5">
              {trendUp ? (
                <TrendingUp className="h-3.5 w-3.5 text-[#22C55E]" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-[#EF4444]" />
              )}
              <span className={cn("text-xs font-semibold", trendUp ? "text-[#22C55E]" : "text-[#EF4444]")}>
                {trend}
              </span>
              <span className="text-xs text-muted-foreground">This month</span>
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 -mx-1">
        <Sparkline seed={index * 7 + (typeof value === "number" ? value : 0)} color={sparkColor} />
      </div>
    </GlassCard>
  );

  if (href) {
    return (
      <Link href={href} className="block rounded-[20px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6D5EF7]">
        {card}
      </Link>
    );
  }

  return card;
}

interface MetricCardsGridProps {
  cards: Array<{
    title: string;
    value: string | number;
    icon: MetricIconName;
    trend?: string;
    trendUp?: boolean;
    theme?: MetricThemeKey;
    href?: string;
  }>;
}

export function MetricCardsGrid({ cards }: MetricCardsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card, i) => (
        <MetricCard key={card.title} {...card} index={i} />
      ))}
    </div>
  );
}
