/** Unique icon + sparkline colors for overview metric cards */
export const METRIC_THEMES = {
  purple: { gradient: "from-[#6D5EF7] to-[#8B5CF6]", spark: "#6D5EF7" },
  blue: { gradient: "from-[#3B82F6] to-[#60A5FA]", spark: "#3B82F6" },
  cyan: { gradient: "from-[#06B6D4] to-[#22D3EE]", spark: "#06B6D4" },
  amber: { gradient: "from-[#EAB308] to-[#FACC15]", spark: "#EAB308" },
  orange: { gradient: "from-[#F59E0B] to-[#F97316]", spark: "#F59E0B" },
  green: { gradient: "from-[#22C55E] to-[#10B981]", spark: "#22C55E" },
  red: { gradient: "from-[#EF4444] to-[#F87171]", spark: "#EF4444" },
  indigo: { gradient: "from-[#6366F1] to-[#818CF8]", spark: "#6366F1" },
  pink: { gradient: "from-[#EC4899] to-[#F472B6]", spark: "#EC4899" },
} as const;

export type MetricThemeKey = keyof typeof METRIC_THEMES;
