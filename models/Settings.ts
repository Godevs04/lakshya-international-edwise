import mongoose, { Schema, type Document, type Model } from "mongoose";
import type { AppModules, AppTheme, CompanySettings } from "@/types";
import { getDefaultSettings } from "@/lib/config/app-defaults";

export interface ISettings extends Document {
  company: CompanySettings;
  theme: AppTheme;
  modules: AppModules;
  sessionExpiryHours: number;
  smtpConfigured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const envDefaults = getDefaultSettings();

const SettingsSchema = new Schema<ISettings>(
  {
    company: {
      name: { type: String, default: envDefaults.company.name },
      logo: { type: String, default: envDefaults.company.logo },
      email: { type: String, default: envDefaults.company.email },
      phone: { type: String, default: envDefaults.company.phone },
      address: { type: String, default: envDefaults.company.address },
    },
    theme: {
      primary: { type: String, default: envDefaults.theme.primary },
      accent: { type: String, default: envDefaults.theme.accent },
      radius: { type: String, default: envDefaults.theme.radius },
      fontFamily: { type: String, default: envDefaults.theme.fontFamily },
      mode: { type: String, enum: ["light", "dark", "system"], default: envDefaults.theme.mode },
    },
    modules: {
      students: { type: Boolean, default: envDefaults.modules.students },
      partners: { type: Boolean, default: envDefaults.modules.partners },
      applications: { type: Boolean, default: envDefaults.modules.applications },
      reports: { type: Boolean, default: envDefaults.modules.reports },
      analytics: { type: Boolean, default: envDefaults.modules.analytics },
    },
    sessionExpiryHours: { type: Number, default: envDefaults.sessionExpiryHours },
    smtpConfigured: { type: Boolean, default: envDefaults.smtpConfigured },
  },
  { timestamps: true }
);

export const Settings: Model<ISettings> =
  mongoose.models.Settings ?? mongoose.model<ISettings>("Settings", SettingsSchema);

export { getDefaultSettings };
