"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import type { PartnerListItem } from "@/types";
import type { PartnerStatus } from "@/lib/constants/statuses";
import { Plus } from "lucide-react";

interface PartnersTableProps {
  data: PartnerListItem[];
  total: number;
  page: number;
  totalPages: number;
}

export function PartnersTable({ data, total, page, totalPages }: PartnersTableProps) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link href="/dashboard/partners/new">
          <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Add Partner</Button>
        </Link>
      </div>
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Loan Value</TableHead>
              <TableHead>Commission</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length ? data.map((p) => (
              <TableRow key={p._id}>
                <TableCell>
                  <Link href={`/dashboard/partners/${p._id}`} className="font-medium text-primary hover:underline">
                    {p.companyName}
                  </Link>
                </TableCell>
                <TableCell>{p.owner ?? "—"}</TableCell>
                <TableCell>{p.phone ?? "—"}</TableCell>
                <TableCell>{p.studentsCount}</TableCell>
                <TableCell>{formatCurrency(p.totalLoanValue)}</TableCell>
                <TableCell>{p.commissionPercent ?? 0}%</TableCell>
                <TableCell><StatusBadge status={p.status as PartnerStatus} type="partner" /></TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No partners found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{total} total partners</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => router.push(`/dashboard/partners?page=${page - 1}`)}>Previous</Button>
          <span className="flex items-center px-2">Page {page} of {totalPages || 1}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => router.push(`/dashboard/partners?page=${page + 1}`)}>Next</Button>
        </div>
      </div>
    </div>
  );
}
