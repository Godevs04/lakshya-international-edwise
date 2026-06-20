"use client";

import { motion } from "framer-motion";
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
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/cards/glass-card";

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

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: MetricIconName;
  trend?: string;
  trendUp?: boolean;
  index?: number;
  className?: string;
}

export function MetricCard({
  title,
  value,
  icon,
  trend,
  trendUp,
  index = 0,
  className,
}: MetricCardProps) {
  const Icon: LucideIcon = METRIC_ICONS[icon];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <GlassCard hover gradient className={cn("p-5", className)}>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold tracking-tight">{value}</p>
            {trend && (
              <p
                className={cn(
                  "text-xs font-medium",
                  trendUp ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                )}
              >
                {trend}
              </p>
            )}
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

interface MetricCardsGridProps {
  cards: Array<{
    title: string;
    value: string | number;
    icon: MetricIconName;
    trend?: string;
    trendUp?: boolean;
  }>;
}

export function MetricCardsGrid({ cards }: MetricCardsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
      {cards.map((card, i) => (
        <MetricCard key={card.title} {...card} index={i} />
      ))}
    </div>
  );
}
