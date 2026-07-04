"use client";

import { GlassCard } from "@/components/cards/glass-card";
import { formatDate } from "@/lib/utils/format";
import { formatPersonName } from "@/lib/utils/person-name";
import { Globe, MessageSquare, UserRound } from "lucide-react";

function formatEnquiryType(value?: string) {
  if (!value) return "—";
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

interface SiteStudentLeadDetailProps {
  lead: {
    _id: string;
    studentId: string;
    firstName: string;
    lastName: string;
    phone?: string;
    email?: string;
    targetCountry?: string;
    enquiryType?: string;
    formPage?: string;
    notes?: { content: string; createdByName?: string; createdAt?: string }[];
    createdAt: string;
  };
}

export function SiteStudentLeadDetail({ lead }: SiteStudentLeadDetailProps) {
  const displayName = formatPersonName(lead.firstName, lead.lastName);

  return (
    <div className="space-y-4">
      <GlassCard className="p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <UserRound className="h-4 w-4 text-muted-foreground" />
          Contact
        </h3>
        <div className="mt-3 space-y-2 text-sm">
          <p className="text-lg font-semibold">{displayName}</p>
          <p className="text-muted-foreground">{lead.studentId}</p>
          <p>
            <span className="text-muted-foreground">Phone:</span> {lead.phone ?? "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Email:</span> {lead.email ?? "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Country:</span> {lead.targetCountry ?? "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Submitted:</span> {formatDate(lead.createdAt)}
          </p>
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Globe className="h-4 w-4 text-muted-foreground" />
          Website enquiry
        </h3>
        <div className="mt-3 space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Type:</span> {formatEnquiryType(lead.enquiryType)}
          </p>
          <p>
            <span className="text-muted-foreground">Form page:</span> {lead.formPage ?? "—"}
          </p>
        </div>
      </GlassCard>

      {lead.notes?.length ? (
        <GlassCard className="p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            Notes
          </h3>
          <div className="mt-3 space-y-3">
            {lead.notes.map((note, index) => (
              <div key={index} className="rounded-xl bg-muted/40 p-3 text-sm">
                <p className="whitespace-pre-wrap">{note.content}</p>
                {note.createdAt ? (
                  <p className="mt-1 text-xs text-muted-foreground">{formatDate(note.createdAt)}</p>
                ) : null}
              </div>
            ))}
          </div>
        </GlassCard>
      ) : null}
    </div>
  );
}
