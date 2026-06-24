import { findLenderSlugByName } from "@/lib/constants/lenders";
import type { ChartDataPoint } from "@/types";

export type AnalyticsFunnelLinkMode = "workflow" | "status";

export function analyticsFunnelHref(stageKey: string, mode: AnalyticsFunnelLinkMode): string {
  const param = mode === "workflow" ? "workflow" : "status";
  return `/dashboard/students?${param}=${encodeURIComponent(stageKey)}`;
}

export function analyticsStateHref(state: string): string {
  return `/dashboard/students?state=${encodeURIComponent(state)}`;
}

export function analyticsCourseHref(course: string): string {
  return `/dashboard/students?course=${encodeURIComponent(course)}`;
}

export function analyticsGenderHref(genderKey: string): string {
  return `/dashboard/students?gender=${encodeURIComponent(genderKey)}`;
}

export function analyticsLoanRangeHref(loanMin: number, loanMax?: number): string {
  const params = new URLSearchParams();
  params.set("loanMin", String(loanMin));
  if (loanMax != null && Number.isFinite(loanMax)) {
    params.set("loanMax", String(loanMax));
  }
  return `/dashboard/students?${params.toString()}`;
}

export function analyticsLenderHref(slugOrName: string): string {
  const slug = findLenderSlugByName(slugOrName) ?? slugOrName.trim().toLowerCase();
  return `/dashboard/students?lenderId=${encodeURIComponent(slug)}`;
}

export function analyticsChartPointHref(
  point: ChartDataPoint,
  kind: "workflow" | "status" | "state" | "course" | "gender" | "loan" | "lender"
): string | null {
  if (point.value <= 0) return null;

  switch (kind) {
    case "workflow":
      return point.key ? analyticsFunnelHref(point.key, "workflow") : null;
    case "status":
      return point.key ? analyticsFunnelHref(point.key, "status") : null;
    case "state":
      return analyticsStateHref(point.name);
    case "course":
      return analyticsCourseHref(point.name);
    case "gender":
      return point.key ? analyticsGenderHref(point.key) : null;
    case "loan":
      if (point.loanMin == null) return null;
      return analyticsLoanRangeHref(point.loanMin, point.loanMax);
    case "lender":
      return point.key ? analyticsLenderHref(point.key) : analyticsLenderHref(point.name);
    default:
      return null;
  }
}
