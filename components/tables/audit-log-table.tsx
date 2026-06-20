"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GlassCard } from "@/components/cards/glass-card";
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
import { formatDateTime } from "@/lib/utils/format";
import type { AuditLogItem } from "@/lib/actions/audit.actions";

interface AuditLogTableProps {
  data: AuditLogItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function AuditLogTable({
  data,
  total,
  page,
  totalPages,
}: AuditLogTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function buildUrl(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    return `/dashboard/audit?${params.toString()}`;
  }

  return (
    <GlassCard className="p-5 space-y-4">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          router.push(buildUrl({ search: formData.get("search") as string, page: "1" }));
        }}
      >
        <Input
          name="search"
          placeholder="Search action, user, resource..."
          defaultValue={searchParams.get("search") ?? ""}
          className="max-w-sm"
        />
        <Button type="submit" variant="secondary">Search</Button>
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Resource</TableHead>
            <TableHead>IP</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length ? (
            data.map((log) => (
              <TableRow key={log._id}>
                <TableCell className="whitespace-nowrap text-sm">
                  {formatDateTime(log.createdAt)}
                </TableCell>
                <TableCell>{log.userName ?? "—"}</TableCell>
                <TableCell className="font-mono text-xs">{log.action}</TableCell>
                <TableCell>
                  <span className="capitalize">{log.resourceType}</span>
                  {log.resourceId && (
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({log.resourceId.slice(-6)})
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{log.ip ?? "—"}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                No audit entries found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{total} total entries</span>
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
  );
}
