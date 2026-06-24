import { LendersView } from "@/components/dashboard/lenders-view";
import { PageHeader } from "@/components/dashboard/page-header";
import { getLendersAction } from "@/lib/actions/lender.actions";
import { requireModuleEnabled } from "@/lib/auth/module-guard";
import { getStudentPageAccess, requirePagePermission } from "@/lib/auth/page-access";
import { PERMISSIONS } from "@/lib/constants/permissions";

export default async function LendersPage() {
  await requireModuleEnabled("lenders");
  await requirePagePermission(PERMISSIONS.STUDENTS_READ);

  const [lenders, access] = await Promise.all([getLendersAction(), getStudentPageAccess()]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lenders"
        description="Loan partners and application volume"
        badge="Banks"
      />
      <LendersView lenders={lenders} canWrite={access.canWrite} />
    </div>
  );
}
