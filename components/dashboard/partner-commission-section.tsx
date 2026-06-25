"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  commissionExpected?: number;
  commissionReceived?: number;
  pendingReceived?: number;
  partnerShareExpected?: number;
  commissionShared?: number;
  pendingShared?: number;
  projectedNetEarned?: number;
  commissionEarned: number;
  commissionSettled: number;
  commissionPending: number;
  settlements: SettlementEntry[];
  studentCommissions: PartnerStudentCommissionRow[];
  ledger: PartnerCommissionLedger;
  initialTab?: "summary" | "students" | "ledger";
  statusFilter?: import("@/lib/constants/commission-status").CommissionStatusFilter;
}

type CommissionTab = "summary" | "students" | "ledger";

function resolveCommissionTab(value: string | null | undefined): CommissionTab {
  if (value === "students") return "students";
  if (value === "ledger") return "ledger";
  return "summary";
}

export function PartnerCommissionSection({
  partnerId,
  canWrite,
  commissionPercent,
  totalDisbursed,
  disbursedStudentCount,
  commissionExpected = 0,
  commissionReceived = 0,
  pendingReceived = 0,
  partnerShareExpected = 0,
  commissionShared = 0,
  pendingShared = 0,
  projectedNetEarned = 0,
  commissionEarned,
  commissionSettled,
  commissionPending,
  settlements,
  studentCommissions,
  ledger,
  initialTab = "summary",
  statusFilter = "all",
}: PartnerCommissionSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const tab = resolveCommissionTab(searchParams.get("tab") ?? initialTab);

  function handleTabChange(value: string | null) {
    if (!value) return;
    const next = new URLSearchParams(searchParams.toString());
    if (value === "summary") {
      next.delete("tab");
    } else {
      next.set("tab", value);
    }
    const query = next.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

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
    <Tabs value={tab} onValueChange={handleTabChange} className="space-y-4">
      <TabsList className="flex h-auto flex-wrap">
        <TabsTrigger value="summary">Commission Summary</TabsTrigger>
        <TabsTrigger value="students">Student-wise Breakdown</TabsTrigger>
        <TabsTrigger value="ledger">Monthly Ledger</TabsTrigger>
      </TabsList>

      <TabsContent value="summary" className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <GlassCard className="p-4">
            <p className="text-xs text-muted-foreground">Partner Share Rate</p>
            <p className="text-2xl font-semibold">{formatPercent(commissionPercent)}</p>
            <p className="mt-1 text-xs text-muted-foreground">% of disbursement</p>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="text-xs text-muted-foreground">Total Disbursed</p>
            <p className="text-2xl font-semibold">{formatCurrency(totalDisbursed)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {disbursedStudentCount} disbursed student{disbursedStudentCount === 1 ? "" : "s"}
            </p>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="text-xs text-muted-foreground">Commission Expected</p>
            <p className="text-2xl font-semibold">{formatCurrency(commissionExpected)}</p>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="text-xs text-muted-foreground">Commission Received</p>
            <p className="text-2xl font-semibold text-[#22C55E]">{formatCurrency(commissionReceived)}</p>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="text-xs text-muted-foreground">Pending Received</p>
            <p className="text-2xl font-semibold text-[#F59E0B]">{formatCurrency(pendingReceived)}</p>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="text-xs text-muted-foreground">Partner Share Expected</p>
            <p className="text-2xl font-semibold">{formatCurrency(partnerShareExpected)}</p>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="text-xs text-muted-foreground">Commission Shared</p>
            <p className="text-2xl font-semibold text-[#22C55E]">{formatCurrency(commissionShared || commissionSettled)}</p>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="text-xs text-muted-foreground">Pending Shared</p>
            <p className="text-2xl font-semibold text-[#F59E0B]">{formatCurrency(pendingShared || commissionPending)}</p>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="text-xs text-muted-foreground">Projected Net (auto)</p>
            <p className="text-2xl font-semibold text-[#E8952E]">{formatCurrency(projectedNetEarned)}</p>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="text-xs text-muted-foreground">Net Earned (after marks)</p>
            <p className="text-2xl font-semibold">{formatCurrency(commissionEarned)}</p>
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

        {canWrite && (pendingShared || commissionPending) > 0 && (
          <GlassCard className="p-5">
            <h3 className="mb-1 text-sm font-semibold">Record Bulk Partner Share</h3>
            <p className="mb-4 text-xs text-muted-foreground">
              Amounts are calculated automatically. Use per-student <strong>Received</strong> and <strong>Paid</strong> buttons in the Student-wise tab.
              Bulk entry below is only for legacy lump-sum partner payments.
            </p>
            <form onSubmit={handleSettlementSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="settlementAmount">Shared Amount (INR)</Label>
                <Input
                  id="settlementAmount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min={0.01}
                  max={pendingShared || commissionPending}
                  inputMode="decimal"
                  placeholder={`Up to ${(pendingShared || commissionPending).toLocaleString("en-IN")}`}
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
            <h3 className="mb-4 text-sm font-semibold">Recent Partner Share Payments</h3>
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
              Mark commission received from lender and partner share paid per student.
            </p>
          </div>
          <PartnerStudentCommissionTable
            partnerId={partnerId}
            defaultCommissionPercent={commissionPercent}
            rows={studentCommissions}
            canWrite={canWrite}
            statusFilter={statusFilter}
            showStatusFilter
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
