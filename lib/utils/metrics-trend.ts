export interface MetricTrendInfo {
  trend?: string;
  trendUp?: boolean;
}

export function formatMetricTrend(current: number, previous: number): MetricTrendInfo {
  if (current === 0 && previous === 0) {
    return {};
  }

  if (previous === 0) {
    return { trend: "↑ new", trendUp: true };
  }

  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) {
    return {};
  }

  return {
    trend: `${pct > 0 ? "↑" : "↓"} ${Math.abs(pct)}%`,
    trendUp: pct > 0,
  };
}
