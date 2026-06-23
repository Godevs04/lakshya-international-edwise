import { unstable_cache } from "next/cache";
import { connectDB } from "@/lib/db/mongoose";
import { Settings } from "@/models/Settings";
import { getDefaultSettings, resolveCompanySettings } from "@/lib/config/app-defaults";
import { isNextBuildPhase } from "@/lib/config/build-phase";
import { logger } from "@/lib/logger";
import type { AppSettings } from "@/types";

export const APP_CONFIG_CACHE_TAG = "app-config";

async function loadAppConfigFromDatabase(): Promise<AppSettings> {
  const envDefaults = getDefaultSettings();

  if (isNextBuildPhase()) {
    return {
      company: envDefaults.company,
      theme: envDefaults.theme,
      modules: envDefaults.modules,
      sessionExpiryHours: envDefaults.sessionExpiryHours,
    };
  }

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
      company: resolveCompanySettings(settings.company),
      theme: {
        ...envDefaults.theme,
        ...settings.theme,
        primary: settings.theme?.primary?.trim() || envDefaults.theme.primary,
        accent: settings.theme?.accent?.trim() || envDefaults.theme.accent,
        radius: settings.theme?.radius?.trim() || envDefaults.theme.radius,
      },
      modules: allModulesDisabled ? envDefaults.modules : { ...envDefaults.modules, ...modules },
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

const getCachedAppConfig = unstable_cache(
  loadAppConfigFromDatabase,
  ["app-config"],
  { revalidate: 120, tags: [APP_CONFIG_CACHE_TAG] }
);

export async function getAppConfig(): Promise<AppSettings> {
  return getCachedAppConfig();
}

export async function getCompanyName(): Promise<string> {
  const config = await getAppConfig();
  return config.company.name;
}
