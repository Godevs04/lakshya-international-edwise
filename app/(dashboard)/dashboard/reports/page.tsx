import { PageHeader } from "@/components/dashboard/page-header";
import { ReportsView } from "@/components/dashboard/reports-view";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Generate and export business reports" />
      <ReportsView />
    </div>
  );
}
