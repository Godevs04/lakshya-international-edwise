/** Unique icon + sparkline colors for overview metric cards — sky-blue brand family */
export const METRIC_THEMES = {
  purple: { gradient: "from-[#0B8FD8] to-[#0369A1]", spark: "#0B8FD8" },
  blue: { gradient: "from-[#0369A1] to-[#0284C7]", spark: "#0369A1" },
  cyan: { gradient: "from-[#06B6D4] to-[#22D3EE]", spark: "#06B6D4" },
  amber: { gradient: "from-[#0EA5E9] to-[#38BDF8]", spark: "#0EA5E9" },
  orange: { gradient: "from-[#0284C7] to-[#0B8FD8]", spark: "#0284C7" },
  green: { gradient: "from-[#10B981] to-[#059669]", spark: "#10B981" },
  red: { gradient: "from-[#EF4444] to-[#F87171]", spark: "#EF4444" },
  indigo: { gradient: "from-[#0B1E48] to-[#0369A1]", spark: "#0B1E48" },
  pink: { gradient: "from-[#38BDF8] to-[#7DD3FC]", spark: "#38BDF8" },
} as const;

export type MetricThemeKey = keyof typeof METRIC_THEMES;
