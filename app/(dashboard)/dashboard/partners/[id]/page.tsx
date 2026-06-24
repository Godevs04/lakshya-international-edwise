import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { GlassCard } from "@/components/cards/glass-card";
import { PartnerCommissionSection } from "@/components/dashboard/partner-commission-section";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { DemographicsBarChart } from "@/components/charts/dashboard-charts";
import { getPartnerById, getPartnerAnalytics, getPartnerCommissionLedgerAction } from "@/lib/actions/partner.actions";
import { requireModuleEnabled } from "@/lib/auth/module-guard";
import { getPartnerPageAccess, requirePagePermission } from "@/lib/auth/page-access";
import { PERMISSIONS } from "@/lib/constants/permissions";
import type { PartnerStatus } from "@/lib/constants/statuses";
import { Pencil } from "lucide-react";

export default async function PartnerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  await requireModuleEnabled("partners");
  await requirePagePermission(PERMISSIONS.PARTNERS_READ);

  const { id } = await params;
  const { tab } = await searchParams;
  const access = await getPartnerPageAccess();
  const [partner, analytics, ledger] = await Promise.all([
    getPartnerById(id),
    getPartnerAnalytics(id),
    getPartnerCommissionLedgerAction(id),
  ]);
  if (!partner) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={partner.companyName}
        description={`Owner: ${partner.owner ?? "N/A"}`}
        action={
          access.canWrite ? (
            <Link href={`/dashboard/partners/${id}/edit`}>
              <Button variant="outline" size="sm"><Pencil className="mr-1 h-4 w-4" /> Edit</Button>
            </Link>
          ) : undefined
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <GlassCard className="p-4">
          <p className="text-xs text-muted-foreground">Linked Students</p>
          <p className="text-2xl font-semibold">{partner.studentsCount}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-xs text-muted-foreground">Disbursed Students</p>
          <p className="text-2xl font-semibold">{analytics?.disbursedStudentCount ?? 0}</p>
        </GlassCard>
      </div>

      <PartnerCommissionSection
        partnerId={id}
        canWrite={access.canWrite}
        commissionPercent={partner.commissionPercent ?? 0}
        totalDisbursed={analytics?.disbursementTotal ?? 0}
        disbursedStudentCount={analytics?.disbursedStudentCount ?? 0}
        commissionEarned={analytics?.commissionEarned ?? 0}
        commissionSettled={analytics?.commissionSettled ?? 0}
        commissionPending={analytics?.commissionPending ?? 0}
        settlements={analytics?.settlements ?? []}
        studentCommissions={analytics?.studentCommissions ?? []}
        ledger={ledger ?? {
          entries: [],
          earnedInMonth: 0,
          settledInMonth: 0,
          commissionEarnedTotal: analytics?.commissionEarned ?? 0,
          commissionSettledTotal: analytics?.commissionSettled ?? 0,
          commissionPendingTotal: analytics?.commissionPending ?? 0,
        }}
        initialTab={tab === "students" ? "students" : tab === "ledger" ? "ledger" : "summary"}
      />

      <GlassCard className="p-5">
        <div className="flex flex-wrap items-center gap-4">
          <StatusBadge status={partner.status as PartnerStatus} type="partner" />
          <span className="text-sm text-muted-foreground">
            Commission is calculated from disbursed loan amounts. Use the Student-wise tab for per-student payout view.
          </span>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 text-sm">
          <p><span className="text-muted-foreground">Phone:</span> {partner.phone ?? "—"}</p>
          <p><span className="text-muted-foreground">Email:</span> {partner.email ?? "—"}</p>
          <p><span className="text-muted-foreground">GST:</span> {partner.gst ?? "—"}</p>
          <p><span className="text-muted-foreground">Address:</span> {partner.address ?? "—"}</p>
          {partner.bankDetails?.accountNumber && (
            <>
              <p><span className="text-muted-foreground">Bank:</span> {partner.bankDetails.bankName ?? "—"}</p>
              <p><span className="text-muted-foreground">Account:</span> {partner.bankDetails.accountNumber}</p>
              <p><span className="text-muted-foreground">IFSC:</span> {partner.bankDetails.ifsc ?? "—"}</p>
            </>
          )}
        </div>
      </GlassCard>

      {analytics?.statusCounts && analytics.statusCounts.length > 0 && (
        <DemographicsBarChart
          title="Student Status Distribution"
          data={analytics.statusCounts.map((s: { _id: string; count: number }) => ({
            name: s._id.replace(/_/g, " "),
            value: s.count,
          }))}
        />
      )}
    </div>
  );
}
