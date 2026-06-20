import { redirect } from "next/navigation";
import { getAppConfig } from "@/lib/config/app-config";
import type { AppModules } from "@/types";

export type AppModuleKey = keyof AppModules;

export async function requireModuleEnabled(module: AppModuleKey): Promise<void> {
  const config = await getAppConfig();
  if (config.modules[module] === false) {
    redirect("/dashboard/overview");
  }
}
