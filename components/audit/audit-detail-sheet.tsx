"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  formatAuditAction,
  formatAuditMetadata,
  getAuditActionTone,
  getAuditResourceHref,
  parseUserAgent,
} from "@/lib/utils/audit-format";
import { formatDateTime } from "@/lib/utils/format";
import type { AuditLogItem } from "@/lib/actions/audit.actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ExternalLink, Globe, Monitor, User } from "lucide-react";

interface AuditDetailSheetProps {
  log: AuditLogItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="text-sm text-foreground">{value}</div>
    </div>
  );
}

export function AuditDetailSheet({ log, open, onOpenChange }: AuditDetailSheetProps) {
  if (!log) return null;

  const resourceHref = getAuditResourceHref(log.resourceType, log.resourceId);
  const metadataSummary = formatAuditMetadata(log.metadata);
  const diffEntries = log.diff ? Object.entries(log.diff) : [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader className="border-b border-border/60 pb-4">
          <SheetTitle>Audit entry details</SheetTitle>
          <SheetDescription>{formatDateTime(log.createdAt)}</SheetDescription>
        </SheetHeader>

        <div className="space-y-5 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getAuditActionTone(log.action)}`}
            >
              {formatAuditAction(log.action)}
            </span>
            <Badge variant="outline" className="capitalize">
              {log.resourceType}
            </Badge>
          </div>

          <DetailRow
            label="Description"
            value={log.description ?? "No description recorded for this event."}
          />

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <DetailRow
              label="User"
              value={
                <span className="inline-flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  {log.userName ?? "System"}
                </span>
              }
            />
            <DetailRow label="Timestamp" value={formatDateTime(log.createdAt)} />
          </div>

          <DetailRow
            label="Resource"
            value={
              <div className="space-y-1">
                <p className="capitalize">{log.resourceType}</p>
                {log.resourceId && (
                  <p className="font-mono text-xs text-muted-foreground break-all">{log.resourceId}</p>
                )}
                {resourceHref && (
                  <Button variant="outline" size="sm" className="mt-2" render={<Link href={resourceHref} />}>
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                    Open resource
                  </Button>
                )}
              </div>
            }
          />

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <DetailRow
              label="IP address"
              value={
                <span className="inline-flex items-center gap-1.5 font-mono text-xs">
                  <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                  {log.ip && log.ip !== "unknown" ? log.ip : "Not captured"}
                </span>
              }
            />
            <DetailRow
              label="Browser / device"
              value={
                <span className="inline-flex items-center gap-1.5">
                  <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
                  {parseUserAgent(log.userAgent)}
                </span>
              }
            />
          </div>

          {log.userAgent && (
            <DetailRow
              label="Full user agent"
              value={<p className="break-all font-mono text-xs text-muted-foreground">{log.userAgent}</p>}
            />
          )}

          {metadataSummary && (
            <>
              <Separator />
              <DetailRow label="Additional metadata" value={metadataSummary} />
              {log.metadata && (
                <pre className="overflow-x-auto rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              )}
            </>
          )}

          {diffEntries.length > 0 && (
            <>
              <Separator />
              <DetailRow
                label="Changes"
                value={
                  <div className="space-y-2">
                    {diffEntries.map(([field, value]) => (
                      <div key={field} className="rounded-lg border border-border/60 px-3 py-2">
                        <p className="text-xs font-medium capitalize">{field.replace(/_/g, " ")}</p>
                        <p className="mt-1 font-mono text-xs text-muted-foreground break-all">
                          {typeof value === "object" ? JSON.stringify(value) : String(value)}
                        </p>
                      </div>
                    ))}
                  </div>
                }
              />
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
