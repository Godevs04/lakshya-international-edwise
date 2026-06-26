"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/toast";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GlassCard } from "@/components/cards/glass-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Timeline } from "@/components/ui/timeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NoteMentionInput } from "@/components/forms/note-mention-input";
import { NoteContent } from "@/components/dashboard/note-content";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatMoney, getInitials } from "@/lib/utils/format";
import { addStudentNoteAction, removeStudentDocumentAction } from "@/lib/actions/student.actions";
import { DocumentLinkForm } from "@/components/forms/document-link-form";
import { StudentContactActions } from "@/components/dashboard/student-contact-actions";
import { ProfileCompleteBadge } from "@/components/dashboard/profile-complete-badge";
import { StudentApplicationPanel } from "@/components/dashboard/student-application-panel";
import { Progress } from "@/components/ui/progress";
import {
  getApplicationStatusLabel,
  type ApplicationStatusId,
} from "@/lib/constants/application-status";
import { getDisbursementTypeLabel } from "@/lib/constants/disbursement";
import type { LoanApplicationItem } from "@/lib/constants/loan-application";
import {
  getStudentProfileCompleteness,
  isStudentProfileVerified,
} from "@/lib/utils/student-profile";
import type { StudentStatus } from "@/lib/constants/statuses";
import { ExternalLink, Pencil, Trash2, UserRound } from "lucide-react";
import {
  getStudentEditHref,
  type StudentEditSectionKey,
} from "@/lib/constants/student-edit-sections";

interface StudentDetailProps {
  canWrite?: boolean;
  teamUsers?: Array<{ _id: string; name: string }>;
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
    targetCountry?: string;
    targetIntake?: string;
    targetDegree?: string;
    targetUniversity?: string;
    applicationStatus?: ApplicationStatusId;
    sentToBank?: boolean;
    sentToBankAt?: Date;
    sentToBankByName?: string;
    loggedIn?: boolean;
    assignedAt?: Date;
    loan?: {
      requested?: number;
      sanctioned?: number;
      disbursed?: number;
      disbursementType?: "full" | "tranche";
      currency?: "INR" | "USD";
      roi?: number;
      interest?: number;
      processingFee?: number;
      pfPaid?: boolean;
      bankName?: string;
      applicationNumber?: string;
      lenderId?: { _id: string; name: string; slug?: string } | null;
    };
    loanApplications?: LoanApplicationItem[];
    documents?: Array<{ _id?: string; name: string; url: string; mimeType?: string }>;
    timeline?: Array<{ _id?: string; status: string; note?: string; createdByName?: string; createdAt?: Date }>;
    notes?: Array<{ _id?: string; content: string; createdByName?: string; dueDate?: Date; createdAt?: Date }>;
    partnerId?: { _id: string; companyName: string; phone?: string; email?: string } | null;
    assignedTo?: { _id: string; name: string; email?: string } | null;
    metadata?: { createdByName?: string };
    createdAt: Date;
  };
}

function SummaryRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value?.trim() ? value : "—"}</span>
    </div>
  );
}

function SectionEditButton({
  studentId,
  section,
}: {
  studentId: string;
  section: StudentEditSectionKey;
}) {
  return (
    <Link href={getStudentEditHref(studentId, section)}>
      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
        <Pencil className="mr-1 h-3 w-3" />
        Edit
      </Button>
    </Link>
  );
}

function SectionHeader({
  title,
  icon: Icon,
  studentId,
  section,
  canWrite,
}: {
  title: string;
  icon: typeof UserRound;
  studentId: string;
  section: StudentEditSectionKey;
  canWrite: boolean;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {title}
      </h3>
      {canWrite ? <SectionEditButton studentId={studentId} section={section} /> : null}
    </div>
  );
}

function formatLoanAmount(amount: number, currency?: "INR" | "USD") {
  return formatMoney(amount, currency ?? "INR");
}

