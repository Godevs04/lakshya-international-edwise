export const AUDIT_RESOURCE_TYPES = [
  "student",
  "partner",
  "application",
  "admission",
  "task",
  "lender",
  "settings",
  "user",
] as const;

export const AUDIT_PERIOD_OPTIONS = [
  { value: "all", label: "All time" },
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
] as const;

export type AuditPeriod = (typeof AUDIT_PERIOD_OPTIONS)[number]["value"];

export const AUDIT_ACTION_GROUPS = [
  { value: "all", label: "All actions" },
  { value: "student", label: "Student events" },
  { value: "students", label: "Bulk student events" },
  { value: "admission", label: "Admission events" },
  { value: "application", label: "Application events" },
  { value: "partner", label: "Partner events" },
  { value: "lender", label: "Lender events" },
  { value: "task", label: "Task events" },
  { value: "settings", label: "Settings events" },
  { value: "user", label: "User events" },
] as const;

export function formatAuditAction(action: string): string {
  return action
    .split(".")
    .map((part) => part.replace(/_/g, " "))
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" · ");
}

export function getAuditActionTone(action: string): string {
  if (action.includes("deleted") || action.includes("rejected")) {
    return "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20";
  }
  if (
    action.includes("imported") ||
    action.includes("created") ||
    action.includes("approved") ||
    action.includes("verified") ||
    action.includes("received") ||
    action.includes("settled")
  ) {
    return "bg-[#22C55E]/10 text-[#15803D] border-[#22C55E]/20";
  }
  if (
    action.includes("updated") ||
    action.includes("changed") ||
    action.includes("commission") ||
    action.includes("revenue") ||
    action.includes("exported")
  ) {
    return "bg-[#E8952E]/10 text-[#E8952E] border-[#E8952E]/20";
  }
  if (action.includes("settings")) {
    return "bg-[#F59E0B]/10 text-[#B45309] border-[#F59E0B]/20";
  }
  return "bg-muted text-muted-foreground border-border";
}

export function getAuditResourceHref(
  resourceType: string,
  resourceId?: string
): string | undefined {
  if (!resourceId) return undefined;
  switch (resourceType) {
    case "student":
      return `/dashboard/students/${resourceId}`;
    case "partner":
      return `/dashboard/partners/${resourceId}`;
    case "application":
      return `/dashboard/applications?highlight=${resourceId}`;
    case "admission":
      return `/dashboard/admissions/${resourceId}`;
    case "task":
      return `/dashboard/tasks`;
    case "lender":
      return `/dashboard/lenders`;
    case "user":
      return `/dashboard/settings`;
    case "settings":
      return `/dashboard/settings`;
    default:
      return undefined;
  }
}

export function formatAuditMetadata(metadata?: Record<string, unknown>): string {
  if (!metadata || Object.keys(metadata).length === 0) return "";
  return Object.entries(metadata)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(" · ");
}

export function parseUserAgent(userAgent?: string): string {
  if (!userAgent) return "Unknown browser";
  if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) return "Chrome";
  if (userAgent.includes("Firefox")) return "Firefox";
  if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) return "Safari";
  if (userAgent.includes("Edg")) return "Edge";
  return userAgent.length > 48 ? `${userAgent.slice(0, 48)}…` : userAgent;
}
