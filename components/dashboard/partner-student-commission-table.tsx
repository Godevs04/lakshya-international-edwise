"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import {
  recordStudentCommissionSettlementAction,
  updateStudentCommissionRateAction,
} from "@/lib/actions/partner.actions";
import type { StudentStatus } from "@/lib/constants/statuses";
import { CheckCircle2, Pencil } from "lucide-react";

export interface PartnerStudentCommissionRow {
  studentDbId: string;
  studentId: string;
  studentName: string;
  status: string;
  disbursed: number;
  disbursedAt?: Date | string | null;
  commissionPercent: number;
  commissionPercentOverride?: number | null;
  commissionEarned: number;
  commissionSettled: number;
  commissionPending: number;
}

interface PartnerStudentCommissionTableProps {
  partnerId: string;
  defaultCommissionPercent: number;
  rows: PartnerStudentCommissionRow[];
  canWrite?: boolean;
  showTotals?: boolean;
}

export function PartnerStudentCommissionTable({
  partnerId,
  defaultCommissionPercent,
  rows,
  canWrite = false,
  showTotals = true,
}: PartnerStudentCommissionTableProps) {
  const router = useRouter();
  const [pendingStudentId, setPendingStudentId] = useState<string | null>(null);
  const [editingRateId, setEditingRateId] = useState<string | null>(null);
  const [rateDraft, setRateDraft] = useState("");

  const totals = rows.reduce(
    (acc, row) => ({
      disbursed: acc.disbursed + row.disbursed,
      commissionEarned: acc.commissionEarned + row.commissionEarned,
      commissionSettled: acc.commissionSettled + row.commissionSettled,
      commissionPending: acc.commissionPending + row.commissionPending,
    }),
    { disbursed: 0, commissionEarned: 0, commissionSettled: 0, commissionPending: 0 }
  );

  async function handleMarkPaid(student: PartnerStudentCommissionRow) {
    if (student.commissionPending <= 0) return;
    setPendingStudentId(student.studentDbId);
    const formData = new FormData();
    formData.set("amount", String(student.commissionPending));
    formData.set("note", "Marked as paid");

    const result = await recordStudentCommissionSettlementAction(
      partnerId,
      student.studentDbId,
      formData
    );

    if (result.success) {
      notify.success(`${student.studentName} marked as paid`);
      router.refresh();
    } else {
      notify.error(result.error ?? "Failed to record settlement");
    }
    setPendingStudentId(null);
  }

  async function handleSaveRate(student: PartnerStudentCommissionRow) {
    setPendingStudentId(student.studentDbId);
    const formData = new FormData();
    formData.set("commissionPercentOverride", rateDraft.trim());

    const result = await updateStudentCommissionRateAction(
      partnerId,
      student.studentDbId,
      formData
    );

    if (result.success) {
      notify.success("Commission rate updated");
      setEditingRateId(null);
      router.refresh();
    } else {
      notify.error(result.error ?? "Failed to update rate");
    }
    setPendingStudentId(null);
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Rate</TableHead>
          <TableHead>Disbursed</TableHead>
          <TableHead>Commission</TableHead>
          <TableHead>Settled</TableHead>
          <TableHead>Pending</TableHead>
          {canWrite && <TableHead className="text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length ? (
          <>
            {rows.map((row) => (
              <TableRow key={row.studentDbId}>
                <TableCell>
                  <Link
                    href={`/dashboard/students/${row.studentDbId}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {row.studentName}
                  </Link>
                  <p className="text-xs text-muted-foreground">{row.studentId}</p>
                </TableCell>
                <TableCell>
                  <StatusBadge status={row.status as StudentStatus} />
                </TableCell>
                <TableCell>
                  {editingRateId === row.studentDbId ? (
                    <div className="flex min-w-[120px] items-center gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        max={100}
                        value={rateDraft}
                        onChange={(e) => setRateDraft(e.target.value)}
                        className="h-8 w-20"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={pendingStudentId === row.studentDbId}
                        onClick={() => handleSaveRate(row)}
                      >
                        Save
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>
                        {formatPercent(row.commissionPercent)}
                        {row.commissionPercentOverride != null && (
                          <span className="ml-1 text-[10px] text-[#6D5EF7]">custom</span>
                        )}
                      </span>
                      {canWrite && (
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground"
                          aria-label={`Edit commission rate for ${row.studentName}`}
                          onClick={() => {
                            setEditingRateId(row.studentDbId);
                            setRateDraft(
                              row.commissionPercentOverride != null
                                ? String(row.commissionPercentOverride)
                                : ""
                            );
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                  {row.commissionPercentOverride == null && (
                    <p className="text-[10px] text-muted-foreground">
                      Default {formatPercent(defaultCommissionPercent)}
                    </p>
                  )}
                </TableCell>
                <TableCell>{formatCurrency(row.disbursed)}</TableCell>
                <TableCell className="font-medium text-[#6D5EF7]">
                  {formatCurrency(row.commissionEarned)}
                </TableCell>
                <TableCell className="text-[#22C55E]">
                  {formatCurrency(row.commissionSettled)}
                </TableCell>
                <TableCell className="text-[#F59E0B]">
                  {formatCurrency(row.commissionPending)}
                </TableCell>
                {canWrite && (
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={
                        row.commissionPending <= 0 || pendingStudentId === row.studentDbId
                      }
                      onClick={() => handleMarkPaid(row)}
                    >
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                      Mark Paid
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {showTotals && (
              <TableRow className="bg-muted/30 font-semibold">
                <TableCell colSpan={3}>Total</TableCell>
                <TableCell>{formatCurrency(totals.disbursed)}</TableCell>
                <TableCell>{formatCurrency(totals.commissionEarned)}</TableCell>
                <TableCell>{formatCurrency(totals.commissionSettled)}</TableCell>
                <TableCell>{formatCurrency(totals.commissionPending)}</TableCell>
                {canWrite && <TableCell />}
              </TableRow>
            )}
          </>
        ) : (
          <TableRow>
            <TableCell colSpan={canWrite ? 8 : 7} className="h-24 text-center text-muted-foreground">
              No linked students for commission breakdown.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
