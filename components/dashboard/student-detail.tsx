"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/toast";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GlassCard } from "@/components/cards/glass-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Timeline } from "@/components/ui/timeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils/format";
import { addStudentNoteAction, removeStudentDocumentAction } from "@/lib/actions/student.actions";
import { DocumentLinkForm } from "@/components/forms/document-link-form";
import { buildWhatsAppUrl, getStudentWhatsAppNumber } from "@/lib/utils/whatsapp";
import type { StudentStatus } from "@/lib/constants/statuses";
import { ExternalLink, MessageCircle, Pencil, Trash2 } from "lucide-react";

interface StudentDetailProps {
  canWrite?: boolean;
  student: {
    _id: string;
    studentId: string;
    firstName: string;
    lastName: string;
    photo?: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
    gender?: string;
    dob?: Date;
    status: string;
    remarks?: string;
    address?: { line?: string; city?: string; state?: string; pincode?: string };
    aadhaar?: string;
    pan?: string;
    education?: { college?: string; course?: string; year?: string };
    loan?: {
      requested?: number;
      sanctioned?: number;
      disbursed?: number;
      interest?: number;
      bankName?: string;
      applicationNumber?: string;
    };
    documents?: Array<{ _id?: string; name: string; url: string; mimeType?: string }>;
    timeline?: Array<{ _id?: string; status: string; note?: string; createdByName?: string; createdAt?: Date }>;
    notes?: Array<{ _id?: string; content: string; createdByName?: string; dueDate?: Date; createdAt?: Date }>;
    partnerId?: { _id: string; companyName: string; phone?: string; email?: string } | null;
    metadata?: { createdByName?: string };
    createdAt: Date;
  };
}

