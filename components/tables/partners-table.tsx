"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { GlassCard } from "@/components/cards/glass-card";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import {
  PARTNER_ACTION_STATUSES,
  PARTNER_ACTION_STATUS_LABELS,
  type PartnerActionStatus,
} from "@/lib/constants/partner-action-statuses";
import type { PartnerListItem } from "@/types";
import type { PartnerStatus } from "@/lib/constants/statuses";

interface PartnersTableProps {
  data: PartnerListItem[];
  total: number;
  page: number;
  totalPages: number;
  actionStatus?: string;
}

export function PartnersTable({
  data,
  total,
  page,
  totalPages,
  actionStatus,
}: PartnersTableProps) {
  const router = useRouter();
  const currentActionStatus = actionStatus || "all";

  function navigate(nextActionStatus?: string) {
    const params = new URLSearchParams();
    if (nextActionStatus && nextActionStatus !== "all") {
      params.set("actionStatus", nextActionStatus);
    }
    const query = params.toString();
    router.push(query ? `/dashboard/partners?${query}` : "/dashboard/partners");
  }

  return (
    <div className="space-y-4">
      <GlassCard className="p-4">
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => navigate("all")}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              currentActionStatus === "all"
                ? "border-[#E8952E] bg-[#E8952E] text-white shadow-sm"
                : "border-[#E8952E]/15 bg-white/60 text-muted-foreground hover:border-[#E8952E]/30 hover:bg-[#E8952E]/8 hover:text-foreground dark:bg-white/5"
            )}
          >
            All
          </button>
          {PARTNER_ACTION_STATUSES.map((status) => {
            const isActive = currentActionStatus === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => navigate(status)}
                className={cn(
                  "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "border-[#E8952E] bg-[#E8952E] text-white shadow-sm"
                    : "border-[#E8952E]/15 bg-white/60 text-muted-foreground hover:border-[#E8952E]/30 hover:bg-[#E8952E]/8 hover:text-foreground dark:bg-white/5"
                )}
              >
                {PARTNER_ACTION_STATUS_LABELS[status]}
              </button>
            );
          })}
        </div>
      </GlassCard>

      <GlassCard className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Loan Value</TableHead>
              <TableHead>Partner Share</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length ? data.map((p) => (
              <TableRow key={p._id}>
                <TableCell>
                  <Link href={`/dashboard/partners/${p._id}`} className="font-semibold text-[#E8952E] hover:underline">
                    {p.companyName}
                  </Link>
                </TableCell>
                <TableCell>{p.owner ?? "—"}</TableCell>
                <TableCell>{p.phone ?? "—"}</TableCell>
                <TableCell>{p.studentsCount}</TableCell>
                <TableCell>{formatCurrency(p.totalLoanValue)}</TableCell>
                <TableCell>{formatPercent(p.commissionPercent ?? 0)}</TableCell>
                <TableCell>
                  {PARTNER_ACTION_STATUS_LABELS[p.actionStatus as PartnerActionStatus]}
                </TableCell>
                <TableCell><StatusBadge status={p.status as PartnerStatus} type="partner" /></TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">No partners found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </GlassCard>
      <div className="flex flex-col gap-3 rounded-2xl bg-white/50 px-3 py-3 text-sm text-muted-foreground backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-4 dark:bg-white/5">
        <span>{total} total partners</span>
        <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => {
              const params = new URLSearchParams();
              if (actionStatus) params.set("actionStatus", actionStatus);
              if (page > 1) params.set("page", String(page - 1));
              const query = params.toString();
              router.push(query ? `/dashboard/partners?${query}` : "/dashboard/partners");
            }}
          >
            Previous
          </Button>
          <span className="flex items-center px-2">Page {page} of {totalPages || 1}</span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => {
              const params = new URLSearchParams();
              if (actionStatus) params.set("actionStatus", actionStatus);
              params.set("page", String(page + 1));
              router.push(`/dashboard/partners?${params.toString()}`);
            }}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
