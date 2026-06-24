"use client";

import { Fragment } from "react";
import { useRouter } from "next/navigation";
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
import { GlassCard } from "@/components/cards/glass-card";
import { CHART_COLORS } from "@/lib/design/tokens";
import { loanStatusChartHref } from "@/lib/utils/loan-status-chart";
import type { ChartDataPoint } from "@/types";

const tooltipStyle = {
  backgroundColor: "rgba(255,255,255,0.95)",
  border: "1px solid rgba(109,94,247,0.15)",
  borderRadius: "12px",
  boxShadow: "0 8px 32px rgba(109,94,247,0.15)",
  fontSize: "12px",
  padding: "8px 12px",
};

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

function ChartCard({ title, subtitle, children, className }: ChartCardProps) {
  return (
    <GlassCard hover className={className}>
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-base font-bold">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {children}
      </div>
    </GlassCard>
  );
}

export function LoanStatusPieChart({ data }: { data: ChartDataPoint[] }) {
  const router = useRouter();

  return (
    <ChartCard title="Loan Status" subtitle="Click a segment to view matching students">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={110}
            paddingAngle={3}
            dataKey="value"
            nameKey="name"
            strokeWidth={0}
            className="cursor-pointer"
            onClick={(_, index) => {
              const segment = data[index];
              if (segment?.name) {
                router.push(loanStatusChartHref(segment.name));
              }
            }}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
          <Legend
            wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function MonthlyStudentsAreaChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <ChartCard title="Monthly Students" subtitle="Enrollment trend over time">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="studentGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6D5EF7" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#6D5EF7" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(109,94,247,0.08)" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#6D5EF7"
            fill="url(#studentGradient)"
            strokeWidth={2.5}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function LoanAmountBarChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <ChartCard title="Loan Amount" subtitle="Monthly disbursement volume">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#6D5EF7" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(109,94,247,0.08)" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="value" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function TopPartnersBarChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <ChartCard title="Top Partners" subtitle="By student referrals">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <defs>
            <linearGradient id="partnerGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(109,94,247,0.08)" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
          <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="value" fill="url(#partnerGradient)" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function ConversionFunnelChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <ChartCard title="Conversion Funnel" subtitle="Pipeline stage breakdown">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(109,94,247,0.08)" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" height={70} />
          <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="value" fill="#06B6D4" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function TrendLineChart({
  data,
}: {
  data: Array<{ name: string; students: number; loans: number }>;
}) {
  return (
    <ChartCard title="Trend Analysis" subtitle="Students vs loan applications">
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="trendStudents" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6D5EF7" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#6D5EF7" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="trendLoans" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22C55E" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(109,94,247,0.08)" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />
          <Area type="monotone" dataKey="students" stroke="#6D5EF7" fill="url(#trendStudents)" strokeWidth={2} />
          <Area type="monotone" dataKey="loans" stroke="#22C55E" fill="url(#trendLoans)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function DemographicsPieChart({
  data,
  title,
}: {
  data: ChartDataPoint[];
  title: string;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const enriched = data.map((d) => ({ ...d, total }));

  return (
    <ChartCard title={title} subtitle="Hover segments for details">
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
            isAnimationActive
            animationDuration={800}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const item = payload[0];
              const value = Number(item.value ?? 0);
              const pct = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
              return (
                <div style={tooltipStyle}>
                  <p className="font-semibold">{item.name}</p>
                  <p className="mt-0.5 text-muted-foreground">
                    {value} ({pct}%)
                  </p>
                </div>
              );
            }}
          />
          <Legend
            verticalAlign="bottom"
            wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }}
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
    </ChartCard>
  );
}

export function RevenueBarChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <ChartCard title="Monthly Revenue" subtitle="Commission & fee collection">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(109,94,247,0.08)" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="value" fill="#22C55E" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function HeatMapGrid({
  data,
}: {
  data: Array<{ month: number; day: string; value: number }>;
}) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  const getValue = (month: number, day: string) => {
    const item = data.find((d) => d.month === month && d.day === day);
    return item?.value ?? 0;
  };

  return (
    <ChartCard title="Activity Heat Map" subtitle="Daily engagement intensity">
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
              <div className="text-xs font-medium text-muted-foreground">{month}</div>
              {days.map((day) => {
                const value = getValue(mi + 1, day);
                const opacity = value / maxValue;
                return (
                  <div
                    key={`${month}-${day}`}
                    className="h-7 w-7 rounded-lg transition-transform hover:scale-110"
                    style={{ backgroundColor: `rgba(109, 94, 247, ${Math.max(opacity, 0.06)})` }}
                    title={`${value} activities`}
                  />
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </ChartCard>
  );
}
