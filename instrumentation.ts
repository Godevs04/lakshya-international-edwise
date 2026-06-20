export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { validateProductionEnv } = await import("@/lib/config/validate-env");
    validateProductionEnv();

    const { initServerLogging } = await import("@/lib/init-server-logging");
    initServerLogging();

    const { initErrorTracking } = await import("@/lib/error-tracking");
    await initErrorTracking();
  }
}
