import { Suspense } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { AuditLogTable } from "@/components/tables/audit-log-table";
import { getAuditLogs, getAuditLogStats } from "@/lib/actions/audit.actions";
import { requirePagePermission } from "@/lib/auth/page-access";
import { PERMISSIONS } from "@/lib/constants/permissions";
import type { AuditPeriod } from "@/lib/utils/audit-format";

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    resourceType?: string;
    actionGroup?: string;
    period?: AuditPeriod;
  }>;
}) {
  await requirePagePermission(PERMISSIONS.AUDIT_READ);
  const params = await searchParams;

  const [result, stats] = await Promise.all([
    getAuditLogs({
      page: parseInt(params.page ?? "1", 10),
      search: params.search,
      resourceType: params.resourceType,
      actionGroup: params.actionGroup,
      period: params.period,
    }),
    getAuditLogStats(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Log"
        description="Immutable record of CRM mutations, imports, and security events with full traceability"
        badge="Compliance"
      />
      <Suspense>
        <AuditLogTable {...result} stats={stats} />
      </Suspense>
    </div>
  );
}
