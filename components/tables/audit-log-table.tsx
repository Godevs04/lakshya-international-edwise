"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { notify } from "@/lib/toast";
import { GlassCard } from "@/components/cards/glass-card";
import { AuditDetailSheet } from "@/components/audit/audit-detail-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AUDIT_ACTION_GROUPS,
  AUDIT_PERIOD_OPTIONS,
  AUDIT_RESOURCE_TYPES,
  formatAuditAction,
  formatAuditMetadata,
  getAuditActionTone,
  getAuditResourceHref,
} from "@/lib/utils/audit-format";
import { formatDateTime } from "@/lib/utils/format";
import {
  exportAuditLogsAction,
  type AuditLogItem,
  type AuditLogStats,
} from "@/lib/actions/audit.actions";
import {
  Activity,
  CalendarDays,
  Download,
  Eye,
  Filter,
  Shield,
  TrendingUp,
} from "lucide-react";

interface AuditLogTableProps {
  data: AuditLogItem[];
  stats: AuditLogStats;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function AuditLogTable({
  data,
  stats,
  total,
  page,
  totalPages,
}: AuditLogTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [exportPending, startExport] = useTransition();

  const currentSearch = searchParams.get("search") ?? "";
  const currentResource = searchParams.get("resourceType") ?? "all";
  const currentAction = searchParams.get("actionGroup") ?? "all";
  const currentPeriod = searchParams.get("period") ?? "all";

  const [search, setSearch] = useState(currentSearch);
  const [resourceType, setResourceType] = useState(currentResource);
  const [actionGroup, setActionGroup] = useState(currentAction);
  const [period, setPeriod] = useState(currentPeriod);

  function buildUrl(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value && value !== "all") params.set(key, value);
      else params.delete(key);
    }
    return `/dashboard/audit?${params.toString()}`;
  }

  function applyFilters(form: {
    search: string;
    resourceType: string;
    actionGroup: string;
    period: string;
  }) {
    router.push(
      buildUrl({
        search: form.search || undefined,
        resourceType: form.resourceType === "all" ? undefined : form.resourceType,
        actionGroup: form.actionGroup === "all" ? undefined : form.actionGroup,
        period: form.period === "all" ? undefined : form.period,
        page: "1",
      })
    );
  }

  function openDetails(log: AuditLogItem) {
    setSelectedLog(log);
    setDetailOpen(true);
  }

  function handleExport() {
    startExport(async () => {
      try {
        const csv = await exportAuditLogsAction({
          search: currentSearch || undefined,
          resourceType: currentResource === "all" ? undefined : currentResource,
          actionGroup: currentAction === "all" ? undefined : currentAction,
          period: currentPeriod === "all" ? undefined : (currentPeriod as "today" | "7d" | "30d"),
        });
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
        anchor.click();
        URL.revokeObjectURL(url);
        notify.success("Audit log exported");
      } catch {
        notify.error("Could not export audit log");
      }
    });
  }

  const statCards = [
    {
      label: "Total events",
      value: stats.total,
      icon: Shield,
      tone: "from-[#E8952E] to-[#F59E0B]",
    },
    {
      label: "Today",
      value: stats.today,
      icon: CalendarDays,
      tone: "from-[#3B82F6] to-[#06B6D4]",
    },
    {
      label: "Last 7 days",
      value: stats.last7Days,
      icon: TrendingUp,
      tone: "from-[#22C55E] to-[#10B981]",
    },
    {
      label: stats.topResourceType ? `Top: ${stats.topResourceType}` : "Most active",
      value: stats.topResourceCount,
      icon: Activity,
      tone: "from-[#F59E0B] to-[#EF4444]",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <GlassCard key={card.label} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="mt-1 text-2xl font-bold tracking-tight">{card.value.toLocaleString("en-IN")}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${card.tone}`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      <GlassCard className="space-y-4 p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Filter className="h-4 w-4" />
            Filter audit trail
          </div>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={exportPending}>
            <Download className="mr-1.5 h-4 w-4" />
            {exportPending ? "Exporting..." : "Export CSV"}
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <Input
            placeholder="Search action, user, description, IP..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                applyFilters({ search, resourceType, actionGroup, period });
              }
            }}
            className="xl:col-span-2"
          />

          <Select value={resourceType} onValueChange={(value) => setResourceType(value ?? "all")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Resource type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All resources</SelectItem>
              {AUDIT_RESOURCE_TYPES.map((type) => (
                <SelectItem key={type} value={type} className="capitalize">
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={actionGroup} onValueChange={(value) => setActionGroup(value ?? "all")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Action group" />
            </SelectTrigger>
            <SelectContent>
              {AUDIT_ACTION_GROUPS.map((group) => (
                <SelectItem key={group.value} value={group.value}>
                  {group.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Select value={period} onValueChange={(value) => setPeriod(value ?? "all")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                {AUDIT_PERIOD_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="secondary"
              onClick={() => applyFilters({ search, resourceType, actionGroup, period })}
            >
              Apply
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>IP</TableHead>
              <TableHead className="text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length ? (
              data.map((log) => {
                const resourceHref = getAuditResourceHref(log.resourceType, log.resourceId);
                const metadataPreview = formatAuditMetadata(log.metadata);

                return (
                  <TableRow key={log._id} className="align-top">
                    <TableCell className="whitespace-nowrap text-sm">
                      {formatDateTime(log.createdAt)}
                    </TableCell>
                    <TableCell className="min-w-[120px]">{log.userName ?? "System"}</TableCell>
                    <TableCell className="min-w-[160px]">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${getAuditActionTone(log.action)}`}
                      >
                        {formatAuditAction(log.action)}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[280px]">
                      <p className="line-clamp-2 text-sm">
                        {log.description ?? "—"}
                      </p>
                      {metadataPreview && (
                        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                          {metadataPreview}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="min-w-[140px]">
                      <span className="capitalize">{log.resourceType}</span>
                      {log.resourceId && (
                        resourceHref ? (
                          <Link
                            href={resourceHref}
                            className="mt-0.5 block font-mono text-xs text-[#E8952E] hover:underline"
                          >
                            {log.resourceId.slice(-8)}
                          </Link>
                        ) : (
                          <span className="mt-0.5 block font-mono text-xs text-muted-foreground">
                            {log.resourceId.slice(-8)}
                          </span>
                        )
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {log.ip && log.ip !== "unknown" ? log.ip : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => openDetails(log)}>
                        <Eye className="mr-1 h-3.5 w-3.5" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No audit entries found for the current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>
            Showing {data.length} of {total.toLocaleString("en-IN")} matching entries
          </span>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <Link href={buildUrl({ page: String(page - 1) })}>
                <Button variant="outline" size="sm">Previous</Button>
              </Link>
            )}
            <span className="px-2">Page {page} of {totalPages || 1}</span>
            {page < totalPages && (
              <Link href={buildUrl({ page: String(page + 1) })}>
                <Button variant="outline" size="sm">Next</Button>
              </Link>
            )}
          </div>
        </div>
      </GlassCard>

      <AuditDetailSheet
        log={selectedLog}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
