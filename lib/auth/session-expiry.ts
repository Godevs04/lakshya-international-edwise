import { connectDB } from "@/lib/db/mongoose";
import { Settings } from "@/models/Settings";
import { getDefaultSettings } from "@/lib/config/app-defaults";

/** Remember-me extends the base session by this multiplier (e.g. 7 × 24h = 7 days). */
export const REMEMBER_ME_MULTIPLIER = 7;

export async function getSessionMaxAgeSeconds(rememberMe: boolean): Promise<number> {
  await connectDB();
  const settings = await Settings.findOne().select("sessionExpiryHours").lean();
  const hours = settings?.sessionExpiryHours ?? getDefaultSettings().sessionExpiryHours;
  const effectiveHours = rememberMe ? hours * REMEMBER_ME_MULTIPLIER : hours;
  return effectiveHours * 60 * 60;
}

export async function getSessionExpiryHours(): Promise<number> {
  await connectDB();
  const settings = await Settings.findOne().select("sessionExpiryHours").lean();
  return settings?.sessionExpiryHours ?? getDefaultSettings().sessionExpiryHours;
}
