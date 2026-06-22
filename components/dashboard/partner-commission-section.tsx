"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/toast";
import { GlassCard } from "@/components/cards/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PartnerStudentCommissionTable,
  type PartnerStudentCommissionRow,
} from "@/components/dashboard/partner-student-commission-table";
import {
  PartnerCommissionLedgerPanel,
  downloadBase64File,
} from "@/components/dashboard/partner-commission-ledger-panel";
import { formatCurrency, formatDateTime, formatPercent } from "@/lib/utils/format";
import {
  exportPartnerCommissionAction,
  recordPartnerCommissionSettlementAction,
} from "@/lib/actions/partner.actions";
import type { PartnerCommissionLedger } from "@/lib/services/partner-commission.service";

interface SettlementEntry {
  amount: number;
  note?: string;
  settledAt?: Date | string;
  settledByName?: string;
  studentId?: string;
  studentName?: string;
}

interface PartnerCommissionSectionProps {
  partnerId: string;
  canWrite: boolean;
  commissionPercent: number;
  totalDisbursed: number;
  disbursedStudentCount: number;
  commissionEarned: number;
  commissionSettled: number;
  commissionPending: number;
  settlements: SettlementEntry[];
  studentCommissions: PartnerStudentCommissionRow[];
  ledger: PartnerCommissionLedger;
  initialTab?: "summary" | "students" | "ledger";
}

export function PartnerCommissionSection({
  partnerId,
  canWrite,
  commissionPercent,
  totalDisbursed,
  disbursedStudentCount,
  commissionEarned,
  commissionSettled,
  commissionPending,
  settlements,
  studentCommissions,
  ledger,
  initialTab = "summary",
}: PartnerCommissionSectionProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const tab =
    initialTab === "students" ? "students" : initialTab === "ledger" ? "ledger" : "summary";

  async function handleSettlementSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    const formData = new FormData(form);
    const result = await recordPartnerCommissionSettlementAction(partnerId, formData);

    if (result.success) {
      notify.success("Commission settlement recorded");
      form.reset();
      router.refresh();
    } else {
      notify.error(result.error ?? "Failed to record settlement");
    }
    setLoading(false);
  }

  async function handleExport(format: "csv" | "pdf", month?: string) {
    const result = await exportPartnerCommissionAction(partnerId, format, month);
    if (result.success && result.data) {
      downloadBase64File(result.data.filename, result.data.mimeType, result.data.data);
      notify.success(`${format.toUpperCase()} exported`);
    } else {
      notify.error(result.error ?? "Export failed");
    }
  }

  return (
    <Tabs defaultValue={tab} className="space-y-4">
      <TabsList className="flex h-auto flex-wrap">
        <TabsTrigger value="summary">Commission Summary</TabsTrigger>
        <TabsTrigger value="students">Student-wise Breakdown</TabsTrigger>
        <TabsTrigger value="ledger">Monthly Ledger</TabsTrigger>
      </TabsList>

      <TabsContent value="summary" className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <GlassCard className="p-4">
            <p className="text-xs text-muted-foreground">Commission Rate</p>
            <p className="text-2xl font-semibold">{formatPercent(commissionPercent)}</p>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="text-xs text-muted-foreground">Total Disbursed</p>
            <p className="text-2xl font-semibold">{formatCurrency(totalDisbursed)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {disbursedStudentCount} disbursed student{disbursedStudentCount === 1 ? "" : "s"}
            </p>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="text-xs text-muted-foreground">Total Commission Earned</p>
            <p className="text-2xl font-semibold text-[#6D5EF7]">{formatCurrency(commissionEarned)}</p>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="text-xs text-muted-foreground">Commission Settled</p>
            <p className="text-2xl font-semibold text-[#22C55E]">{formatCurrency(commissionSettled)}</p>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="text-xs text-muted-foreground">Pending Commission</p>
            <p className="text-2xl font-semibold text-[#F59E0B]">{formatCurrency(commissionPending)}</p>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="text-xs text-muted-foreground">Settlement Progress</p>
            <p className="text-2xl font-semibold">
              {commissionEarned > 0
                ? formatPercent(Math.min(100, (commissionSettled / commissionEarned) * 100))
                : "0%"}
            </p>
          </GlassCard>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport("csv")}>
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("pdf")}>
            Export PDF
          </Button>
        </div>

        {canWrite && commissionPending > 0 && (
          <GlassCard className="p-5">
            <h3 className="mb-1 text-sm font-semibold">Record Bulk Settlement</h3>
            <p className="mb-4 text-xs text-muted-foreground">
              For precise tracking, use <strong>Mark Paid</strong> on individual students in the
              Student-wise tab. Bulk settlement is kept for legacy lump-sum payments.
            </p>
            <form onSubmit={handleSettlementSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="settlementAmount">Settlement Amount (INR)</Label>
                <Input
                  id="settlementAmount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min={0.01}
                  max={commissionPending}
                  inputMode="decimal"
                  placeholder={`Up to ${commissionPending.toLocaleString("en-IN")}`}
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="settlementNote">Note (optional)</Label>
                <Textarea
                  id="settlementNote"
                  name="note"
                  rows={2}
                  placeholder="UPI ref, invoice no., payment date, etc."
                />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Record Bulk Settlement"}
                </Button>
              </div>
            </form>
          </GlassCard>
        )}

        {settlements.length > 0 && (
          <GlassCard className="p-5">
            <h3 className="mb-4 text-sm font-semibold">Recent Settlements</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Recorded By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settlements.map((entry, index) => (
                  <TableRow key={`${entry.settledAt}-${index}`}>
                    <TableCell>
                      {entry.settledAt ? formatDateTime(entry.settledAt) : "—"}
                    </TableCell>
                    <TableCell>{entry.studentName ?? "Bulk / partner-level"}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(entry.amount)}</TableCell>
                    <TableCell className="max-w-xs truncate">{entry.note ?? "—"}</TableCell>
                    <TableCell>{entry.settledByName ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </GlassCard>
        )}
      </TabsContent>

      <TabsContent value="students" className="space-y-4">
        <GlassCard className="p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold">Student-wise Commission & Payout</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Settle each student individually, or override the commission rate for special cases.
            </p>
          </div>
          <PartnerStudentCommissionTable
            partnerId={partnerId}
            defaultCommissionPercent={commissionPercent}
            rows={studentCommissions}
            canWrite={canWrite}
          />
        </GlassCard>
      </TabsContent>

      <TabsContent value="ledger">
        <PartnerCommissionLedgerPanel
          partnerId={partnerId}
          initialLedger={ledger}
          onExport={handleExport}
        />
      </TabsContent>
    </Tabs>
  );
}
