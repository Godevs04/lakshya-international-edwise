"use client";

import { GlassCard } from "@/components/cards/glass-card";
import { formatDate } from "@/lib/utils/format";
import { Building2, UserRound } from "lucide-react";

interface SitePartnerLeadDetailProps {
  lead: {
    partnerCode?: string;
    companyName: string;
    owner?: string;
    phone?: string;
    email?: string;
    city?: string;
    isOwner?: boolean;
    createdAt: Date | string;
  };
}

function DetailGrid({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <dl className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-x-4 gap-y-3 text-sm">
      {rows.map((row) => (
        <div key={row.label} className="contents">
          <dt className="text-muted-foreground">{row.label}</dt>
          <dd className="min-w-0 break-words font-medium text-foreground">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function SitePartnerLeadDetail({ lead }: SitePartnerLeadDetailProps) {
  return (
    <div className="space-y-4">
      <GlassCard className="p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          Company
        </h3>
        <div className="mt-3">
          <p className="text-lg font-semibold">{lead.companyName}</p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {lead.partnerCode ?? "—"}
          </p>
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <UserRound className="h-4 w-4 text-muted-foreground" />
          Contact
        </h3>
        <div className="mt-3">
          <DetailGrid
            rows={[
              { label: "Owner", value: lead.owner ?? "—" },
              { label: "Phone", value: lead.phone ?? "—" },
              { label: "Email", value: lead.email ?? "—" },
              { label: "City", value: lead.city ?? "—" },
              {
                label: "Is owner",
                value: lead.isOwner == null ? "—" : lead.isOwner ? "Yes" : "No",
              },
              { label: "Submitted", value: formatDate(lead.createdAt) },
            ]}
          />
        </div>
      </GlassCard>
    </div>
  );
}
