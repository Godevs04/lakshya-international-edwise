"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency } from "@/lib/utils/format";
import type { StudentStatus } from "@/lib/constants/statuses";

export interface PartnerStudentCommissionRow {
  studentDbId: string;
  studentId: string;
  studentName: string;
  status: string;
  disbursed: number;
  commissionEarned: number;
  commissionSettled: number;
  commissionPending: number;
}

interface PartnerStudentCommissionTableProps {
  rows: PartnerStudentCommissionRow[];
  showTotals?: boolean;
}

export function PartnerStudentCommissionTable({
  rows,
  showTotals = true,
}: PartnerStudentCommissionTableProps) {
  const totals = rows.reduce(
    (acc, row) => ({
      disbursed: acc.disbursed + row.disbursed,
      commissionEarned: acc.commissionEarned + row.commissionEarned,
      commissionSettled: acc.commissionSettled + row.commissionSettled,
      commissionPending: acc.commissionPending + row.commissionPending,
    }),
    { disbursed: 0, commissionEarned: 0, commissionSettled: 0, commissionPending: 0 }
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Disbursed</TableHead>
          <TableHead>Commission</TableHead>
          <TableHead>Settled</TableHead>
          <TableHead>Pending</TableHead>
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
              </TableRow>
            ))}
            {showTotals && (
              <TableRow className="bg-muted/30 font-semibold">
                <TableCell colSpan={2}>Total</TableCell>
                <TableCell>{formatCurrency(totals.disbursed)}</TableCell>
                <TableCell>{formatCurrency(totals.commissionEarned)}</TableCell>
                <TableCell>{formatCurrency(totals.commissionSettled)}</TableCell>
                <TableCell>{formatCurrency(totals.commissionPending)}</TableCell>
              </TableRow>
            )}
          </>
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
              No linked students for commission breakdown.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
