import { connectDB } from "@/lib/db/mongoose";
import { Settings } from "@/models/Settings";
import { getDefaultSettings } from "@/lib/config/app-defaults";
import { logger } from "@/lib/logger";
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
    const modules = settings.modules ?? envDefaults.modules;
    const allModulesDisabled = Object.values(modules).every((enabled) => !enabled);

    return {
      company: {
        ...envDefaults.company,
        ...settings.company,
        name: settings.company?.name?.trim() || envDefaults.company.name,
      },
      theme: {
        ...envDefaults.theme,
        ...settings.theme,
        primary: settings.theme?.primary?.trim() || envDefaults.theme.primary,
        accent: settings.theme?.accent?.trim() || envDefaults.theme.accent,
        radius: settings.theme?.radius?.trim() || envDefaults.theme.radius,
      },
      modules: allModulesDisabled ? envDefaults.modules : modules,
      sessionExpiryHours: settings.sessionExpiryHours ?? envDefaults.sessionExpiryHours,
    };
  } catch (error) {
    logger.error("Failed to load app config from database", error);
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
