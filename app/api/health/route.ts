import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import { getProductionEnvStatus } from "@/lib/config/validate-env";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim()
  );
}

export async function GET() {
  const timestamp = new Date().toISOString();
  const version = process.env.npm_package_version ?? "0.1.0";
  const isProduction = process.env.NODE_ENV === "production";
  const envStatus = isProduction
    ? getProductionEnvStatus()
    : { valid: true, missing: [] as string[] };

  let dbStatus: "connected" | "disconnected" | "error" = "disconnected";

  try {
    await connectDB();
    dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  } catch {
    dbStatus = "error";
  }

  const smtpStatus = isSmtpConfigured() ? "ok" : "not_configured";
  const healthy = dbStatus === "connected" && envStatus.valid;

  if (!healthy && isProduction) {
    logger.warn("Health check degraded", {
      database: dbStatus,
      missingEnvCount: envStatus.missing.length,
      smtp: smtpStatus,
    });
  }

  const checks: Record<string, string> = {
    database: dbStatus,
    environment: envStatus.valid ? "ok" : "missing_variables",
    smtp: smtpStatus,
  };

  if (!isProduction) {
    checks.missingEnv = envStatus.missing.join(",") || "none";
  }

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      timestamp,
      version,
      checks,
    },
    { status: healthy ? 200 : 503 }
  );
}
