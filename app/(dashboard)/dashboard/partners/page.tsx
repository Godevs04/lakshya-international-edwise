import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { PartnersTable } from "@/components/tables/partners-table";
import { getPartners } from "@/lib/actions/partner.actions";
import { requireModuleEnabled } from "@/lib/auth/module-guard";
import { getPartnerPageAccess, requirePagePermission } from "@/lib/auth/page-access";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { Button } from "@/components/ui/button";
import { Plus, IndianRupee } from "lucide-react";

export default async function PartnersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; actionStatus?: string }>;
}) {
  await requireModuleEnabled("partners");
  await requirePagePermission(PERMISSIONS.PARTNERS_READ);

  const params = await searchParams;
  const access = await getPartnerPageAccess();
  const result = await getPartners({
    page: parseInt(params.page ?? "1", 10),
    actionStatus: params.actionStatus,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Partners"
        description="Manage partner companies and commissions"
        badge="Network"
        action={
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/partners/commissions">
              <Button variant="outline">
                <IndianRupee className="mr-1.5 h-4 w-4" /> Partner Commissions
              </Button>
            </Link>
            {access.canWrite ? (
              <Link href="/dashboard/partners/new">
                <Button><Plus className="mr-1.5 h-4 w-4" /> Add Partner</Button>
              </Link>
            ) : null}
          </div>
        }
      />
      <PartnersTable {...result} {...access} actionStatus={params.actionStatus} />
    </div>
  );
}
