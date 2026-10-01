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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import { updateStudentCommissionRateAction } from "@/lib/actions/partner.actions";
import type { StudentCommissionRow } from "@/lib/services/partner-commission.service";
import type { StudentStatus } from "@/lib/constants/statuses";
import type { CommissionStatusFilter } from "@/lib/constants/commission-status";
import { filterCommissionRows } from "@/lib/utils/commission-status-filter";
import { CommissionStatusFilter as CommissionStatusFilterControl } from "@/components/dashboard/commission-status-filter";
import { AgreedNetPayableDialog } from "@/components/dashboard/agreed-net-payable-dialog";
import {
  isStudentPayoutComplete,
  resolveDisplayedFinalNet,
} from "@/lib/utils/commission-calculations";
import { CheckCircle2, Pencil, Search } from "lucide-react";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [payableStudent, setPayableStudent] = useState<PartnerStudentCommissionRow | null>(null);

  const filteredRows = useMemo(() => {
    const statusFiltered = filterCommissionRows(rows, statusFilter);
    const query = searchQuery.trim().toLowerCase();
    if (!query) return statusFiltered;

    return statusFiltered.filter((row) => {
      const haystack = `${row.studentName} ${row.studentId}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [rows, statusFilter, searchQuery]);

  const totals = filteredRows.reduce(
    (acc, row) => ({
      disbursed: acc.disbursed + row.disbursed,
      commissionExpected: acc.commissionExpected + row.commissionExpected,
      commissionReceived: acc.commissionReceived + row.commissionReceived,
      pendingReceived: acc.pendingReceived + row.pendingReceived,
      partnerShareExpected: acc.partnerShareExpected + row.partnerShareExpected,
      tdsAmount: acc.tdsAmount + row.tdsAmount,
      netPayableToPartner: acc.netPayableToPartner + row.netPayableToPartner,
      calculatedNetPayable: acc.calculatedNetPayable + row.calculatedNetPayable,
      retainedAmount: acc.retainedAmount + row.retainedAmount,
      commissionShared: acc.commissionShared + row.commissionShared,
      paidCash: acc.paidCash + row.paidCash,
      finalNet:
        acc.finalNet +
        resolveDisplayedFinalNet(
          row.partnerShareExpected,
          row.netPayableToPartner,
          row.retainedAmount
        ),
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
      tdsAmount: 0,
      netPayableToPartner: 0,
      calculatedNetPayable: 0,
      retainedAmount: 0,
      commissionShared: 0,
      paidCash: 0,
      finalNet: 0,
      pendingShared: 0,
      projectedNetEarned: 0,
      commissionEarned: 0,
    }
  );

  async function handleSaveRate(student: PartnerStudentCommissionRow, field: "our" | "partner") {
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

  function renderRateEditor(student: PartnerStudentCommissionRow, field: "our" | "partner") {
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
            <span className="ml-1 text-[10px] text-[#0B8FD8]">custom</span>
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

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium">Filter students</p>
          <p className="text-xs text-muted-foreground">
            Search by name or ID
            {showStatusFilter ? ", then narrow by payout status" : ""}
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end lg:w-auto">
          <div className="w-full space-y-2 sm:max-w-xs">
            <Label htmlFor="student-commission-search">Search</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="student-commission-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by name or ID..."
                className="pl-9"
                autoComplete="off"
              />
            </div>
          </div>
          {showStatusFilter ? <CommissionStatusFilterControl /> : null}
        </div>
      </div>

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
            <TableHead>TDS 2%</TableHead>
            <TableHead>Net Payable</TableHead>
            <TableHead>Proj. Net</TableHead>
            <TableHead>Received</TableHead>
            <TableHead>Paid</TableHead>
            <TableHead>Final Net</TableHead>
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
                  <TableCell>{formatCurrency(row.tdsAmount)}</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(row.calculatedNetPayable)}
                  </TableCell>
                  <TableCell className="text-[#0B8FD8]">
                    {formatCurrency(row.projectedNetEarned)}
                  </TableCell>
                  <TableCell className="text-[#22C55E]">
                    {formatCurrency(row.commissionReceived)}
                  </TableCell>
                  <TableCell className="text-[#22C55E]">
                    <div className="flex items-start gap-2">
                      <span>{formatCurrency(row.paidCash)}</span>
                      {canWrite ? (
                        <button
                          type="button"
                          className="mt-0.5 text-muted-foreground hover:text-foreground"
                          aria-label={`Edit paid amount for ${row.studentName}`}
                          onClick={() => setPayableStudent(row)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-start gap-2">
                      <div>
                        <p>
                          {formatCurrency(
                            resolveDisplayedFinalNet(
                              row.partnerShareExpected,
                              row.netPayableToPartner,
                              row.retainedAmount
                            )
                          )}
                        </p>
                        {row.retainedAmount > 0 ? (
                          <p className="text-[10px] text-[#0D9488]">
                            kept {formatCurrency(row.retainedAmount)}
                          </p>
                        ) : null}
                      </div>
                      {canWrite ? (
                        <button
                          type="button"
                          className="mt-0.5 text-muted-foreground hover:text-foreground"
                          aria-label={`Edit final net for ${row.studentName}`}
                          onClick={() => setPayableStudent(row)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      ) : null}
                    </div>
                  </TableCell>
                  {canWrite && (
                    <TableCell className="text-right">
                      {isStudentPayoutComplete(
                        row.partnerShareExpected,
                        row.pendingShared,
                        row.paidCash
                      ) ? (
                        <Badge className="border-transparent bg-[#22C55E]/15 text-[#22C55E]">
                          <CheckCircle2 data-icon="inline-start" />
                          Completed
                        </Badge>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <Badge variant="outline" className="text-muted-foreground">
                            Pending
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={
                              row.calculatedNetPayable <= 0 || pendingStudentId === row.studentDbId
                            }
                            onClick={() => setPayableStudent(row)}
                          >
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                            Complete
                          </Button>
                        </div>
                      )}
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
                  <TableCell>{formatCurrency(totals.tdsAmount)}</TableCell>
                  <TableCell>{formatCurrency(totals.calculatedNetPayable)}</TableCell>
                  <TableCell>{formatCurrency(totals.projectedNetEarned)}</TableCell>
                  <TableCell>{formatCurrency(totals.commissionReceived)}</TableCell>
                  <TableCell>{formatCurrency(totals.paidCash)}</TableCell>
                  <TableCell>
                    {formatCurrency(totals.finalNet)}
                    {totals.retainedAmount > 0 ? (
                      <p className="text-[10px] font-medium text-[#0D9488]">
                        kept {formatCurrency(totals.retainedAmount)}
                      </p>
                    ) : null}
                  </TableCell>
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
                  ? searchQuery.trim()
                    ? "No students match this search."
                    : "No students match this filter."
                  : "No linked students for commission breakdown."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {payableStudent ? (
        <AgreedNetPayableDialog
          open
          onOpenChange={(open) => {
            if (!open) setPayableStudent(null);
          }}
          partnerId={partnerId}
          studentDbId={payableStudent.studentDbId}
          studentName={payableStudent.studentName}
          calculatedNet={payableStudent.calculatedNetPayable}
          paidCash={payableStudent.paidCash}
          existingNote={payableStudent.agreedNetPayableNote}
        />
      ) : null}
    </div>
  );
}

function GlassHelp() {
  return (
    <div className="rounded-xl border border-[#0B8FD8]/15 bg-[#0B8FD8]/5 p-4 text-sm">
      <p className="font-medium text-[#0B8FD8]">How to close a partner payout</p>
      <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
        <li>
          <strong>Expected</strong>, <strong>Share Exp.</strong>, <strong>TDS 2%</strong>,{" "}
          <strong>Net Payable</strong>, and <strong>Proj. Net</strong> stay calculated
        </li>
        <li>
          A full payout keeps <strong>Final net</strong> as the share before 2% TDS.{" "}
          <strong>Paid</strong> is that share after the 2% deduction
        </li>
        <li>
          Enter a lower cash on <strong>Paid</strong> or <strong>Final net</strong> only when you
          are keeping part of the net payable. That lower cash is saved in both places
        </li>
        <li>
          Actions show <strong>Pending</strong> until you complete the row, then{" "}
          <strong>Completed</strong>
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
