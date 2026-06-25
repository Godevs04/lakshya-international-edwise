/** Premium CRM design tokens — single source of truth */

export const BRAND = {
  primary: "#6D5EF7",
  secondary: "#8B5CF6",
  accent: "#06B6D4",
  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",
  pink: "#EC4899",
  background: "#F8F9FF",
  sidebarFrom: "#1E0B4A",
  sidebarTo: "#5B21B6",
} as const;

export const KPI_GRADIENTS = [
  "from-[#6D5EF7] to-[#8B5CF6]",
  "from-[#3B82F6] to-[#06B6D4]",
  "from-[#22C55E] to-[#10B981]",
  "from-[#F59E0B] to-[#EF4444]",
  "from-[#EC4899] to-[#8B5CF6]",
  "from-[#06B6D4] to-[#3B82F6]",
  "from-[#6366F1] to-[#4F46E5]",
  "from-[#14B8A6] to-[#22C55E]",
  "from-[#F97316] to-[#F59E0B]",
] as const;

export const CHART_COLORS = [
  "#6D5EF7",
  "#8B5CF6",
  "#06B6D4",
  "#22C55E",
  "#F59E0B",
  "#EC4899",
  "#3B82F6",
  "#EF4444",
] as const;

export const HERO_GRADIENT =
  "linear-gradient(90deg, #6D5EF7, #8B5CF6, #06B6D4)";

export const CARD_GRADIENT =
  "linear-gradient(180deg, rgba(255,255,255,.96), rgba(255,255,255,.88))";

export const SIDEBAR_GRADIENT =
  "linear-gradient(180deg, #1E0B4A 0%, #3B1578 42%, #5B21B6 100%)";
