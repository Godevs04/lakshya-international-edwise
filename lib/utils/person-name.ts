const PLACEHOLDER_LAST_NAMES = new Set([".", "-", "—", "n/a", "na"]);

export function splitFullName(name: string): { firstName: string; lastName: string } {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { firstName: "Website", lastName: "Lead" };
  }
  if (parts.length === 1) {
    return { firstName: parts[0]!, lastName: "" };
  }
  return { firstName: parts[0]!, lastName: parts.slice(1).join(" ") };
}

export function isPlaceholderLastName(lastName?: string | null): boolean {
  const trimmed = lastName?.trim() ?? "";
  if (!trimmed) return true;
  return PLACEHOLDER_LAST_NAMES.has(trimmed.toLowerCase());
}

export function formatPersonName(
  firstName?: string | null,
  lastName?: string | null
): string {
  const first = firstName?.trim() ?? "";
  const last = lastName?.trim() ?? "";
  if (!first) return last;
  if (isPlaceholderLastName(last)) return first;
  return `${first} ${last}`.trim();
}

export function normalizeLastName(lastName?: string | null): string {
  const trimmed = lastName?.trim() ?? "";
  return isPlaceholderLastName(trimmed) ? "" : trimmed;
}
