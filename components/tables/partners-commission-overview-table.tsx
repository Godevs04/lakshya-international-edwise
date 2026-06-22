"use client";

import Link from "next/link";
import { GlassCard } from "@/components/cards/glass-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import type { PartnerCommissionOverviewRow } from "@/lib/services/partner-commission.service";

interface PartnersCommissionOverviewTableProps {
  rows: PartnerCommissionOverviewRow[];
}

export function PartnersCommissionOverviewTable({ rows }: PartnersCommissionOverviewTableProps) {
  const totals = rows.reduce(
    (acc, row) => ({
      totalDisbursed: acc.totalDisbursed + row.totalDisbursed,
      commissionEarned: acc.commissionEarned + row.commissionEarned,
      commissionSettled: acc.commissionSettled + row.commissionSettled,
      commissionPending: acc.commissionPending + row.commissionPending,
    }),
    { totalDisbursed: 0, commissionEarned: 0, commissionSettled: 0, commissionPending: 0 }
  );

  return (
    <GlassCard className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Partner</TableHead>
            <TableHead>Rate</TableHead>
            <TableHead>Students</TableHead>
            <TableHead>Disbursed</TableHead>
            <TableHead>Earned</TableHead>
            <TableHead>Settled</TableHead>
            <TableHead>Pending</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length ? (
            <>
              {rows.map((row) => (
                <TableRow key={row.partnerId}>
                  <TableCell>
                    <Link
                      href={`/dashboard/partners/${row.partnerId}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {row.companyName}
                    </Link>
                    {row.owner ? (
                      <p className="text-xs text-muted-foreground">{row.owner}</p>
                    ) : null}
                  </TableCell>
                  <TableCell>{formatPercent(row.commissionPercent)}</TableCell>
                  <TableCell>
                    {row.disbursedStudentCount}/{row.studentsCount}
                  </TableCell>
                  <TableCell>{formatCurrency(row.totalDisbursed)}</TableCell>
                  <TableCell className="font-medium text-[#6D5EF7]">
                    {formatCurrency(row.commissionEarned)}
                  </TableCell>
                  <TableCell className="text-[#22C55E]">
                    {formatCurrency(row.commissionSettled)}
                  </TableCell>
                  <TableCell className="text-[#F59E0B]">
                    {formatCurrency(row.commissionPending)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/partners/${row.partnerId}?tab=students`}>
                      <Button variant="outline" size="sm" type="button">
                        Student-wise
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/30 font-semibold">
                <TableCell colSpan={3}>All partners</TableCell>
                <TableCell>{formatCurrency(totals.totalDisbursed)}</TableCell>
                <TableCell>{formatCurrency(totals.commissionEarned)}</TableCell>
                <TableCell>{formatCurrency(totals.commissionSettled)}</TableCell>
                <TableCell>{formatCurrency(totals.commissionPending)}</TableCell>
                <TableCell />
              </TableRow>
            </>
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                No partner commission data yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </GlassCard>
  );
}
