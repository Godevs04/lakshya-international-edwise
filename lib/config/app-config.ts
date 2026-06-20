import { connectDB } from "@/lib/db/mongoose";
import { Settings } from "@/models/Settings";
import { getDefaultSettings } from "@/lib/config/app-defaults";
import type { AppSettings } from "@/types";

export async function getAppConfig(): Promise<AppSettings> {
  const envDefaults = getDefaultSettings();

  try {
    await connectDB();
    let settings = await Settings.findOne().lean();
    if (!settings) {
      const created = await Settings.create(envDefaults);
      settings = created.toObject();
    }
    return {
      company: settings.company,
      theme: settings.theme,
      modules: settings.modules,
      sessionExpiryHours: settings.sessionExpiryHours,
    };
  } catch {
    return {
      company: envDefaults.company,
      theme: envDefaults.theme,
      modules: envDefaults.modules,
      sessionExpiryHours: envDefaults.sessionExpiryHours,
    };
  }
}

export async function getCompanyName(): Promise<string> {
  const config = await getAppConfig();
  return config.company.name;
}
