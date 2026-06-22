import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { GlassCard } from "@/components/cards/glass-card";
import { PartnersCommissionOverviewTable } from "@/components/tables/partners-commission-overview-table";
import { getPartnersCommissionOverviewAction } from "@/lib/actions/partner.actions";
import { requireModuleEnabled } from "@/lib/auth/module-guard";
import { requirePagePermission } from "@/lib/auth/page-access";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { formatCurrency } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function PartnerCommissionsPage() {
  await requireModuleEnabled("partners");
  await requirePagePermission(PERMISSIONS.PARTNERS_READ);

  const rows = await getPartnersCommissionOverviewAction();
  const totals = rows.reduce(
    (acc, row) => ({
      pending: acc.pending + row.commissionPending,
      earned: acc.earned + row.commissionEarned,
    }),
    { pending: 0, earned: 0 }
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Partner Commissions"
        description="Partner-wise and student-wise commission payout overview"
        badge="Payouts"
        action={
          <Link href="/dashboard/partners">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-1.5 h-4 w-4" /> All Partners
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <GlassCard className="p-4">
          <p className="text-xs text-muted-foreground">Active Partners</p>
          <p className="text-2xl font-semibold">{rows.length}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-xs text-muted-foreground">Total Commission Earned</p>
          <p className="text-2xl font-semibold text-[#6D5EF7]">{formatCurrency(totals.earned)}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-xs text-muted-foreground">Total Pending Payout</p>
          <p className="text-2xl font-semibold text-[#F59E0B]">{formatCurrency(totals.pending)}</p>
        </GlassCard>
      </div>

      <PartnersCommissionOverviewTable rows={rows} />
    </div>
  );
}
