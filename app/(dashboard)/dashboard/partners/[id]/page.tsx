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
import { Pencil, IndianRupee, Building2, Users, Landmark } from "lucide-react";
import { Suspense } from "react";
import { commissionStatusFilterSchema } from "@/lib/validations/schemas";
import {
  getPartnerEditHref,
  type PartnerEditSectionKey,
} from "@/lib/constants/partner-edit-sections";

function PartnerSectionEditLink({
  partnerId,
  section,
}: {
  partnerId: string;
  section: PartnerEditSectionKey;
}) {
  return (
    <Link href={getPartnerEditHref(partnerId, section)}>
      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
        <Pencil className="mr-1 h-3 w-3" />
        Edit
      </Button>
    </Link>
  );
}

export default async function PartnerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; status?: string }>;
}) {
  await requireModuleEnabled("partners");
  await requirePagePermission(PERMISSIONS.PARTNERS_READ);

  const { id } = await params;
  const { tab, status } = await searchParams;
  const parsedStatus = commissionStatusFilterSchema.safeParse(status ?? "all");
  const statusFilter = parsedStatus.success ? parsedStatus.data : "all";
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
          <div className="flex flex-wrap gap-2">
            <Link href={`/dashboard/partners/${id}?tab=students`}>
              <Button variant="default" size="sm">
                <IndianRupee className="mr-1 h-4 w-4" /> Mark Received / Paid
              </Button>
            </Link>
            {access.canWrite ? (
              <Link href={`/dashboard/partners/${id}/edit`}>
                <Button variant="outline" size="sm">
                  <Pencil className="mr-1 h-4 w-4" /> Edit all sections
                </Button>
              </Link>
            ) : null}
          </div>
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

      <Suspense fallback={<div className="h-48 animate-pulse rounded-xl border border-border bg-card/50" />}>
        <PartnerCommissionSection
          partnerId={id}
          canWrite={access.canWrite}
          commissionPercent={partner.commissionPercent ?? 0}
          totalDisbursed={analytics?.disbursementTotal ?? 0}
          disbursedStudentCount={analytics?.disbursedStudentCount ?? 0}
          commissionExpected={analytics?.commissionExpected ?? 0}
          commissionReceived={analytics?.commissionReceived ?? 0}
          pendingReceived={analytics?.pendingReceived ?? 0}
          partnerShareExpected={analytics?.partnerShareExpected ?? 0}
          commissionShared={analytics?.commissionShared ?? 0}
          pendingShared={analytics?.pendingShared ?? 0}
          projectedNetEarned={analytics?.projectedNetEarned ?? 0}
          commissionEarned={analytics?.commissionEarned ?? 0}
          commissionSettled={analytics?.commissionSettled ?? 0}
          commissionPending={analytics?.commissionPending ?? 0}
          settlements={analytics?.settlements ?? []}
          studentCommissions={analytics?.studentCommissions ?? []}
          ledger={ledger ?? {
            entries: [],
            expectedInMonth: 0,
            receivedInMonth: 0,
            sharedInMonth: 0,
            earnedInMonth: 0,
            settledInMonth: 0,
            commissionExpectedTotal: analytics?.commissionExpected ?? 0,
            commissionReceivedTotal: analytics?.commissionReceived ?? 0,
            pendingReceivedTotal: analytics?.pendingReceived ?? 0,
            partnerShareExpectedTotal: analytics?.partnerShareExpected ?? 0,
            commissionSharedTotal: analytics?.commissionShared ?? 0,
            pendingSharedTotal: analytics?.pendingShared ?? 0,
            commissionEarnedTotal: analytics?.commissionEarned ?? 0,
            commissionSettledTotal: analytics?.commissionShared ?? 0,
            commissionPendingTotal: analytics?.pendingShared ?? 0,
          }}
          initialTab={tab === "students" ? "students" : tab === "ledger" ? "ledger" : "summary"}
          statusFilter={statusFilter}
        />
      </Suspense>

      <GlassCard className="space-y-4 p-5">
        <div className="flex flex-wrap items-center gap-4">
          <StatusBadge status={partner.status as PartnerStatus} type="partner" />
          <span className="text-sm text-muted-foreground">
            Commission is calculated from disbursed loan amounts. Use the Student-wise tab for per-student payout view.
          </span>
        </div>

        <div className="rounded-xl border p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              Company details
            </h3>
            {access.canWrite ? (
              <PartnerSectionEditLink partnerId={id} section="company" />
            ) : null}
          </div>
          <div className="grid gap-2 sm:grid-cols-2 text-sm">
            <p><span className="text-muted-foreground">Phone:</span> {partner.phone ?? "—"}</p>
            <p><span className="text-muted-foreground">Email:</span> {partner.email ?? "—"}</p>
            <p><span className="text-muted-foreground">GST:</span> {partner.gst ?? "—"}</p>
            <p><span className="text-muted-foreground">Partner share:</span> {partner.commissionPercent ?? 0}%</p>
            <p className="sm:col-span-2">
              <span className="text-muted-foreground">Address:</span> {partner.address ?? "—"}
            </p>
          </div>
        </div>

        {partner.contacts?.length ? (
          <div className="rounded-xl border p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Users className="h-4 w-4 text-muted-foreground" />
                Points of contact
              </h3>
              {access.canWrite ? (
                <PartnerSectionEditLink partnerId={id} section="contacts" />
              ) : null}
            </div>
            <div className="space-y-2 text-sm">
              {partner.contacts.map((contact, index) => (
                <p key={`${contact.name}-${index}`}>
                  <span className="font-medium">{contact.name ?? "Contact"}</span>
                  {contact.role ? ` · ${contact.role}` : ""}
                  {contact.phone || contact.email
                    ? ` — ${[contact.phone, contact.email].filter(Boolean).join(" · ")}`
                    : ""}
                </p>
              ))}
            </div>
          </div>
        ) : access.canWrite ? (
          <div className="rounded-xl border border-dashed p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">No contacts added yet.</p>
              <PartnerSectionEditLink partnerId={id} section="contacts" />
            </div>
          </div>
        ) : null}

        <div className="rounded-xl border p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Landmark className="h-4 w-4 text-muted-foreground" />
              Bank details
            </h3>
            {access.canWrite ? (
              <PartnerSectionEditLink partnerId={id} section="bank" />
            ) : null}
          </div>
          {partner.bankDetails?.accountNumber ? (
            <div className="grid gap-2 sm:grid-cols-2 text-sm">
              <p><span className="text-muted-foreground">Bank:</span> {partner.bankDetails.bankName ?? "—"}</p>
              <p><span className="text-muted-foreground">Account:</span> {partner.bankDetails.accountNumber}</p>
              <p><span className="text-muted-foreground">IFSC:</span> {partner.bankDetails.ifsc ?? "—"}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No bank details added yet.</p>
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
