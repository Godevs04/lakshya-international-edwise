/** Parse free-text loan amounts from marketing forms (e.g. "₹40 Lakh") into INR. */
export function parseWebsiteLoanAmount(raw?: string | null): number {
  if (!raw?.trim()) return 0;

  const normalized = raw.trim().toLowerCase().replace(/[₹,]/g, "").replace(/\s+/g, " ");

  const croreMatch = normalized.match(/([\d.]+)\s*(crore|cr)\b/);
  if (croreMatch) {
    const value = Number(croreMatch[1]);
    return Number.isFinite(value) && value > 0 ? Math.round(value * 10_000_000) : 0;
  }

  const lakhMatch = normalized.match(/([\d.]+)\s*(lakh|lac|l)\b/);
  if (lakhMatch) {
    const value = Number(lakhMatch[1]);
    return Number.isFinite(value) && value > 0 ? Math.round(value * 100_000) : 0;
  }

  const digitsOnly = normalized.replace(/[^\d.]/g, "");
  const numeric = Number(digitsOnly);
  if (Number.isFinite(numeric) && numeric > 0) {
    return Math.round(numeric);
  }

  return 0;
}
