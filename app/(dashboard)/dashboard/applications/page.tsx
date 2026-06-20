import { PageHeader } from "@/components/dashboard/page-header";
import { ApplicationKanban } from "@/components/dashboard/application-kanban";
import { getApplications } from "@/lib/actions/application.actions";

export default async function ApplicationsPage() {
  const applications = await getApplications();
  return (
    <div className="space-y-6">
      <PageHeader title="Applications" description="Manage your application pipeline" />
      <ApplicationKanban applications={applications} />
    </div>
  );
}
