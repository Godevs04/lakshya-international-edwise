type LogLevel = "debug" | "info" | "warn" | "error";

async function reportError(message: string, meta?: unknown): Promise<void> {
  if (process.env.NODE_ENV !== "production" && !process.env.SENTRY_DSN) {
    return;
  }

  const { captureException } = await import("@/lib/error-tracking");
  const error = meta instanceof Error ? meta : new Error(message);
  await captureException(error, meta instanceof Error ? { message } : { message, meta });
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function getMinLevel(): LogLevel {
  if (process.env.NODE_ENV === "production") {
    return "warn";
  }
  return "debug";
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[getMinLevel()];
}

function formatMeta(meta: unknown): string {
  if (meta === undefined) {
    return "";
  }
  if (meta instanceof Error) {
    return meta.stack ?? meta.message;
  }
  if (typeof meta === "object") {
    try {
      return JSON.stringify(meta);
    } catch {
      return String(meta);
    }
  }
  return String(meta);
}

function write(level: LogLevel, message: string, meta?: unknown): void {
  if (!shouldLog(level)) {
    return;
  }

  const timestamp = new Date().toISOString();
  const metaText = formatMeta(meta);
  const output = metaText
    ? `[${timestamp}] [${level.toUpperCase()}] ${message} ${metaText}`
    : `[${timestamp}] [${level.toUpperCase()}] ${message}`;

  switch (level) {
    case "debug":
    case "info":
      // Centralized logger — only place allowed to use console directly.
      console.log(output);
      break;
    case "warn":
      console.warn(output);
      break;
    case "error":
      console.error(output);
      void reportError(message, meta);
      break;
  }
}

export const logger = {
  debug(message: string, meta?: unknown): void {
    write("debug", message, meta);
  },
  info(message: string, meta?: unknown): void {
    write("info", message, meta);
  },
  warn(message: string, meta?: unknown): void {
    write("warn", message, meta);
  },
  error(message: string, meta?: unknown): void {
    write("error", message, meta);
  },
};
