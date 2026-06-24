"use client";

import { Fragment, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Users,
  CheckCircle,
  TrendingUp,
  IndianRupee,
  Handshake,
  XCircle,
  ChevronRight,
} from "lucide-react";
import { GlassCard } from "@/components/cards/glass-card";
import { CHART_COLORS, KPI_GRADIENTS } from "@/lib/design/tokens";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import {
  analyticsChartPointHref,
  analyticsFunnelHref,
  type AnalyticsFunnelLinkMode,
} from "@/lib/utils/analytics-chart-links";
import type { ChartDataPoint } from "@/types";

const tooltipStyle = {
  backgroundColor: "rgba(255,255,255,0.97)",
  border: "1px solid rgba(109,94,247,0.15)",
  borderRadius: "12px",
  boxShadow: "0 8px 32px rgba(109,94,247,0.15)",
  fontSize: "12px",
  padding: "10px 14px",
};

const CHART_ANIMATION = { isAnimationActive: true, animationDuration: 900, animationEasing: "ease-out" as const };

type DrillDownKind = "workflow" | "status" | "state" | "course" | "gender" | "loan" | "lender";

function drillSubtitle(subtitle?: string): string {
  const hint = "Click any segment to view matching students";
  return subtitle ? `${subtitle} · ${hint}` : hint;
}

function formatAxisCurrency(value: number): string {
  if (value >= 10_000_000) return `₹${(value / 10_000_000).toFixed(1)}Cr`;
  if (value >= 100_000) return `₹${(value / 100_000).toFixed(1)}L`;
  if (value >= 1_000) return `₹${(value / 1_000).toFixed(0)}K`;
  return `₹${value}`;
}

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

function AnimatedChartCard({ title, subtitle, children, className, delay = 0 }: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      <GlassCard hover className="h-full">
        <div className="p-6">
          <div className="mb-5">
            <h3 className="text-base font-bold tracking-tight">{title}</h3>
            {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {children}
        </div>
      </GlassCard>
    </motion.div>
  );
}

type ChartTooltipPayload = {
  name?: string;
  value?: number;
  dataKey?: string;
  payload?: Record<string, unknown>;
};

type ChartTooltipProps = {
  active?: boolean;
  payload?: ChartTooltipPayload[];
  label?: string;
};

function CountTooltip({
  active,
  payload,
  unit = "students",
}: ChartTooltipProps & { unit?: string }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const value = Number(item.value ?? 0);
  const total = payload[0]?.payload?.total as number | undefined;
  const pct = total && total > 0 ? ((value / total) * 100).toFixed(1) : null;

  return (
    <div style={tooltipStyle}>
      <p className="font-semibold text-foreground">{item.name}</p>
      <p className="mt-0.5 text-muted-foreground">
        {value.toLocaleString("en-IN")} {unit}
        {pct ? ` · ${pct}%` : ""}
      </p>
    </div>
  );
}

function CurrencyTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const value = Number(payload[0].value ?? 0);
  return (
    <div style={tooltipStyle}>
      <p className="font-semibold text-foreground">{label ?? payload[0].name}</p>
      <p className="mt-0.5 text-muted-foreground">{formatCurrency(value)}</p>
    </div>
  );
}

const KPI_ICONS = [Users, CheckCircle, TrendingUp, IndianRupee, Handshake, XCircle] as const;

