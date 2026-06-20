"use client";

import { Fragment } from "react";
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
import type { ChartDataPoint } from "@/types";

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--primary))",
  "#6366f1",
  "#8b5cf6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
];

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

function ChartCard({ title, children, className }: ChartCardProps) {
  return (
    <GlassCard className={className}>
      <div className="p-5">
        <h3 className="mb-4 text-sm font-semibold">{title}</h3>
        {children}
      </div>
    </GlassCard>
  );
}

export function LoanStatusPieChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <ChartCard title="Loan Status">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function MonthlyStudentsAreaChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <ChartCard title="Monthly Students">
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="studentGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="name" className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#6366f1"
            fill="url(#studentGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function LoanAmountBarChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <ChartCard title="Loan Amount">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="name" className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip />
          <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function TopPartnersBarChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <ChartCard title="Top Partners">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis type="number" className="text-xs" />
          <YAxis dataKey="name" type="category" width={100} className="text-xs" />
          <Tooltip />
          <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function ConversionFunnelChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <ChartCard title="Conversion Funnel">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="name" className="text-xs" angle={-45} textAnchor="end" height={80} />
          <YAxis className="text-xs" />
          <Tooltip />
          <Bar dataKey="value" fill="#06b6d4" radius={[4, 4, 0, 0]} />
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
    <ChartCard title="Trend Analysis">
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="name" className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="students" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} />
          <Area type="monotone" dataKey="loans" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
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
  return (
    <ChartCard title={title}>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" label>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function RevenueBarChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <ChartCard title="Monthly Revenue">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="name" className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip />
          <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
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
    <ChartCard title="Activity Heat Map">
      <div className="overflow-x-auto">
        <div className="inline-grid gap-1" style={{ gridTemplateColumns: `auto repeat(7, 1fr)` }}>
          <div />
          {days.map((d) => (
            <div key={d} className="text-center text-xs text-muted-foreground">
              {d}
            </div>
          ))}
          {months.slice(0, 6).map((month, mi) => (
            <Fragment key={month}>
              <div className="text-xs text-muted-foreground">{month}</div>
              {days.map((day) => {
                const value = getValue(mi + 1, day);
                const opacity = value / maxValue;
                return (
                  <div
                    key={`${month}-${day}`}
                    className="h-6 w-6 rounded-sm"
                    style={{ backgroundColor: `rgba(99, 102, 241, ${Math.max(opacity, 0.05)})` }}
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
