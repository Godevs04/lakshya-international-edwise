import { PageHeader } from "@/components/dashboard/page-header";
import { ReportsView } from "@/components/dashboard/reports-view";
import { requireModuleEnabled } from "@/lib/auth/module-guard";
import { requirePagePermission } from "@/lib/auth/page-access";
import { PERMISSIONS } from "@/lib/constants/permissions";

export default async function ReportsPage() {
  await requireModuleEnabled("reports");
  await requirePagePermission(PERMISSIONS.REPORTS_READ);

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Generate and export business reports" badge="Export" />
      <ReportsView />
    </div>
  );
}
