import { NextResponse } from "next/server";
import { sendTaskReminders } from "@/lib/services/task-reminder.service";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await sendTaskReminders();
    return NextResponse.json({ ok: true, ...summary });
  } catch (error) {
    logger.error("Task reminder cron failed", error);
    return NextResponse.json({ error: "Task reminder job failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
