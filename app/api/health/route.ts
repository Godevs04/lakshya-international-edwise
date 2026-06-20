import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db/mongoose";
import { getProductionEnvStatus } from "@/lib/config/validate-env";

export const dynamic = "force-dynamic";

export async function GET() {
  const timestamp = new Date().toISOString();
  const version = process.env.npm_package_version ?? "0.1.0";
  const envStatus =
    process.env.NODE_ENV === "production" ? getProductionEnvStatus() : { valid: true, missing: [] };

  let dbStatus: "connected" | "disconnected" | "error" = "disconnected";

  try {
    await connectDB();
    dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  } catch {
    dbStatus = "error";
  }

  const healthy = dbStatus === "connected" && envStatus.valid;

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      timestamp,
      version,
      checks: {
        database: dbStatus,
        environment: envStatus.valid ? "ok" : "missing_variables",
        missingEnv: envStatus.missing,
      },
    },
    { status: healthy ? 200 : 503 }
  );
}
