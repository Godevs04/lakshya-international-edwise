import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays } from "date-fns";

export function roundMoney(amount: number): number {
  if (!Number.isFinite(amount)) return 0;
  return Math.round(amount * 100) / 100;
}

export function formatMoney(amount: number, currency: "INR" | "USD" = "INR"): string {
  const normalized = roundMoney(amount);
  const hasFraction = Math.abs(normalized % 1) > 1e-9;
  const locale = currency === "USD" ? "en-US" : "en-IN";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(normalized);
}

export function formatCurrency(amount: number): string {
  return formatMoney(amount, "INR");
}

export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "0%";
  const normalized = Math.round(value * 100) / 100;
  const text = Number.isInteger(normalized)
    ? String(normalized)
    : normalized.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  return `${text}%`;
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), "dd MMM yyyy");
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), "dd MMM yyyy, hh:mm a");
}

export function toDatetimeLocalValue(date?: Date | string | null): string {
  if (!date) return "";
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

export function getGreetingForHour(hour: number): string {
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export function getGreeting(date: Date = new Date()): string {
  return getGreetingForHour(date.getHours());
}

export type DateRangePreset = "daily" | "weekly" | "monthly" | "yearly";

export function getDateRange(preset: DateRangePreset): { start: Date; end: Date } {
  const now = new Date();
  switch (preset) {
    case "daily":
      return { start: startOfDay(now), end: endOfDay(now) };
    case "weekly":
      return { start: startOfWeek(now), end: endOfWeek(now) };
    case "monthly":
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case "yearly":
      return { start: startOfYear(now), end: endOfYear(now) };
  }
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getLast30Days(): Date[] {
  return Array.from({ length: 30 }, (_, i) => subDays(new Date(), 29 - i));
}
