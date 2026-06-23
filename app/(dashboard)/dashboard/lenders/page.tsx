import Link from "next/link";
import { LendersView } from "@/components/dashboard/lenders-view";
import { PageHeader } from "@/components/dashboard/page-header";
import { getLendersAction } from "@/lib/actions/lender.actions";
import { requireModuleEnabled } from "@/lib/auth/module-guard";
import { requirePagePermission } from "@/lib/auth/page-access";
import { PERMISSIONS } from "@/lib/constants/permissions";

export default async function LendersPage() {
  await requireModuleEnabled("lenders");
  await requirePagePermission(PERMISSIONS.STUDENTS_READ);

  const lenders = await getLendersAction();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lenders"
        description="Loan partners and application volume"
        badge="Banks"
        action={
          <Link
            href="/dashboard/students"
            className="text-sm font-semibold text-[#6D5EF7] hover:underline"
          >
            View all students →
          </Link>
        }
      />
      <LendersView lenders={lenders} />
    </div>
  );
}
