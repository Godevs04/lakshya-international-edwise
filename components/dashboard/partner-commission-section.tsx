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
import { formatCurrency, formatDateTime, formatPercent } from "@/lib/utils/format";
import { recordPartnerCommissionSettlementAction } from "@/lib/actions/partner.actions";

interface SettlementEntry {
  amount: number;
  note?: string;
  settledAt?: Date | string;
  settledByName?: string;
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
  initialTab?: "summary" | "students";
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
  initialTab = "summary",
}: PartnerCommissionSectionProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const tab = initialTab === "students" ? "students" : "summary";

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

  return (
    <Tabs defaultValue={tab} className="space-y-4">
      <TabsList>
        <TabsTrigger value="summary">Commission Summary</TabsTrigger>
        <TabsTrigger value="students">Student-wise Breakdown</TabsTrigger>
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
            <p className="mt-1 text-xs text-muted-foreground">
              {formatCurrency(totalDisbursed)} × {formatPercent(commissionPercent)}
            </p>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="text-xs text-muted-foreground">Commission Settled</p>
            <p className="text-2xl font-semibold text-[#22C55E]">{formatCurrency(commissionSettled)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Paid to partner</p>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="text-xs text-muted-foreground">Pending Commission</p>
            <p className="text-2xl font-semibold text-[#F59E0B]">{formatCurrency(commissionPending)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Earned − settled</p>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="text-xs text-muted-foreground">Settlement Progress</p>
            <p className="text-2xl font-semibold">
              {commissionEarned > 0
                ? formatPercent(Math.min(100, (commissionSettled / commissionEarned) * 100))
                : "0%"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Of total commission earned</p>
          </GlassCard>
        </div>

        {canWrite && commissionPending > 0 && (
          <GlassCard className="p-5">
            <h3 className="mb-4 text-sm font-semibold">Record Commission Settlement</h3>
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
                  {loading ? "Saving..." : "Record Settlement"}
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
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold">Student-wise Commission & Payout</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Per-student commission from disbursed loans. Settled amounts are allocated
                proportionally from partner-level payments.
              </p>
            </div>
          </div>
          <PartnerStudentCommissionTable rows={studentCommissions} />
        </GlassCard>
      </TabsContent>
    </Tabs>
  );
}
