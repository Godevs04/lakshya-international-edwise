"use client";

import { useState, useTransition } from "react";
import { notify } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GlassCard } from "@/components/cards/glass-card";
import { formatCurrency, formatDateTime } from "@/lib/utils/format";
import { getPartnerCommissionLedgerAction } from "@/lib/actions/partner.actions";
import type { PartnerCommissionLedger } from "@/lib/services/partner-commission.service";
import { Download, FileText, Loader2 } from "lucide-react";

function downloadBase64File(filename: string, mimeType: string, base64: string) {
  const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
  const blob = new Blob([bytes], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

interface PartnerCommissionLedgerPanelProps {
  partnerId: string;
  initialLedger: PartnerCommissionLedger;
  onExport: (format: "csv" | "pdf", month?: string) => Promise<void>;
}

export function PartnerCommissionLedgerPanel({
  partnerId,
  initialLedger,
  onExport,
}: PartnerCommissionLedgerPanelProps) {
  const [month, setMonth] = useState("");
  const [ledger, setLedger] = useState(initialLedger);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState<"csv" | "pdf" | null>(null);
  const [, startTransition] = useTransition();

  function handleMonthChange(value: string) {
    setMonth(value);
    setLoading(true);
    startTransition(async () => {
      const nextLedger = await getPartnerCommissionLedgerAction(partnerId, value);
      if (nextLedger) setLedger(nextLedger);
      setLoading(false);
    });
  }

  async function handleExport(format: "csv" | "pdf") {
    setExporting(format);
    try {
      await onExport(format, month || undefined);
    } finally {
      setExporting(null);
    }
  }

  return (
    <div className="space-y-4">
      <GlassCard className="p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <Label htmlFor="ledgerMonth">Filter by month</Label>
            <Input
              id="ledgerMonth"
              type="month"
              value={month}
              onChange={(e) => handleMonthChange(e.target.value)}
              className="w-full max-w-xs"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={exporting !== null}
              onClick={() => handleExport("csv")}
            >
              {exporting === "csv" ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-1.5 h-4 w-4" />
              )}
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={exporting !== null}
              onClick={() => handleExport("pdf")}
            >
              {exporting === "pdf" ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-1.5 h-4 w-4" />
              )}
              Export PDF
            </Button>
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-4 sm:grid-cols-3">
        <GlassCard className="p-4">
          <p className="text-xs text-muted-foreground">
            {month ? "Earned in month" : "Total earned"}
          </p>
          <p className="text-2xl font-semibold text-[#6D5EF7]">
            {formatCurrency(month ? ledger.earnedInMonth : ledger.commissionEarnedTotal)}
          </p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-xs text-muted-foreground">
            {month ? "Settled in month" : "Total settled"}
          </p>
          <p className="text-2xl font-semibold text-[#22C55E]">
            {formatCurrency(month ? ledger.settledInMonth : ledger.commissionSettledTotal)}
          </p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-xs text-muted-foreground">Pending payout</p>
          <p className="text-2xl font-semibold text-[#F59E0B]">
            {formatCurrency(ledger.commissionPendingTotal)}
          </p>
        </GlassCard>
      </div>

      <GlassCard className="overflow-hidden p-0">
        {loading ? (
          <div className="flex h-40 items-center justify-center text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading ledger...
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Recorded By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ledger.entries.length ? (
                ledger.entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{formatDateTime(entry.date)}</TableCell>
                    <TableCell className="capitalize">{entry.type}</TableCell>
                    <TableCell>
                      {entry.studentName ? (
                        <>
                          <p className="font-medium">{entry.studentName}</p>
                          <p className="text-xs text-muted-foreground">{entry.studentId}</p>
                        </>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell
                      className={
                        entry.type === "settlement" ? "text-[#22C55E]" : "text-[#6D5EF7]"
                      }
                    >
                      {formatCurrency(entry.amount)}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{entry.note ?? "—"}</TableCell>
                    <TableCell>{entry.settledByName ?? "—"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No ledger entries for this period.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </GlassCard>
    </div>
  );
}

export { downloadBase64File };
