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
      commissionExpected: acc.commissionExpected + row.commissionExpected,
      commissionReceived: acc.commissionReceived + row.commissionReceived,
      pendingReceived: acc.pendingReceived + row.pendingReceived,
      partnerShareExpected: acc.partnerShareExpected + row.partnerShareExpected,
      commissionShared: acc.commissionShared + row.commissionShared,
      pendingShared: acc.pendingShared + row.pendingShared,
      commissionEarned: acc.commissionEarned + row.commissionEarned,
    }),
    {
      totalDisbursed: 0,
      commissionExpected: 0,
      commissionReceived: 0,
      pendingReceived: 0,
      partnerShareExpected: 0,
      commissionShared: 0,
      pendingShared: 0,
      commissionEarned: 0,
    }
  );

  return (
    <GlassCard className="overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Partner</TableHead>
              <TableHead>Share %</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Disbursed</TableHead>
              <TableHead>Expected</TableHead>
              <TableHead>Received</TableHead>
              <TableHead>Pend. Rcvd</TableHead>
              <TableHead>Share Exp.</TableHead>
              <TableHead>Shared</TableHead>
              <TableHead>Pend. Sh.</TableHead>
              <TableHead>Net</TableHead>
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
                    <TableCell>{formatPercent(row.partnerSharePercent || row.commissionPercent)}</TableCell>
                    <TableCell>
                      {row.disbursedStudentCount}/{row.studentsCount}
                    </TableCell>
                    <TableCell>{formatCurrency(row.totalDisbursed)}</TableCell>
                    <TableCell>{formatCurrency(row.commissionExpected)}</TableCell>
                    <TableCell className="text-[#22C55E]">{formatCurrency(row.commissionReceived)}</TableCell>
                    <TableCell className="text-[#F59E0B]">{formatCurrency(row.pendingReceived)}</TableCell>
                    <TableCell>{formatCurrency(row.partnerShareExpected)}</TableCell>
                    <TableCell className="text-[#22C55E]">{formatCurrency(row.commissionShared)}</TableCell>
                    <TableCell className="text-[#F59E0B]">{formatCurrency(row.pendingShared)}</TableCell>
                    <TableCell className="font-medium text-[#E8952E]">
                      {formatCurrency(row.commissionEarned)}
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
                  <TableCell>{formatCurrency(totals.commissionExpected)}</TableCell>
                  <TableCell>{formatCurrency(totals.commissionReceived)}</TableCell>
                  <TableCell>{formatCurrency(totals.pendingReceived)}</TableCell>
                  <TableCell>{formatCurrency(totals.partnerShareExpected)}</TableCell>
                  <TableCell>{formatCurrency(totals.commissionShared)}</TableCell>
                  <TableCell>{formatCurrency(totals.pendingShared)}</TableCell>
                  <TableCell>{formatCurrency(totals.commissionEarned)}</TableCell>
                  <TableCell />
                </TableRow>
              </>
            ) : (
              <TableRow>
                <TableCell colSpan={12} className="h-24 text-center text-muted-foreground">
                  No partner commission data for this filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </GlassCard>
  );
}