export function StudentDetailView({
  student,
  canWrite = false,
  teamUsers = [],
}: StudentDetailProps) {
  const router = useRouter();
  const [noteLoading, setNoteLoading] = useState(false);
  const [noteFormKey, setNoteFormKey] = useState(0);
  const [removingDocId, setRemovingDocId] = useState<string | null>(null);
  const loanApplications = useMemo(
    () => student.loanApplications ?? [],
    [student.loanApplications]
  );
  const timeline = student.timeline ?? [];
  const sentBanks = useMemo(
    () => loanApplications.filter((entry) => entry.sentToBank),
    [loanApplications]
  );
  const bankSent = sentBanks.length > 0 || Boolean(student.sentToBank);

  const profileInput = useMemo(
    () => ({
      phone: student.phone,
      whatsapp: student.whatsapp,
      email: student.email,
      gender: student.gender,
      dob: student.dob,
      targetCountry: student.targetCountry,
      targetIntake: student.targetIntake,
      targetDegree: student.targetDegree,
      targetUniversity: student.targetUniversity,
      loan: {
        requested: student.loan?.requested,
        lenderId: student.loan?.lenderId,
        roi: student.loan?.roi,
      },
      partnerId: student.partnerId,
      partnerName: student.partnerId?.companyName,
    }),
    [student]
  );

  const profileCompleteness = useMemo(
    () => getStudentProfileCompleteness(profileInput),
    [profileInput]
  );

  const profileVerified = useMemo(
    () => isStudentProfileVerified(profileInput),
    [profileInput]
  );

  const latestNote = useMemo(() => {
    const notes = [...(student.notes ?? [])];
    notes.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
    return notes[0] ?? null;
  }, [student.notes]);

  const latestRemark = latestNote?.content ?? student.remarks;
  const lenderName = student.loan?.lenderId?.name ?? student.loan?.bankName;
  const banksSummary = useMemo(() => {
    if (loanApplications.length > 0) {
      return loanApplications.map((entry) => entry.lenderName).filter(Boolean).join(", ");
    }
    return lenderName;
  }, [loanApplications, lenderName]);

  function handleBankActivity() {
    router.refresh();
  }

  async function handleAddNote(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNoteLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await addStudentNoteAction(student._id, formData);
    if (result.success) {
      notify.success("Note added");
      setNoteFormKey((prev) => prev + 1);
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
    <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <GlassCard className="p-5">
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-20 w-20">
              <AvatarImage src={student.photo} />
              <AvatarFallback>{getInitials(`${student.firstName} ${student.lastName}`)}</AvatarFallback>
            </Avatar>
            <h2 className="mt-3 flex items-center justify-center gap-1.5 text-lg font-semibold">
              <span>
                {student.firstName} {student.lastName}
              </span>
              <ProfileCompleteBadge verified={profileVerified} />
            </h2>
            <p className="text-sm text-muted-foreground">{student.studentId}</p>
            <div className="mt-3 flex flex-col items-center gap-2">
              <StatusBadge status={student.status as StudentStatus} />
              <Badge variant="outline" className="text-xs">
                {getApplicationStatusLabel(student.applicationStatus)}
              </Badge>
              {bankSent ? (
                <Badge className="bg-[#22C55E]/15 text-[#22C55E] hover:bg-[#22C55E]/15">
                  {sentBanks.length > 1
                    ? `Sent to ${sentBanks.length} banks`
                    : "Sent to bank"}
                </Badge>
              ) : null}
              {!profileVerified && (
                <p className="text-xs text-muted-foreground">
                  Profile {profileCompleteness.percent}% complete
                </p>
              )}
            </div>
          </div>

          <div className="mt-5 flex justify-center">
            <StudentContactActions
              phone={student.phone}
              whatsapp={student.whatsapp}
              email={student.email}
              studentName={`${student.firstName} ${student.lastName}`}
              variant="icons"
            />
          </div>

          <div className="mt-5 space-y-3 border-t pt-4">
            <SummaryRow label="Lead assigned to" value={student.assignedTo?.name} />
            <SummaryRow label="Partner" value={student.partnerId?.companyName} />
            <SummaryRow label="Country" value={student.targetCountry} />
            <SummaryRow label="Intake" value={student.targetIntake} />
            <SummaryRow label="Degree" value={student.targetDegree} />
            <SummaryRow label="University" value={student.targetUniversity} />
            <SummaryRow label="Banks" value={banksSummary} />
            <SummaryRow label="Currency" value={student.loan?.currency ?? "INR"} />
            <SummaryRow
              label="Loan requested"
              value={formatLoanAmount(student.loan?.requested ?? 0, student.loan?.currency)}
            />
            <SummaryRow
              label="Processing fee"
              value={formatLoanAmount(student.loan?.processingFee ?? 0, student.loan?.currency)}
            />
            <SummaryRow
              label="ROI / Interest"
              value={
                student.loan?.roi != null && student.loan.roi > 0
                  ? `${student.loan.roi}%`
                  : student.loan?.interest != null && student.loan.interest > 0
                    ? `${student.loan.interest}%`
                    : undefined
              }
            />
            <SummaryRow label="LAN" value={student.loan?.applicationNumber} />
          </div>

          {canWrite && (
            <div className="mt-4">
              <Link href={`/dashboard/students/${student._id}/edit`} className="block">
                <Button variant="outline" size="sm" className="w-full">
                  <Pencil className="mr-1 h-4 w-4" /> Edit all sections
                </Button>
              </Link>
            </div>
          )}
        </GlassCard>

        {!profileVerified && (
          <GlassCard className="space-y-3 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Profile completeness</span>
              <span className="text-muted-foreground">{profileCompleteness.percent}%</span>
            </div>
            <Progress value={profileCompleteness.percent} className="h-2" />
            {profileCompleteness.missingFields.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Missing: {profileCompleteness.missingFields.slice(0, 4).join(", ")}
                {profileCompleteness.missingFields.length > 4 ? "…" : ""}
              </p>
            )}
          </GlassCard>
        )}

        {latestRemark && (
          <GlassCard className="p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Latest Remark
            </p>
            <p className="mt-2 text-sm leading-relaxed">{latestRemark}</p>
            {latestNote && (
              <p className="mt-2 text-xs text-muted-foreground">
                {latestNote.createdByName ?? "Team"} ·{" "}
                {latestNote.createdAt ? formatDate(latestNote.createdAt) : ""}
              </p>
            )}
          </GlassCard>
        )}
      </aside>

      <div className="min-w-0 space-y-4">
        <Tabs defaultValue="personal">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
            <TabsTrigger value="personal">Student profile</TabsTrigger>
            <TabsTrigger value="application">Loan Details</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="loan">Loan Summary</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="mt-4">
            <GlassCard className="space-y-6 p-5">
              <div>
                <SectionHeader
                  title="Student profile"
                  icon={UserRound}
                  studentId={student._id}
                  section="profile"
                  canWrite={canWrite}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="text-sm font-medium">
                      {[student.firstName, student.lastName].filter(Boolean).join(" ") || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone Number</p>
                    <p className="text-sm">{student.phone ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm">{student.email ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Gender</p>
                    <p className="text-sm capitalize">{student.gender ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Date of Birth</p>
                    <p className="text-sm">{student.dob ? formatDate(student.dob) : "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Country</p>
                    <p className="text-sm">{student.targetCountry ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Intake</p>
                    <p className="text-sm">{student.targetIntake ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">University</p>
                    <p className="text-sm">{student.targetUniversity ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Target Degree</p>
                    <p className="text-sm">{student.targetDegree ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="text-sm">{formatDate(student.createdAt)}</p>
                  </div>
                </div>
              </div>

              {student.partnerId && (
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground">Partner</p>
                  <Link
                    href={`/dashboard/partners/${student.partnerId._id}`}
                    className="mt-1 inline-block text-sm font-semibold text-primary hover:underline"
                  >
                    {student.partnerId.companyName}
                  </Link>
                  {(student.partnerId.phone || student.partnerId.email) && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {[student.partnerId.phone, student.partnerId.email].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
              )}

            </GlassCard>
          </TabsContent>

          <TabsContent value="application" className="mt-4 space-y-3">
            {canWrite ? (
              <div className="flex justify-end">
                <SectionEditButton studentId={student._id} section="loan" />
              </div>
            ) : null}
            <StudentApplicationPanel
              key={`${student._id}-${loanApplications.length}-${loanApplications.map((entry) => `${entry._id}-${entry.sentToBank}`).join("-")}`}
              studentId={student._id}
              canWrite={canWrite}
              loanApplications={loanApplications}
              onBankActivity={handleBankActivity}
            />
          </TabsContent>

          <TabsContent value="timeline" className="mt-4">
            <GlassCard className="p-5">
              <Timeline
                items={timeline.map((t, i) => ({
                  id: t._id?.toString() ?? String(i),
                  title: t.status.replace(/_/g, " "),
                  description: t.note ?? `Updated by ${t.createdByName ?? "System"}`,
                  timestamp: t.createdAt ?? new Date(),
                }))}
              />
            </GlassCard>
          </TabsContent>

          <TabsContent value="documents" className="mt-4">
            <GlassCard className="space-y-6 p-5">
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
              <div className="mb-4 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">Loan summary</h3>
                {canWrite ? (
                  <SectionEditButton studentId={student._id} section="loan" />
                ) : null}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><p className="text-xs text-muted-foreground">Requested</p><p className="text-lg font-semibold">{formatLoanAmount(student.loan?.requested ?? 0, student.loan?.currency)}</p></div>
                <div><p className="text-xs text-muted-foreground">Sanctioned</p><p className="text-lg font-semibold">{formatLoanAmount(student.loan?.sanctioned ?? 0, student.loan?.currency)}</p></div>
                <div><p className="text-xs text-muted-foreground">Disbursed</p><p className="text-lg font-semibold">{formatLoanAmount(student.loan?.disbursed ?? 0, student.loan?.currency)}</p></div>
                <div><p className="text-xs text-muted-foreground">Disbursement Type</p><p className="text-lg font-semibold">{getDisbursementTypeLabel(student.loan?.disbursementType)}</p></div>
                <div><p className="text-xs text-muted-foreground">Currency</p><p className="text-lg font-semibold">{student.loan?.currency ?? "INR"}</p></div>
                <div><p className="text-xs text-muted-foreground">Lender</p><p className="text-sm">{lenderName ?? "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">ROI / Interest</p><p className="text-lg font-semibold">{student.loan?.roi != null && student.loan.roi > 0 ? `${student.loan.roi}%` : student.loan?.interest != null && student.loan.interest > 0 ? `${student.loan.interest}%` : "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">Processing Fee</p><p className="text-lg font-semibold">{formatLoanAmount(student.loan?.processingFee ?? 0, student.loan?.currency)}</p></div>
                <div><p className="text-xs text-muted-foreground">PF Paid</p><p className="text-sm">{student.loan?.pfPaid ? "Yes" : "No"}</p></div>
                <div><p className="text-xs text-muted-foreground">Bank LAN</p><p className="text-sm font-mono">{student.loan?.applicationNumber ?? "—"}</p></div>
              </div>
            </GlassCard>
          </TabsContent>

          <TabsContent value="notes" className="mt-4 space-y-4">
            {canWrite && (
              <GlassCard className="overflow-visible p-5">
                <form key={noteFormKey} onSubmit={handleAddNote} className="flex flex-col gap-2 sm:flex-row sm:items-start">
                  <NoteMentionInput teamUsers={teamUsers} required className="flex-1" />
                  <Input name="dueDate" type="date" className="w-full sm:w-40" />
                  <Button type="submit" disabled={noteLoading}>Add</Button>
                </form>
              </GlassCard>
            )}
            <GlassCard className="p-5">
              {(student.notes ?? []).length > 0 ? (
                <div className="space-y-3">
                  {[...(student.notes ?? [])]
                    .sort((a, b) => {
                      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                      return bTime - aTime;
                    })
                    .map((note, i) => (
                      <div key={note._id?.toString() ?? i} className="rounded-lg border p-3">
                        <NoteContent content={note.content} teamUsers={teamUsers} />
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
        </Tabs>
      </div>
    </div>
  );
}