export function AnalyticsKpiCards({
  summary,
}: {
  summary: {
    totalStudents: number;
    disbursed: number;
    rejected: number;
    conversionRate: number;
    totalDisbursedAmount: number;
    activePartners: number;
  };
}) {
  const cards = [
    { title: "Total Students", value: summary.totalStudents.toLocaleString("en-IN"), icon: 0, href: "/dashboard/students" },
    { title: "Disbursed", value: summary.disbursed.toLocaleString("en-IN"), icon: 1, href: "/dashboard/students?workflow=disbursed" },
    { title: "Conversion Rate", value: formatPercent(summary.conversionRate * 100), icon: 2, href: "/dashboard/students?workflow=disbursed" },
    { title: "Disbursed Volume", value: formatCurrency(summary.totalDisbursedAmount), icon: 3, href: "/dashboard/students?workflow=disbursed" },
    { title: "Active Partners", value: summary.activePartners.toLocaleString("en-IN"), icon: 4, href: "/dashboard/partners" },
    { title: "Rejected", value: summary.rejected.toLocaleString("en-IN"), icon: 5, href: "/dashboard/students?workflow=rejected" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {cards.map((card, index) => {
        const Icon = KPI_ICONS[card.icon];
        const gradient = KPI_GRADIENTS[index % KPI_GRADIENTS.length];
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link href={card.href} className="group block">
              <GlassCard className="p-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg group-hover:shadow-[#6D5EF7]/10">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{card.title}</p>
                    <p className="mt-1 text-xl font-bold tracking-tight">{card.value}</p>
                  </div>
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </GlassCard>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}

export function VisualFunnelChart({
  data,
  title,
  subtitle,
  delay = 0,
  linkMode,
}: {
  data: ChartDataPoint[];
  title: string;
  subtitle?: string;
  delay?: number;
  linkMode?: AnalyticsFunnelLinkMode;
}) {
  const router = useRouter();
  const { stages, total, max } = useMemo(() => {
    const filtered = data.filter((d) => d.value > 0);
    const sum = data.reduce((acc, d) => acc + d.value, 0);
    const peak = Math.max(...data.map((d) => d.value), 1);
    return { stages: filtered.length > 0 ? filtered : data, total: sum, max: peak };
  }, [data]);

  const handleStageClick = useCallback(
    (stage: ChartDataPoint) => {
      if (!linkMode || !stage.key || stage.value <= 0) return;
      router.push(analyticsFunnelHref(stage.key, linkMode));
    },
    [linkMode, router]
  );

  const funnelColors = ["#6D5EF7", "#8B5CF6", "#3B82F6", "#06B6D4", "#22C55E", "#10B981", "#F59E0B", "#EF4444"];
  const isClickable = Boolean(linkMode);

  return (
    <AnimatedChartCard
      title={title}
      subtitle={isClickable ? drillSubtitle(subtitle) : subtitle}
      delay={delay}
    >
      <div className="space-y-2.5">
        {stages.map((stage, index) => {
          const widthPct = Math.max((stage.value / max) * 100, 22);
          const sharePct = total > 0 ? (stage.value / total) * 100 : 0;
          const prev = index > 0 ? stages[index - 1].value : null;
          const stepConv = prev && prev > 0 ? (stage.value / prev) * 100 : null;
          const canClick = isClickable && Boolean(stage.key) && stage.value > 0;

          return (
            <motion.div
              key={stage.name}
              initial={{ opacity: 0, scaleX: 0.6 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.6, delay: delay + index * 0.07, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto origin-center"
              style={{ width: `${widthPct}%` }}
            >
              <button
                type="button"
                disabled={!canClick}
                onClick={() => handleStageClick(stage)}
                className={`relative w-full overflow-hidden rounded-xl px-4 py-3 text-left text-white shadow-md transition-all ${
                  canClick
                    ? "cursor-pointer hover:scale-[1.02] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                    : "cursor-default"
                }`}
                style={{
                  background: `linear-gradient(135deg, ${funnelColors[index % funnelColors.length]}, ${funnelColors[(index + 1) % funnelColors.length]})`,
                }}
              >
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-semibold leading-tight">{stage.name}</span>
                  <span className="flex shrink-0 items-center gap-1">
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold">
                      {stage.value.toLocaleString("en-IN")}
                    </span>
                    {canClick && <ChevronRight className="h-3.5 w-3.5 opacity-80" />}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-white/85">
                  <span>{sharePct.toFixed(1)}% of pipeline</span>
                  {stepConv !== null && index > 0 && (
                    <span>{stepConv.toFixed(0)}% from previous</span>
                  )}
                </div>
              </button>
            </motion.div>
          );
        })}
        {total === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No pipeline data yet</p>
        )}
      </div>
      {total > 0 && (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          {total.toLocaleString("en-IN")} total students across all stages
        </p>
      )}
    </AnimatedChartCard>
  );
}

export function DemographicsDonutChart({
  data,
  title,
  subtitle,
  unit = "students",
  delay = 0,
  drillDownKind,
}: {
  data: ChartDataPoint[];
  title: string;
  subtitle?: string;
  unit?: string;
  delay?: number;
  drillDownKind?: DrillDownKind;
}) {
  const router = useRouter();
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const enriched = data.map((d) => ({ ...d, total }));

  const handleSliceClick = useCallback(
    (point: ChartDataPoint) => {
      if (!drillDownKind) return;
      const href = analyticsChartPointHref(point, drillDownKind);
      if (href) router.push(href);
    },
    [drillDownKind, router]
  );

  return (
    <AnimatedChartCard
      title={title}
      subtitle={drillDownKind ? drillSubtitle(subtitle) : subtitle}
      delay={delay}
    >
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={enriched}
            cx="50%"
            cy="46%"
            innerRadius={58}
            outerRadius={88}
            paddingAngle={3}
            dataKey="value"
            nameKey="name"
            strokeWidth={0}
            className={drillDownKind ? "cursor-pointer" : undefined}
            onClick={(_, index) => handleSliceClick(data[index])}
            {...CHART_ANIMATION}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CountTooltip unit={unit} />} />
          <Legend
            verticalAlign="bottom"
            wrapperStyle={{ fontSize: "11px", paddingTop: "12px", lineHeight: "1.6" }}
            iconType="circle"
            formatter={(value: string) => {
              const item = data.find((d) => d.name === value);
              const count = item?.value ?? 0;
              const pct = total > 0 ? ((count / total) * 100).toFixed(0) : "0";
              return `${value} — ${count} (${pct}%)`;
            }}
          />
          <text x="50%" y="44%" textAnchor="middle" dominantBaseline="middle">
            <tspan x="50%" className="fill-foreground text-2xl font-bold">
              {total}
            </tspan>
            <tspan x="50%" dy="1.4em" className="fill-muted-foreground text-[11px]">
              Total
            </tspan>
          </text>
        </PieChart>
      </ResponsiveContainer>
    </AnimatedChartCard>
  );
}

export function AnalyticsTrendChart({
  data,
  delay = 0,
}: {
  data: Array<{ name: string; students: number; loans: number }>;
  delay?: number;
}) {
  return (
    <AnimatedChartCard
      title="Enrollment vs Sanction Trend"
      subtitle="New students enrolled and total sanctioned loan value per month"
      delay={delay}
    >
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="trendStudents" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6D5EF7" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#6D5EF7" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="trendLoans" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22C55E" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(109,94,247,0.08)" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 11, fill: "#64748B" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 11, fill: "#64748B" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={formatAxisCurrency}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div style={tooltipStyle}>
                  <p className="font-semibold">{label}</p>
                  {payload.map((entry, index) => (
                    <p key={String(entry.dataKey ?? index)} className="mt-1 text-muted-foreground">
                      {entry.name}:{" "}
                      {entry.dataKey === "loans"
                        ? formatCurrency(Number(entry.value))
                        : Number(entry.value).toLocaleString("en-IN")}
                    </p>
                  ))}
                </div>
              );
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="students"
            name="Students"
            stroke="#6D5EF7"
            fill="url(#trendStudents)"
            strokeWidth={2.5}
            {...CHART_ANIMATION}
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="loans"
            name="Sanctioned (₹)"
            stroke="#22C55E"
            fill="url(#trendLoans)"
            strokeWidth={2.5}
            {...CHART_ANIMATION}
          />
        </AreaChart>
      </ResponsiveContainer>
    </AnimatedChartCard>
  );
}

export function AnalyticsRevenueChart({ data, delay = 0 }: { data: ChartDataPoint[]; delay?: number }) {
  return (
    <AnimatedChartCard
      title="Monthly Disbursement"
      subtitle="Total loan amount disbursed each month (₹)"
      delay={delay}
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22C55E" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(109,94,247,0.08)" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 11, fill: "#64748B" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={formatAxisCurrency}
          />
          <Tooltip content={<CurrencyTooltip />} />
          <Bar dataKey="value" name="Disbursed" fill="url(#revenueGradient)" radius={[8, 8, 0, 0]} {...CHART_ANIMATION} />
        </BarChart>
      </ResponsiveContainer>
    </AnimatedChartCard>
  );
}

export function AnalyticsPartnersChart({ data, delay = 0 }: { data: ChartDataPoint[]; delay?: number }) {
  return (
    <AnimatedChartCard
      title="Top Partners"
      subtitle="Ranked by total disbursement volume (₹)"
      delay={delay}
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ left: 8 }}>
          <defs>
            <linearGradient id="partnerGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(109,94,247,0.08)" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "#64748B" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={formatAxisCurrency}
          />
          <YAxis
            dataKey="name"
            type="category"
            width={108}
            tick={{ fontSize: 11, fill: "#64748B" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CurrencyTooltip />} />
          <Bar dataKey="value" name="Disbursement" fill="url(#partnerGradient)" radius={[0, 8, 8, 0]} {...CHART_ANIMATION} />
        </BarChart>
      </ResponsiveContainer>
    </AnimatedChartCard>
  );
}

export function CourseBarChart({
  data,
  delay = 0,
  drillDownKind = "course",
}: {
  data: ChartDataPoint[];
  delay?: number;
  drillDownKind?: DrillDownKind;
}) {
  const router = useRouter();
  const enriched = data.map((d) => ({
    ...d,
    total: data.reduce((s, x) => s + x.value, 0),
  }));

  return (
    <AnimatedChartCard
      title="Top Courses"
      subtitle={drillSubtitle("Students by course or program")}
      delay={delay}
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={enriched} layout="vertical" margin={{ left: 8 }}>
          <defs>
            <linearGradient id="courseGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(109,94,247,0.08)" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} allowDecimals={false} />
          <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
          <Tooltip content={<CountTooltip unit="students" />} />
          <Bar
            dataKey="value"
            name="Students"
            fill="url(#courseGradient)"
            radius={[0, 8, 8, 0]}
            className="cursor-pointer"
            onClick={(bar) => {
              const href = analyticsChartPointHref(bar as ChartDataPoint, drillDownKind);
              if (href) router.push(href);
            }}
            {...CHART_ANIMATION}
          />
        </BarChart>
      </ResponsiveContainer>
    </AnimatedChartCard>
  );
}

export function LenderBarChart({ data, delay = 0 }: { data: ChartDataPoint[]; delay?: number }) {
  const router = useRouter();

  return (
    <AnimatedChartCard
      title="Lender Mix"
      subtitle={drillSubtitle("Applications grouped by selected lender")}
      delay={delay}
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <defs>
            <linearGradient id="lenderGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#6D5EF7" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(109,94,247,0.08)" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" height={56} />
          <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip content={<CountTooltip unit="applications" />} />
          <Bar
            dataKey="value"
            name="Applications"
            fill="url(#lenderGradient)"
            radius={[8, 8, 0, 0]}
            className="cursor-pointer"
            onClick={(bar) => {
              const href = analyticsChartPointHref(bar as ChartDataPoint, "lender");
              if (href) router.push(href);
            }}
            {...CHART_ANIMATION}
          />
        </BarChart>
      </ResponsiveContainer>
    </AnimatedChartCard>
  );
}

export function LoanRangeChart({ data, delay = 0 }: { data: ChartDataPoint[]; delay?: number }) {
  return (
    <DemographicsDonutChart
      data={data}
      title="Loan Amount Range"
      subtitle="Requested loan size distribution"
      unit="applications"
      delay={delay}
      drillDownKind="loan"
    />
  );
}

export function AnalyticsHeatMap({
  data,
  delay = 0,
}: {
  data: Array<{ month: number; day: string; value: number }>;
  delay?: number;
}) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  const getValue = (month: number, day: string) => {
    const item = data.find((d) => d.month === month && d.day === day);
    return item?.value ?? 0;
  };

  return (
    <AnimatedChartCard
      title="Student Activity Heat Map"
      subtitle="New student registrations by day — darker cells mean more sign-ups"
      delay={delay}
      className="lg:col-span-2"
    >
      <div className="overflow-x-auto">
        <div className="inline-grid gap-1.5" style={{ gridTemplateColumns: `auto repeat(7, 1fr)` }}>
          <div />
          {days.map((d) => (
            <div key={d} className="text-center text-[10px] font-medium text-muted-foreground">
              {d}
            </div>
          ))}
          {months.slice(0, 6).map((month, mi) => (
            <Fragment key={month}>
              <div className="pr-2 text-xs font-medium text-muted-foreground">{month}</div>
              {days.map((day) => {
                const value = getValue(mi + 1, day);
                const intensity = value / maxValue;
                return (
                  <motion.div
                    key={`${month}-${day}`}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.35, delay: delay + (mi * 7 + days.indexOf(day)) * 0.008 }}
                    className="group relative flex h-8 w-8 items-center justify-center rounded-lg transition-transform hover:scale-110"
                    style={{
                      backgroundColor:
                        value > 0
                          ? `rgba(109, 94, 247, ${Math.max(0.2, intensity)})`
                          : "rgba(109, 94, 247, 0.06)",
                    }}
                    title={`${month} ${day}: ${value} student${value === 1 ? "" : "s"}`}
                  >
                    {value > 0 && (
                      <span className="text-[9px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                        {value}
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end gap-2 text-[10px] text-muted-foreground">
        <span>Low</span>
        <div className="flex gap-1">
          {[0.15, 0.35, 0.55, 0.75, 1].map((opacity) => (
            <div
              key={opacity}
              className="h-3 w-3 rounded"
              style={{ backgroundColor: `rgba(109, 94, 247, ${opacity})` }}
            />
          ))}
        </div>
        <span>High</span>
      </div>
    </AnimatedChartCard>
  );
}