export function StudentDetailView({ student, canWrite = false }: StudentDetailProps) {
  const router = useRouter();
  const [noteLoading, setNoteLoading] = useState(false);
  const [removingDocId, setRemovingDocId] = useState<string | null>(null);

  const whatsappNumber = getStudentWhatsAppNumber(student.whatsapp, student.phone);
  const whatsappUrl = whatsappNumber ? buildWhatsAppUrl(whatsappNumber) : null;

  async function handleAddNote(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNoteLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await addStudentNoteAction(student._id, formData);
    if (result.success) {
      notify.success("Note added");
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } else {
      notify.error(result.error ?? "Failed to add note");
    }
    setNoteLoading(false);
  }

  async function handleRemoveDocument(documentId: string) {
    setRemovingDocId(documentId);
    const result = await removeStudentDocumentAction(student._id, documentId);
    if (result.success) {
      notify.success("Document removed");
      router.refresh();
    } else {
      notify.error(result.error ?? "Failed to remove document");
    }
    setRemovingDocId(null);
  }

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={student.photo} />
              <AvatarFallback>{getInitials(`${student.firstName} ${student.lastName}`)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{student.firstName} {student.lastName}</h2>
              <p className="text-sm text-muted-foreground">{student.studentId}</p>
              {student.loan?.applicationNumber && (
                <p className="mt-1 text-xs font-mono text-muted-foreground">
                  Bank LAN: {student.loan.applicationNumber}
                </p>
              )}
              <div className="mt-2"><StatusBadge status={student.status as StudentStatus} /></div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {whatsappUrl && (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-emerald-500/30 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                >
                  <MessageCircle className="mr-1 h-4 w-4" />
                  Chat on WhatsApp
                </Button>
              </a>
            )}
            {canWrite && (
              <Link href={`/dashboard/students/${student._id}/edit`}>
                <Button variant="outline" size="sm"><Pencil className="mr-1 h-4 w-4" /> Edit</Button>
              </Link>
            )}
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div><p className="text-xs text-muted-foreground">Phone</p><p className="text-sm">{student.phone ?? "—"}</p></div>
          <div>
            <p className="text-xs text-muted-foreground">WhatsApp</p>
            <p className="text-sm">{whatsappNumber ?? "—"}</p>
          </div>
          <div><p className="text-xs text-muted-foreground">Email</p><p className="text-sm">{student.email ?? "—"}</p></div>
          <div><p className="text-xs text-muted-foreground">Created</p><p className="text-sm">{formatDate(student.createdAt)}</p></div>
          <div><p className="text-xs text-muted-foreground">Aadhaar</p><p className="text-sm font-mono">{student.aadhaar ?? "—"}</p></div>
          <div><p className="text-xs text-muted-foreground">PAN</p><p className="text-sm font-mono">{student.pan ?? "—"}</p></div>
        </div>
      </GlassCard>

      <Tabs defaultValue="timeline">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="loan">Loan History</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="partner">Partner</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-4">
          <GlassCard className="p-5">
            <Timeline
              items={(student.timeline ?? []).map((t, i) => ({
                id: t._id?.toString() ?? String(i),
                title: t.status.replace(/_/g, " "),
                description: t.note ?? `Updated by ${t.createdByName ?? "System"}`,
                timestamp: t.createdAt ?? new Date(),
              }))}
            />
          </GlassCard>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <GlassCard className="p-5 space-y-4">
            {canWrite && <DocumentLinkForm studentId={student._id} />}
            {(student.documents ?? []).length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {student.documents!.map((doc) => (
                  <div
                    key={doc._id?.toString() ?? doc.url}
                    className="flex items-center justify-between gap-3 rounded-lg border p-3"
                  >
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-w-0 flex-1 items-center gap-2 hover:text-primary"
                    >
                      <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{doc.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{doc.url}</p>
                      </div>
                    </a>
                    {canWrite && doc._id && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={removingDocId === doc._id.toString()}
                        onClick={() => handleRemoveDocument(doc._id!.toString())}
                        aria-label={`Remove ${doc.name}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No document links added yet.</p>
            )}
          </GlassCard>
        </TabsContent>

        <TabsContent value="loan" className="mt-4">
          <GlassCard className="p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><p className="text-xs text-muted-foreground">Requested</p><p className="text-lg font-semibold">{formatCurrency(student.loan?.requested ?? 0)}</p></div>
              <div><p className="text-xs text-muted-foreground">Sanctioned</p><p className="text-lg font-semibold">{formatCurrency(student.loan?.sanctioned ?? 0)}</p></div>
              <div><p className="text-xs text-muted-foreground">Disbursed</p><p className="text-lg font-semibold">{formatCurrency(student.loan?.disbursed ?? 0)}</p></div>
              <div><p className="text-xs text-muted-foreground">Interest</p><p className="text-lg font-semibold">{student.loan?.interest != null ? `${student.loan.interest}%` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground">Bank</p><p className="text-sm">{student.loan?.bankName ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground">Bank LAN</p><p className="text-sm font-mono">{student.loan?.applicationNumber ?? "—"}</p></div>
            </div>
          </GlassCard>
        </TabsContent>

        <TabsContent value="notes" className="mt-4 space-y-4">
          {canWrite && (
            <GlassCard className="p-5">
              <form onSubmit={handleAddNote} className="flex gap-2">
                <Input name="content" placeholder="Add a note..." required className="flex-1" />
                <Input name="dueDate" type="date" className="w-40" />
                <Button type="submit" disabled={noteLoading}>Add</Button>
              </form>
            </GlassCard>
          )}
          <GlassCard className="p-5">
            {(student.notes ?? []).length > 0 ? (
              <div className="space-y-3">
                {student.notes!.map((note, i) => (
                  <div key={note._id?.toString() ?? i} className="rounded-lg border p-3">
                    <p className="text-sm">{note.content}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {note.createdByName} · {note.createdAt ? formatDate(note.createdAt) : ""}
                      {note.dueDate && ` · Due: ${formatDate(note.dueDate)}`}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No notes yet.</p>
            )}
          </GlassCard>
        </TabsContent>

        <TabsContent value="partner" className="mt-4">
          <GlassCard className="p-5">
            {student.partnerId ? (
              <div>
                <Link href={`/dashboard/partners/${student.partnerId._id}`} className="text-lg font-semibold text-primary hover:underline">
                  {student.partnerId.companyName}
                </Link>
                <p className="mt-2 text-sm text-muted-foreground">{student.partnerId.phone}</p>
                <p className="text-sm text-muted-foreground">{student.partnerId.email}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No partner assigned.</p>
            )}
          </GlassCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
