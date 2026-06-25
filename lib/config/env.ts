import { z } from "zod";

const envSchema = z.object({
  MONGODB_URI: z.string().min(1).optional(),
  AUTH_SECRET: z.string().min(32).optional(),
  NEXTAUTH_SECRET: z.string().min(32).optional(),
  AUTH_URL: z.string().url().optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().email().optional().or(z.literal("")),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  APP_ENCRYPTION_KEY: z.string().length(64).optional(),
  SEED_ADMIN_EMAIL: z.string().email().optional(),
  SEED_ADMIN_PASSWORD: z.string().min(8).optional(),
  SEED_ADMIN_NAME: z.string().optional(),
  APP_COMPANY_NAME: z.string().optional(),
  APP_COMPANY_EMAIL: z.string().email().optional().or(z.literal("")),
  APP_COMPANY_PHONE: z.string().optional(),
  APP_COMPANY_ADDRESS: z.string().optional(),
  APP_COMPANY_LOGO: z.string().optional(),
  APP_THEME_PRIMARY: z.string().optional(),
  APP_THEME_ACCENT: z.string().optional(),
  APP_THEME_RADIUS: z.string().optional(),
  APP_THEME_FONT: z.string().optional(),
  APP_THEME_MODE: z.enum(["light", "dark", "system"]).optional(),
  APP_SESSION_EXPIRY_HOURS: z.string().optional(),
  PORT: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function trimEnv(value: string | undefined): string | undefined {
  return value?.trim();
}

function isLocalhostUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
  } catch {
    return false;
  }
}

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/$/, "");
}

/** Canonical app URL for Auth.js redirects, emails, and password reset links. */
export function resolveAuthUrl(): string {
  const explicit =
    trimEnv(process.env.AUTH_URL) ?? trimEnv(process.env.NEXTAUTH_URL);

  if (
    explicit &&
    !(process.env.NODE_ENV === "production" && isLocalhostUrl(explicit))
  ) {
    return normalizeBaseUrl(explicit);
  }

  const vercel = trimEnv(process.env.VERCEL_URL);
  if (vercel) {
    return normalizeBaseUrl(`https://${vercel}`);
  }

  const railway = trimEnv(process.env.RAILWAY_PUBLIC_DOMAIN);
  if (railway) {
    return normalizeBaseUrl(railway.startsWith("http") ? railway : `https://${railway}`);
  }

  if (explicit) {
    return normalizeBaseUrl(explicit);
  }

  return normalizeBaseUrl(
    `http://localhost:${trimEnv(process.env.PORT) ?? "4000"}`
  );
}

/**
 * Returns only an explicitly configured canonical auth URL.
 * Auth.js route redirects should prefer the current request host when this is unset.
 */
export function getConfiguredAuthUrl(): string | undefined {
  const explicit =
    trimEnv(process.env.AUTH_URL) ?? trimEnv(process.env.NEXTAUTH_URL);

  if (!explicit) {
    return undefined;
  }

  if (process.env.NODE_ENV === "production" && isLocalhostUrl(explicit)) {
    return undefined;
  }

  return normalizeBaseUrl(explicit);
}

/**
 * Public app URL for links shown to users in emails and notifications.
 * This intentionally avoids platform fallback hosts like `*.vercel.app`.
 */
export function getPublicAuthUrl(): string {
  return (
    getConfiguredAuthUrl() ??
    normalizeBaseUrl(`http://localhost:${trimEnv(process.env.PORT) ?? "4000"}`)
  );
}

export function getEnv(): Env {
  const parsed = envSchema.safeParse({
    ...process.env,
    CLOUDINARY_CLOUD_NAME: trimEnv(process.env.CLOUDINARY_CLOUD_NAME),
    CLOUDINARY_API_KEY: trimEnv(process.env.CLOUDINARY_API_KEY),
    CLOUDINARY_API_SECRET: trimEnv(process.env.CLOUDINARY_API_SECRET),
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: trimEnv(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME),
    AUTH_SECRET: trimEnv(process.env.AUTH_SECRET)?.replace(/^"|"$/g, ""),
    NEXTAUTH_SECRET: trimEnv(process.env.NEXTAUTH_SECRET)?.replace(/^"|"$/g, ""),
  });
  if (!parsed.success) {
    const missing = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(`Invalid environment variables: ${missing}`);
  }
  return parsed.data;
}

export function getAuthSecret(): string {
  const secret =
    trimEnv(process.env.AUTH_SECRET)?.replace(/^"|"$/g, "") ??
    trimEnv(process.env.NEXTAUTH_SECRET)?.replace(/^"|"$/g, "");
  if (!secret) {
    throw new Error("AUTH_SECRET or NEXTAUTH_SECRET must be set in .env.local");
  }
  return secret;
}

export function getAuthUrl(): string {
  return resolveAuthUrl();
}

export function getMongoUri(): string {
  const uri = trimEnv(process.env.MONGODB_URI);
  if (!uri) {
    throw new Error("MONGODB_URI must be set in .env.local");
  }
  return uri;
}

export function isEnvConfigured(): boolean {
  return Boolean(trimEnv(process.env.MONGODB_URI));
}

export function getCloudinaryCloudName(): string {
  return (
    trimEnv(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) ??
    trimEnv(process.env.CLOUDINARY_CLOUD_NAME) ??
    ""
  );
}

export function isPublicRegistrationAllowed(): boolean {
  const val = trimEnv(process.env.ALLOW_PUBLIC_REGISTRATION);
  if (val === undefined || val === "") {
    return false;
  }
  return val === "true" || val === "1";
}
