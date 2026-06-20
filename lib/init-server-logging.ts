import { logger } from "@/lib/logger";

let initialized = false;

export function initServerLogging(): void {
  if (initialized || typeof window !== "undefined") {
    return;
  }

  initialized = true;

  process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled promise rejection", reason);
  });

  process.on("uncaughtException", (error) => {
    logger.error("Uncaught exception", error);
  });
}
