export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { validateProductionEnv } = await import("@/lib/config/validate-env");
    validateProductionEnv();

    const { warnIfSmtpMissing } = await import("@/lib/config/smtp-config");
    warnIfSmtpMissing();

    const { initServerLogging } = await import("@/lib/init-server-logging");
    initServerLogging();

    const { initErrorTracking } = await import("@/lib/error-tracking");
    await initErrorTracking();
  }
}
