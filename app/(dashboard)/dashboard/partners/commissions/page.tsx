import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { GlassCard } from "@/components/cards/glass-card";
import { PartnersCommissionOverviewTable } from "@/components/tables/partners-commission-overview-table";
import { CommissionStatusFilter } from "@/components/dashboard/commission-status-filter";
import { CommissionModelNotice } from "@/components/dashboard/commission-model-notice";
import { getPartnersCommissionOverviewAction } from "@/lib/actions/partner.actions";
import { requireModuleEnabled } from "@/lib/auth/module-guard";
import { requirePagePermission } from "@/lib/auth/page-access";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { formatCurrency } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function PartnerCommissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireModuleEnabled("partners");
  await requirePagePermission(PERMISSIONS.PARTNERS_READ);

  const { status } = await searchParams;
  const rows = await getPartnersCommissionOverviewAction(status);
  const totals = rows.reduce(
    (acc, row) => ({
      expected: acc.expected + row.commissionExpected,
      received: acc.received + row.commissionReceived,
      pendingReceived: acc.pendingReceived + row.pendingReceived,
      shared: acc.shared + row.commissionShared,
      pendingShared: acc.pendingShared + row.pendingShared,
      earned: acc.earned + row.commissionEarned,
    }),
    { expected: 0, received: 0, pendingReceived: 0, shared: 0, pendingShared: 0, earned: 0 }
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Partner Commissions"
        description="Two-tier commission: your rate on disbursement, partner share on your commission"
        badge="Payouts"
        action={
          <Link href="/dashboard/partners">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-1.5 h-4 w-4" /> All Partners
            </Button>
          </Link>
        }
      />

      <CommissionModelNotice />

      <div className="flex flex-col gap-2 rounded-xl border border-border bg-card/50 p-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium">Filter by commission status</p>
          <p className="text-xs text-muted-foreground">
            All partners — pending, partial, and complete received/paid
          </p>
        </div>
        <Suspense fallback={null}>
          <CommissionStatusFilter label="Status" />
        </Suspense>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <GlassCard className="p-4">
          <p className="text-xs text-muted-foreground">Active Partners</p>
          <p className="text-2xl font-semibold">{rows.length}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-xs text-muted-foreground">Commission Expected</p>
          <p className="text-2xl font-semibold">{formatCurrency(totals.expected)}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-xs text-muted-foreground">Commission Received</p>
          <p className="text-2xl font-semibold text-[#22C55E]">{formatCurrency(totals.received)}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-xs text-muted-foreground">Pending Received</p>
          <p className="text-2xl font-semibold text-[#F59E0B]">{formatCurrency(totals.pendingReceived)}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-xs text-muted-foreground">Commission Shared</p>
          <p className="text-2xl font-semibold text-[#22C55E]">{formatCurrency(totals.shared)}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-xs text-muted-foreground">Pending Shared</p>
          <p className="text-2xl font-semibold text-[#F59E0B]">{formatCurrency(totals.pendingShared)}</p>
        </GlassCard>
        <GlassCard className="p-4 sm:col-span-2 xl:col-span-1">
          <p className="text-xs text-muted-foreground">Net Commission Earned</p>
          <p className="text-2xl font-semibold text-[#6D5EF7]">{formatCurrency(totals.earned)}</p>
        </GlassCard>
      </div>

      <PartnersCommissionOverviewTable rows={rows} />
    </div>
  );
}
