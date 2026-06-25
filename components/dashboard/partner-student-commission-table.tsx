"use client";

import { useMemo, useState } from "react";
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
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import { updateStudentCommissionRateAction } from "@/lib/actions/partner.actions";
import type { StudentCommissionRow } from "@/lib/services/partner-commission.service";
import type { StudentStatus } from "@/lib/constants/statuses";
import type { CommissionStatusFilter } from "@/lib/constants/commission-status";
import { filterCommissionRows } from "@/lib/utils/commission-status-filter";
import {
  CommissionMarkDialog,
  type CommissionMarkType,
} from "@/components/dashboard/commission-mark-dialog";
import { CommissionStatusFilter as CommissionStatusFilterControl } from "@/components/dashboard/commission-status-filter";
import { CheckCircle2, Pencil, Wallet } from "lucide-react";

export type PartnerStudentCommissionRow = StudentCommissionRow;

interface PartnerStudentCommissionTableProps {
  partnerId: string;
  defaultCommissionPercent: number;
  rows: PartnerStudentCommissionRow[];
  canWrite?: boolean;
  showTotals?: boolean;
  statusFilter?: CommissionStatusFilter;
  showStatusFilter?: boolean;
}

export function PartnerStudentCommissionTable({
  partnerId,
  defaultCommissionPercent,
  rows,
  canWrite = false,
  showTotals = true,
  statusFilter = "all",
  showStatusFilter = false,
}: PartnerStudentCommissionTableProps) {
  const router = useRouter();
  const [pendingStudentId, setPendingStudentId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<{
    studentId: string;
    field: "our" | "partner";
  } | null>(null);
  const [rateDraft, setRateDraft] = useState("");
  const [markDialog, setMarkDialog] = useState<{
    open: boolean;
    type: CommissionMarkType;
    student: PartnerStudentCommissionRow;
  } | null>(null);

  const filteredRows = useMemo(
    () => filterCommissionRows(rows, statusFilter),
    [rows, statusFilter]
  );

  const totals = filteredRows.reduce(
    (acc, row) => ({
      disbursed: acc.disbursed + row.disbursed,
      commissionExpected: acc.commissionExpected + row.commissionExpected,
      commissionReceived: acc.commissionReceived + row.commissionReceived,
      pendingReceived: acc.pendingReceived + row.pendingReceived,
      partnerShareExpected: acc.partnerShareExpected + row.partnerShareExpected,
      commissionShared: acc.commissionShared + row.commissionShared,
      pendingShared: acc.pendingShared + row.pendingShared,
      projectedNetEarned: acc.projectedNetEarned + row.projectedNetEarned,
      commissionEarned: acc.commissionEarned + row.commissionEarned,
    }),
    {
      disbursed: 0,
      commissionExpected: 0,
      commissionReceived: 0,
      pendingReceived: 0,
      partnerShareExpected: 0,
      commissionShared: 0,
      pendingShared: 0,
      projectedNetEarned: 0,
      commissionEarned: 0,
    }
  );

  function openMarkDialog(type: CommissionMarkType, student: PartnerStudentCommissionRow) {
    setMarkDialog({ open: true, type, student });
  }

  async function handleSaveRate(
    student: PartnerStudentCommissionRow,
    field: "our" | "partner"
  ) {
    setPendingStudentId(student.studentDbId);
    const formData = new FormData();
    if (field === "our") {
      formData.set("ourCommissionPercent", rateDraft.trim());
    } else {
      formData.set("commissionPercentOverride", rateDraft.trim());
    }

    const result = await updateStudentCommissionRateAction(
      partnerId,
      student.studentDbId,
      formData
    );

    if (result.success) {
      notify.success(
        field === "our" ? "Our commission rate updated" : "Partner share rate updated"
      );
      setEditingField(null);
      router.refresh();
    } else {
      notify.error(result.error ?? "Failed to update rate");
    }
    setPendingStudentId(null);
  }

  function renderRateEditor(
    student: PartnerStudentCommissionRow,
    field: "our" | "partner"
  ) {
    const isEditing =
      editingField?.studentId === student.studentDbId && editingField.field === field;

    if (isEditing) {
      return (
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
            disabled={pendingStudentId === student.studentDbId}
            onClick={() => handleSaveRate(student, field)}
          >
            Save
          </Button>
        </div>
      );
    }

    const label =
      field === "our"
        ? formatPercent(student.ourCommissionPercent)
        : formatPercent(student.partnerSharePercent);

    return (
      <div className="flex items-center gap-2">
        <span>
          {label}
          {field === "partner" && student.partnerSharePercentOverride != null && (
            <span className="ml-1 text-[10px] text-[#E8952E]">custom</span>
          )}
        </span>
        {canWrite && (
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground"
            aria-label={
              field === "our"
                ? `Edit our commission for ${student.studentName}`
                : `Edit partner share for ${student.studentName}`
            }
            onClick={() => {
              setEditingField({ studentId: student.studentDbId, field });
              setRateDraft(
                field === "our"
                  ? student.ourCommissionPercent
                    ? String(student.ourCommissionPercent)
                    : ""
                  : student.partnerSharePercentOverride != null
                    ? String(student.partnerSharePercentOverride)
                    : ""
              );
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 overflow-x-auto">
      <GlassHelp />

      {showStatusFilter ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium">Filter students</p>
            <p className="text-xs text-muted-foreground">
              Pending, partial, and complete received/paid states
            </p>
          </div>
          <CommissionStatusFilterControl />
        </div>
      ) : null}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Our %</TableHead>
            <TableHead>Partner %</TableHead>
            <TableHead>Disbursed</TableHead>
            <TableHead>Expected</TableHead>
            <TableHead>Share Exp.</TableHead>
            <TableHead>Proj. Net</TableHead>
            <TableHead>Received</TableHead>
            <TableHead>Paid</TableHead>
            <TableHead>Pend. Rcvd</TableHead>
            <TableHead>Pend. Paid</TableHead>
            <TableHead>Net</TableHead>
            {canWrite && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRows.length ? (
            <>
              {filteredRows.map((row) => (
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
                  <TableCell>{renderRateEditor(row, "our")}</TableCell>
                  <TableCell>
                    {renderRateEditor(row, "partner")}
                    {row.partnerSharePercentOverride == null && (
                      <p className="text-[10px] text-muted-foreground">
                        Default {formatPercent(defaultCommissionPercent)}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>{formatCurrency(row.disbursed)}</TableCell>
                  <TableCell>{formatCurrency(row.commissionExpected)}</TableCell>
                  <TableCell>{formatCurrency(row.partnerShareExpected)}</TableCell>
                  <TableCell className="text-[#E8952E]">
                    {formatCurrency(row.projectedNetEarned)}
                  </TableCell>
                  <TableCell className="text-[#22C55E]">{formatCurrency(row.commissionReceived)}</TableCell>
                  <TableCell className="text-[#22C55E]">{formatCurrency(row.commissionShared)}</TableCell>
                  <TableCell className="text-[#F59E0B]">{formatCurrency(row.pendingReceived)}</TableCell>
                  <TableCell className="text-[#F59E0B]">{formatCurrency(row.pendingShared)}</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(row.commissionEarned)}
                  </TableCell>
                  {canWrite && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={
                            row.pendingReceived <= 0 || pendingStudentId === row.studentDbId
                          }
                          onClick={() => openMarkDialog("received", row)}
                        >
                          <Wallet className="mr-1 h-3.5 w-3.5" />
                          Received
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={
                            row.pendingShared <= 0 || pendingStudentId === row.studentDbId
                          }
                          onClick={() => openMarkDialog("paid", row)}
                        >
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                          Paid
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {showTotals && (
                <TableRow className="bg-muted/30 font-semibold">
                  <TableCell colSpan={4}>Total</TableCell>
                  <TableCell>{formatCurrency(totals.disbursed)}</TableCell>
                  <TableCell>{formatCurrency(totals.commissionExpected)}</TableCell>
                  <TableCell>{formatCurrency(totals.partnerShareExpected)}</TableCell>
                  <TableCell>{formatCurrency(totals.projectedNetEarned)}</TableCell>
                  <TableCell>{formatCurrency(totals.commissionReceived)}</TableCell>
                  <TableCell>{formatCurrency(totals.commissionShared)}</TableCell>
                  <TableCell>{formatCurrency(totals.pendingReceived)}</TableCell>
                  <TableCell>{formatCurrency(totals.pendingShared)}</TableCell>
                  <TableCell>{formatCurrency(totals.commissionEarned)}</TableCell>
                  {canWrite && <TableCell />}
                </TableRow>
              )}
            </>
          ) : (
            <TableRow>
              <TableCell
                colSpan={canWrite ? 14 : 13}
                className="h-24 text-center text-muted-foreground"
              >
                {rows.length
                  ? "No students match this filter."
                  : "No linked students for commission breakdown."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {markDialog ? (
        <CommissionMarkDialog
          open={markDialog.open}
          onOpenChange={(open) => setMarkDialog(open ? markDialog : null)}
          partnerId={partnerId}
          studentDbId={markDialog.student.studentDbId}
          studentName={markDialog.student.studentName}
          type={markDialog.type}
          pendingAmount={
            markDialog.type === "received"
              ? markDialog.student.pendingReceived
              : markDialog.student.pendingShared
          }
        />
      ) : null}
    </div>
  );
}

function GlassHelp() {
  return (
    <div className="rounded-xl border border-[#E8952E]/15 bg-[#E8952E]/5 p-4 text-sm">
      <p className="font-medium text-[#E8952E]">Where to mark received & paid</p>
      <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
        <li>
          <strong>Received</strong> — money from lender/bank (use Actions → Received; full or partial amount)
        </li>
        <li>
          <strong>Paid</strong> — money paid to partner (use Actions → Paid; full or partial amount)
        </li>
        <li>
          Click the pencil on <strong>Our %</strong> or <strong>Partner %</strong> to update rates per student
        </li>
        <li>
          Expected, share, and pending columns update automatically from disbursement + rates
        </li>
        <li>
          All-partner filter:{" "}
          <Link href="/dashboard/partners/commissions" className="text-primary underline">
            Partners → Partner Commissions
          </Link>
        </li>
      </ul>
    </div>
  );
}
