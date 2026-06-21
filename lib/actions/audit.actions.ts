"use server";

import { connectDB } from "@/lib/db/mongoose";
import { AuditLog } from "@/models/AuditLog";
import { getSessionUser } from "@/lib/auth/auth";
import { requirePermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { toSafeRegExp } from "@/lib/utils/sanitize";
import { runLoggedQuery, emptyPaginated } from "@/lib/action-utils";
import type { AuditPeriod } from "@/lib/utils/audit-format";
import { endOfDay, startOfDay, subDays } from "date-fns";
import type { PaginatedResult } from "@/types";

export interface AuditLogItem {
  _id: string;
  userName?: string;
  action: string;
  description?: string;
  resourceType: string;
  resourceId?: string;
  diff?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface AuditLogStats {
  total: number;
  today: number;
  last7Days: number;
  last30Days: number;
  topResourceType?: string;
  topResourceCount: number;
}

function buildDateFilter(period?: AuditPeriod): Record<string, unknown> | undefined {
  if (!period || period === "all") return undefined;

  const now = new Date();
  if (period === "today") {
    return { $gte: startOfDay(now), $lte: endOfDay(now) };
  }
  if (period === "7d") {
    return { $gte: startOfDay(subDays(now, 6)), $lte: endOfDay(now) };
  }
  if (period === "30d") {
    return { $gte: startOfDay(subDays(now, 29)), $lte: endOfDay(now) };
  }
  return undefined;
}

function buildAuditFilter(params: {
  search?: string;
  resourceType?: string;
  actionGroup?: string;
  period?: AuditPeriod;
}): Record<string, unknown> {
  const filter: Record<string, unknown> = {};

  if (params.resourceType && params.resourceType !== "all") {
    filter.resourceType = params.resourceType;
  }

  if (params.actionGroup && params.actionGroup !== "all") {
    filter.action = new RegExp(`^${params.actionGroup.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\.`);
  }

  const createdAt = buildDateFilter(params.period);
  if (createdAt) {
    filter.createdAt = createdAt;
  }

  if (params.search) {
    const regex = toSafeRegExp(params.search);
    filter.$or = [
      { action: regex },
      { userName: regex },
      { resourceType: regex },
      { description: regex },
      { ip: regex },
    ];
  }

  return filter;
}

function mapAuditLog(log: {
  _id: { toString(): string };
  userName?: string;
  action: string;
  description?: string;
  resourceType: string;
  resourceId?: { toString(): string };
  diff?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
}): AuditLogItem {
  return {
    _id: log._id.toString(),
    userName: log.userName,
    action: log.action,
    description: log.description,
    resourceType: log.resourceType,
    resourceId: log.resourceId?.toString(),
    diff: log.diff,
    metadata: log.metadata,
    ip: log.ip,
    userAgent: log.userAgent,
    createdAt: log.createdAt,
  };
}

export async function getAuditLogStats(): Promise<AuditLogStats> {
  return runLoggedQuery(
    "getAuditLogStats",
    async () => {
      const user = await getSessionUser();
      requirePermission(user, PERMISSIONS.AUDIT_READ);
      await connectDB();

      const now = new Date();
      const todayStart = startOfDay(now);
      const weekStart = startOfDay(subDays(now, 6));
      const monthStart = startOfDay(subDays(now, 29));

      const [total, today, last7Days, last30Days, topResource] = await Promise.all([
        AuditLog.countDocuments(),
        AuditLog.countDocuments({ createdAt: { $gte: todayStart } }),
        AuditLog.countDocuments({ createdAt: { $gte: weekStart } }),
        AuditLog.countDocuments({ createdAt: { $gte: monthStart } }),
        AuditLog.aggregate<{ _id: string; count: number }>([
          { $group: { _id: "$resourceType", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 1 },
        ]),
      ]);

      return {
        total,
        today,
        last7Days,
        last30Days,
        topResourceType: topResource[0]?._id,
        topResourceCount: topResource[0]?.count ?? 0,
      };
    },
    { total: 0, today: 0, last7Days: 0, last30Days: 0, topResourceCount: 0 }
  );
}

export async function getAuditLogs(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  resourceType?: string;
  actionGroup?: string;
  period?: AuditPeriod;
} = {}): Promise<PaginatedResult<AuditLogItem>> {
  return runLoggedQuery(
    "getAuditLogs",
    async () => {
      const user = await getSessionUser();
      requirePermission(user, PERMISSIONS.AUDIT_READ);

      await connectDB();
      const page = params.page ?? 1;
      const pageSize = params.pageSize ?? 20;
      const skip = (page - 1) * pageSize;
      const filter = buildAuditFilter(params);

      const [data, total] = await Promise.all([
        AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
        AuditLog.countDocuments(filter),
      ]);

      return {
        data: data.map(mapAuditLog),
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    },
    emptyPaginated(params.page ?? 1, params.pageSize ?? 20)
  );
}

export async function exportAuditLogsAction(params: {
  search?: string;
  resourceType?: string;
  actionGroup?: string;
  period?: AuditPeriod;
} = {}): Promise<string> {
  const user = await getSessionUser();
  requirePermission(user, PERMISSIONS.AUDIT_READ);
  await connectDB();

  const filter = buildAuditFilter(params);
  const logs = await AuditLog.find(filter).sort({ createdAt: -1 }).limit(1000).lean();

  const headers = [
    "Time",
    "User",
    "Action",
    "Description",
    "Resource Type",
    "Resource ID",
    "IP Address",
    "User Agent",
    "Metadata",
  ];

  const escape = (value: string) => {
    if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
    return value;
  };

  const rows = logs.map((log) =>
    [
      log.createdAt.toISOString(),
      log.userName ?? "",
      log.action,
      log.description ?? "",
      log.resourceType,
      log.resourceId?.toString() ?? "",
      log.ip ?? "",
      log.userAgent ?? "",
      log.metadata ? JSON.stringify(log.metadata) : "",
    ]
      .map((cell) => escape(String(cell)))
      .join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}
