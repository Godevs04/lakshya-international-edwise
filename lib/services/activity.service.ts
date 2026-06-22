import { connectDB } from "@/lib/db/mongoose";
import { Activity } from "@/models/Activity";
import { AuditLog } from "@/models/AuditLog";
import { getClientIp } from "@/lib/rate-limit";
import { headers } from "next/headers";
import type { Types } from "mongoose";

interface LogActivityParams {
  action: string;
  description: string;
  resourceType: string;
  resourceId?: string | Types.ObjectId;
  userId?: string;
  userName?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  diff?: Record<string, unknown>;
}

export async function logActivity(params: LogActivityParams): Promise<void> {
  await connectDB();

  let ip = params.ip;
  let userAgent = params.userAgent;

  if (!ip || !userAgent) {
    try {
      const headerList = await headers();
      ip = ip ?? (await getClientIp());
      userAgent = userAgent ?? headerList.get("user-agent") ?? undefined;
    } catch {
      // Request headers unavailable outside server actions / route handlers.
    }
  }

  const resourceId =
    params.resourceId !== undefined && params.resourceId !== null
      ? String(params.resourceId)
      : undefined;

  await Activity.create({
    action: params.action,
    description: params.description,
    resourceType: params.resourceType,
    resourceId,
    userId: params.userId,
    userName: params.userName,
    metadata: params.metadata,
  });

  await AuditLog.create({
    userId: params.userId,
    userName: params.userName,
    action: params.action,
    description: params.description,
    resourceType: params.resourceType,
    resourceId,
    diff: params.diff,
    metadata: params.metadata,
    ip,
    userAgent,
  });
}

export async function getRecentActivities(limit = 10) {
  await connectDB();
  return Activity.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

export async function getActivitiesForResource(
  resourceType: string,
  resourceId: string,
  limit = 20
) {
  await connectDB();
  return Activity.find({ resourceType, resourceId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}
