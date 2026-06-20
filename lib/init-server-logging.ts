import { logger } from "@/lib/logger";
import { captureException } from "@/lib/error-tracking";

let initialized = false;

export function initServerLogging(): void {
  if (initialized || typeof window !== "undefined") {
    return;
  }

  initialized = true;

  process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled promise rejection", reason);
    void captureException(reason, { source: "unhandledRejection" });
  });

  process.on("uncaughtException", (error) => {
    logger.error("Uncaught exception", error);
    void captureException(error, { source: "uncaughtException" });
  });
}
