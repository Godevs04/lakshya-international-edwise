import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { GlassCard } from "@/components/cards/glass-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DemographicsPieChart } from "@/components/charts/dashboard-charts";
import { getPartnerById, getPartnerStudents, getPartnerAnalytics } from "@/lib/actions/partner.actions";
import { requireModuleEnabled } from "@/lib/auth/module-guard";
import { getPartnerPageAccess } from "@/lib/auth/page-access";
import { formatCurrency } from "@/lib/utils/format";
import type { PartnerStatus } from "@/lib/constants/statuses";
import { Pencil } from "lucide-react";

export default async function PartnerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireModuleEnabled("partners");

  const { id } = await params;
  const access = await getPartnerPageAccess();
  const [partner, students, analytics] = await Promise.all([
    getPartnerById(id),
    getPartnerStudents(id),
    getPartnerAnalytics(id),
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

      <div className="grid gap-4 sm:grid-cols-4">
        <GlassCard className="p-4"><p className="text-xs text-muted-foreground">Students</p><p className="text-2xl font-semibold">{partner.studentsCount}</p></GlassCard>
        <GlassCard className="p-4"><p className="text-xs text-muted-foreground">Total Loan Value</p><p className="text-2xl font-semibold">{formatCurrency(partner.totalLoanValue)}</p></GlassCard>
        <GlassCard className="p-4"><p className="text-xs text-muted-foreground">Sanction Rate</p><p className="text-2xl font-semibold">{analytics?.sanctionRate ?? 0}%</p></GlassCard>
        <GlassCard className="p-4"><p className="text-xs text-muted-foreground">Commission Earned</p><p className="text-2xl font-semibold">{formatCurrency(analytics?.commissionEarned ?? 0)}</p></GlassCard>
      </div>

      <GlassCard className="p-5">
        <div className="flex items-center gap-4">
          <StatusBadge status={partner.status as PartnerStatus} type="partner" />
          <span className="text-sm text-muted-foreground">Commission: {partner.commissionPercent}%</span>
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
        <DemographicsPieChart
          title="Student Status Distribution"
          data={analytics.statusCounts.map((s: { _id: string; count: number }) => ({
            name: s._id.replace(/_/g, " "),
            value: s.count,
          }))}
        />
      )}

      <GlassCard className="p-5">
        <h3 className="mb-4 text-sm font-semibold">Linked Students</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Loan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length ? students.map((s) => (
              <TableRow key={s._id.toString()}>
                <TableCell>
                  <Link href={`/dashboard/students/${s._id}`} className="text-primary hover:underline">{s.studentId}</Link>
                </TableCell>
                <TableCell>{s.firstName} {s.lastName}</TableCell>
                <TableCell><StatusBadge status={s.status} /></TableCell>
                <TableCell>{formatCurrency(s.loan?.requested ?? 0)}</TableCell>
              </TableRow>
            )) : (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No students linked.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </GlassCard>
    </div>
  );
}
