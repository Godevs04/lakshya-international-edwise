import { Suspense } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { AuditLogTable } from "@/components/tables/audit-log-table";
import { getAuditLogs } from "@/lib/actions/audit.actions";
import { requirePagePermission } from "@/lib/auth/page-access";
import { PERMISSIONS } from "@/lib/constants/permissions";

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; resourceType?: string }>;
}) {
  await requirePagePermission(PERMISSIONS.AUDIT_READ);
  const params = await searchParams;
  const result = await getAuditLogs({
    page: parseInt(params.page ?? "1", 10),
    search: params.search,
    resourceType: params.resourceType,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Log"
        description="Immutable record of CRM mutations and security events"
        badge="Compliance"
      />
      <Suspense>
        <AuditLogTable {...result} />
      </Suspense>
    </div>
  );
}
