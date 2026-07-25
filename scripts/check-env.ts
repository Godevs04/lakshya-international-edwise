/**
 * Fail fast when required environment variables are missing or invalid.
 *
 * Usage:
 *   npm run check:env              # validates schema + warns on soft gaps
 *   CHECK_ENV_STRICT=1 npm run check:env   # requires production-critical vars
 */
import { config as loadDotenv } from "dotenv";
import { resolve } from "node:path";
import { z } from "zod";

loadDotenv({ path: resolve(process.cwd(), ".env.local") });
loadDotenv({ path: resolve(process.cwd(), ".env") });

const schema = z.object({
  MONGODB_URI: z.string().min(1).optional(),
  AUTH_SECRET: z.string().min(32).optional(),
  NEXTAUTH_SECRET: z.string().min(32).optional(),
  AUTH_URL: z.string().url().optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

const strict = process.env.CHECK_ENV_STRICT === "1" || process.env.NODE_ENV === "production";

function trim(value: string | undefined): string | undefined {
  const next = value?.trim();
  return next ? next : undefined;
}

const parsed = schema.safeParse({
  MONGODB_URI: trim(process.env.MONGODB_URI),
  AUTH_SECRET: trim(process.env.AUTH_SECRET)?.replace(/^"|"$/g, ""),
  NEXTAUTH_SECRET: trim(process.env.NEXTAUTH_SECRET)?.replace(/^"|"$/g, ""),
  AUTH_URL: trim(process.env.AUTH_URL),
  NEXTAUTH_URL: trim(process.env.NEXTAUTH_URL),
  APP_URL: trim(process.env.APP_URL),
  NEXT_PUBLIC_APP_URL: trim(process.env.NEXT_PUBLIC_APP_URL),
  NEXT_PUBLIC_SITE_URL: trim(process.env.NEXT_PUBLIC_SITE_URL),
  SMTP_HOST: trim(process.env.SMTP_HOST),
  SMTP_USER: trim(process.env.SMTP_USER),
  SMTP_PASS: trim(process.env.SMTP_PASS),
  CLOUDINARY_CLOUD_NAME: trim(process.env.CLOUDINARY_CLOUD_NAME),
  CLOUDINARY_API_KEY: trim(process.env.CLOUDINARY_API_KEY),
  CLOUDINARY_API_SECRET: trim(process.env.CLOUDINARY_API_SECRET),
});

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("\n");
  console.error(`Invalid environment variables:\n${issues}`);
  process.exit(1);
}

const env = parsed.data;
const authSecret = env.AUTH_SECRET ?? env.NEXTAUTH_SECRET;
const missing: string[] = [];

if (!env.MONGODB_URI) missing.push("MONGODB_URI");
if (!authSecret) missing.push("AUTH_SECRET (or NEXTAUTH_SECRET)");

const warnings: string[] = [];
if (!env.AUTH_URL && !env.NEXTAUTH_URL && !env.APP_URL && !env.NEXT_PUBLIC_APP_URL) {
  warnings.push(
    "No AUTH_URL / APP_URL / NEXT_PUBLIC_APP_URL — emails will fall back to site defaults."
  );
}
if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
  warnings.push("SMTP incomplete — transactional email will not send.");
}
if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
  warnings.push("Cloudinary incomplete — media uploads may fail.");
}

if (warnings.length) {
  console.warn("Env warnings:\n" + warnings.map((w) => `  - ${w}`).join("\n"));
}

if (strict && missing.length) {
  console.error(
    `Missing required environment variables (strict mode):\n${missing
      .map((key) => `  - ${key}`)
      .join("\n")}`
  );
  process.exit(1);
}

if (missing.length) {
  console.warn(
    `Env soft gaps (set CHECK_ENV_STRICT=1 to fail):\n${missing
      .map((key) => `  - ${key}`)
      .join("\n")}`
  );
}

console.log("Environment check passed.");
