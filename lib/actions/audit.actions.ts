"use server";

import { connectDB } from "@/lib/db/mongoose";
import { AuditLog } from "@/models/AuditLog";
import { getSessionUser } from "@/lib/auth/auth";
import { requirePermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { toSafeRegExp } from "@/lib/utils/sanitize";
import { runLoggedQuery, emptyPaginated } from "@/lib/action-utils";
import type { PaginatedResult } from "@/types";

export interface AuditLogItem {
  _id: string;
  userName?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  ip?: string;
  createdAt: Date;
}

export async function getAuditLogs(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  resourceType?: string;
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
      const filter: Record<string, unknown> = {};

      if (params.resourceType) {
        filter.resourceType = params.resourceType;
      }

      if (params.search) {
        const regex = toSafeRegExp(params.search);
        filter.$or = [
          { action: regex },
          { userName: regex },
          { resourceType: regex },
        ];
      }

      const [data, total] = await Promise.all([
        AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
        AuditLog.countDocuments(filter),
      ]);

      return {
        data: data.map((log) => ({
          _id: log._id.toString(),
          userName: log.userName,
          action: log.action,
          resourceType: log.resourceType,
          resourceId: log.resourceId?.toString(),
          ip: log.ip,
          createdAt: log.createdAt,
        })),
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    },
    emptyPaginated(params.page ?? 1, params.pageSize ?? 20)
  );
}
