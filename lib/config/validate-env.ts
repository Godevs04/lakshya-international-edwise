const PRODUCTION_REQUIRED = [
  "MONGODB_URI",
  "APP_ENCRYPTION_KEY",
] as const;

const PRODUCTION_AUTH_KEYS = ["AUTH_SECRET", "NEXTAUTH_SECRET"] as const;

function trim(value: string | undefined): string | undefined {
  return value?.trim().replace(/^"|"$/g, "");
}

function hasAuthSecret(): boolean {
  return PRODUCTION_AUTH_KEYS.some((key) => Boolean(trim(process.env[key])));
}

function hasAuthUrl(): boolean {
  return Boolean(trim(process.env.AUTH_URL) ?? trim(process.env.NEXTAUTH_URL));
}

export function validateProductionEnv(): void {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const missing: string[] = PRODUCTION_REQUIRED.filter((key) => !trim(process.env[key]));

  if (!hasAuthSecret()) {
    missing.push("AUTH_SECRET");
  }

  if (!hasAuthUrl()) {
    missing.push("AUTH_URL");
  }

  const encryptionKey = trim(process.env.APP_ENCRYPTION_KEY);
  if (encryptionKey && encryptionKey.length !== 64) {
    throw new Error("APP_ENCRYPTION_KEY must be a 64-character hex string in production");
  }

  if (missing.length > 0) {
    throw new Error(`Missing required production environment variables: ${missing.join(", ")}`);
  }
}

export function getProductionEnvStatus(): {
  valid: boolean;
  missing: string[];
} {
  const missing: string[] = [];

  for (const key of PRODUCTION_REQUIRED) {
    if (!trim(process.env[key])) {
      missing.push(key);
    }
  }

  if (!hasAuthSecret()) {
    missing.push("AUTH_SECRET");
  }

  if (!hasAuthUrl()) {
    missing.push("AUTH_URL");
  }

  return { valid: missing.length === 0, missing };
}
