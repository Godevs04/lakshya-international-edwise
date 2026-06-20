import { PageHeader } from "@/components/dashboard/page-header";
import { ReportsView } from "@/components/dashboard/reports-view";
import { requireModuleEnabled } from "@/lib/auth/module-guard";

export default async function ReportsPage() {
  await requireModuleEnabled("reports");

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Generate and export business reports" badge="Export" />
      <ReportsView />
    </div>
  );
}
