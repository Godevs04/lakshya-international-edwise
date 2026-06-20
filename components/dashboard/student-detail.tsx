"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GlassCard } from "@/components/cards/glass-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Timeline } from "@/components/ui/timeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils/format";
import { addStudentNoteAction } from "@/lib/actions/student.actions";
import type { StudentStatus } from "@/lib/constants/statuses";
import { Pencil } from "lucide-react";

interface StudentDetailProps {
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
    education?: { college?: string; course?: string; year?: string };
    loan?: {
      requested?: number;
      sanctioned?: number;
      disbursed?: number;
      interest?: number;
      bankName?: string;
      applicationNumber?: string;
    };
    documents?: Array<{ _id?: string; name: string; url: string; mimeType: string }>;
    timeline?: Array<{ _id?: string; status: string; note?: string; createdByName?: string; createdAt?: Date }>;
    notes?: Array<{ _id?: string; content: string; createdByName?: string; dueDate?: Date; createdAt?: Date }>;
    partnerId?: { _id: string; companyName: string; phone?: string; email?: string } | null;
    metadata?: { createdByName?: string };
    createdAt: Date;
  };
}

export function StudentDetailView({ student }: StudentDetailProps) {
  const router = useRouter();
  const [noteLoading, setNoteLoading] = useState(false);

  async function handleAddNote(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNoteLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await addStudentNoteAction(student._id, formData);
    if (result.success) {
      toast.success("Note added");
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setNoteLoading(false);
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
              <div className="mt-2"><StatusBadge status={student.status as StudentStatus} /></div>
            </div>
          </div>
          <Link href={`/dashboard/students/${student._id}/edit`}>
            <Button variant="outline" size="sm"><Pencil className="mr-1 h-4 w-4" /> Edit</Button>
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div><p className="text-xs text-muted-foreground">Phone</p><p className="text-sm">{student.phone ?? "—"}</p></div>
          <div><p className="text-xs text-muted-foreground">Email</p><p className="text-sm">{student.email ?? "—"}</p></div>
          <div><p className="text-xs text-muted-foreground">Created</p><p className="text-sm">{formatDate(student.createdAt)}</p></div>
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
          <GlassCard className="p-5">
            {(student.documents ?? []).length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {student.documents!.map((doc) => (
                  <a key={doc._id?.toString() ?? doc.url} href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50">
                    <div>
                      <p className="text-sm font-medium">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.mimeType}</p>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No documents uploaded.</p>
            )}
          </GlassCard>
        </TabsContent>

        <TabsContent value="loan" className="mt-4">
          <GlassCard className="p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><p className="text-xs text-muted-foreground">Requested</p><p className="text-lg font-semibold">{formatCurrency(student.loan?.requested ?? 0)}</p></div>
              <div><p className="text-xs text-muted-foreground">Sanctioned</p><p className="text-lg font-semibold">{formatCurrency(student.loan?.sanctioned ?? 0)}</p></div>
              <div><p className="text-xs text-muted-foreground">Disbursed</p><p className="text-lg font-semibold">{formatCurrency(student.loan?.disbursed ?? 0)}</p></div>
              <div><p className="text-xs text-muted-foreground">Interest</p><p className="text-lg font-semibold">{student.loan?.interest ?? 0}%</p></div>
              <div><p className="text-xs text-muted-foreground">Bank</p><p className="text-sm">{student.loan?.bankName ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground">Application #</p><p className="text-sm">{student.loan?.applicationNumber ?? "—"}</p></div>
            </div>
          </GlassCard>
        </TabsContent>

        <TabsContent value="notes" className="mt-4 space-y-4">
          <GlassCard className="p-5">
            <form onSubmit={handleAddNote} className="flex gap-2">
              <Input name="content" placeholder="Add a note..." required className="flex-1" />
              <Input name="dueDate" type="date" className="w-40" />
              <Button type="submit" disabled={noteLoading}>Add</Button>
            </form>
          </GlassCard>
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
