import { PageHeader } from "@/components/dashboard/page-header";
import { AdmissionsTable } from "@/components/tables/admissions-table";
import { getAdmissions } from "@/lib/actions/admission.actions";
import { getAssignableUsers } from "@/lib/actions/student.actions";
import { requireModuleEnabled } from "@/lib/auth/module-guard";
import { getAdmissionsPageAccess, requirePagePermission } from "@/lib/auth/page-access";
import { PERMISSIONS } from "@/lib/constants/permissions";

export default async function AdmissionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireModuleEnabled("students");
  await requirePagePermission(PERMISSIONS.ADMISSIONS_READ);

  const params = await searchParams;
  const access = await getAdmissionsPageAccess();

  const [result, assignableUsers] = await Promise.all([
    getAdmissions({
      page: parseInt(params.page ?? "1", 10),
      search: params.search,
      targetCountry: params.targetCountry,
      targetIntake: params.targetIntake,
    }),
    getAssignableUsers(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admission Details"
        description="Track admission leads and student study-abroad details"
        badge="Admissions"
      />
      <AdmissionsTable
        {...result}
        canWrite={access.canWrite}
        canViewRevenue={access.canViewRevenue}
        search={params.search}
        targetCountry={params.targetCountry}
        targetIntake={params.targetIntake}
        assignableUsers={assignableUsers.map((user) => ({
          _id: user._id,
          name: user.name,
        }))}
      />
    </div>
  );
}
