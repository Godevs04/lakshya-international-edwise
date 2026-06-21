import { PageHeader } from "@/components/dashboard/page-header";
import { ApplicationKanban } from "@/components/dashboard/application-kanban";
import { getApplications } from "@/lib/actions/application.actions";
import { requireModuleEnabled } from "@/lib/auth/module-guard";
import { getApplicationPageAccess, requirePagePermission } from "@/lib/auth/page-access";
import { PERMISSIONS } from "@/lib/constants/permissions";

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; view?: string; search?: string }>;
}) {
  await requireModuleEnabled("applications");
  await requirePagePermission(PERMISSIONS.APPLICATIONS_READ);

  const params = await searchParams;
  const view = params.view === "table" ? "table" : "kanban";
  const access = await getApplicationPageAccess();

  const pipeline = await getApplications({ pipeline: true });
  const tableResult =
    view === "table"
      ? await getApplications({
          page: parseInt(params.page ?? "1", 10),
          pageSize: 20,
          search: params.search,
        })
      : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Applications"
        description="Manage your application pipeline with drag & drop"
        badge="Pipeline"
      />
      <ApplicationKanban
        applications={pipeline.data}
        tableResult={tableResult}
        view={view}
        canWrite={access.canWrite}
      />
    </div>
  );
}
