import Link from "next/link";
import { GlassCard } from "@/components/cards/glass-card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import {
  getAdmissionEditHref,
  type AdmissionEditSectionKey,
} from "@/lib/constants/admission-edit-sections";
import { GraduationCap, Pencil, UserRound, Wallet } from "lucide-react";

interface AdmissionDetailViewProps {
  admission: {
    _id: string;
    studentId: string;
    firstName: string;
    lastName: string;
    phone?: string;
    targetCountry?: string;
    targetIntake?: string;
    targetUniversity?: string;
    admissionRevenue?: number;
    assignedTo?: { _id: string; name: string } | null;
    createdAt: Date;
  };
  canWrite?: boolean;
  canViewRevenue?: boolean;
}

function SectionEditButton({
  admissionId,
  section,
}: {
  admissionId: string;
  section: AdmissionEditSectionKey;
}) {
  return (
    <Link href={getAdmissionEditHref(admissionId, section)}>
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
  admissionId,
  section,
  canWrite,
}: {
  title: string;
  icon: typeof UserRound;
  admissionId: string;
  section: AdmissionEditSectionKey;
  canWrite: boolean;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {title}
      </h3>
      {canWrite ? <SectionEditButton admissionId={admissionId} section={section} /> : null}
    </div>
  );
}

export function AdmissionDetailView({
  admission,
  canWrite = false,
  canViewRevenue = false,
}: AdmissionDetailViewProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <GlassCard className="p-5">
          <h2 className="text-lg font-semibold">
            {admission.firstName} {admission.lastName}
          </h2>
          <p className="text-sm text-muted-foreground">{admission.studentId}</p>
          <p className="mt-3 text-sm">
            <span className="text-muted-foreground">Created:</span>{" "}
            {formatDate(admission.createdAt)}
          </p>
          {canWrite ? (
            <div className="mt-4">
              <Link href={`/dashboard/admissions/${admission._id}/edit`} className="block">
                <Button variant="outline" size="sm" className="w-full">
                  <Pencil className="mr-1 h-4 w-4" /> Edit all sections
                </Button>
              </Link>
            </div>
          ) : null}
        </GlassCard>
      </aside>

      <GlassCard className="space-y-6 p-5">
        <div>
          <SectionHeader
            title="Student profile"
            icon={UserRound}
            admissionId={admission._id}
            section="profile"
            canWrite={canWrite}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="text-sm font-medium">
                {admission.firstName} {admission.lastName}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Number</p>
              <p className="text-sm">{admission.phone?.trim() ? admission.phone : "-"}</p>
            </div>
          </div>
        </div>

        <div>
          <SectionHeader
            title="Study abroad"
            icon={GraduationCap}
            admissionId={admission._id}
            section="study"
            canWrite={canWrite}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Country</p>
              <p className="text-sm">{admission.targetCountry?.trim() ? admission.targetCountry : "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Intake</p>
              <p className="text-sm">{admission.targetIntake?.trim() ? admission.targetIntake : "-"}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-muted-foreground">University</p>
              <p className="text-sm">
                {admission.targetUniversity?.trim() ? admission.targetUniversity : "-"}
              </p>
            </div>
          </div>
        </div>

        <div>
          <SectionHeader
            title="Assignment"
            icon={UserRound}
            admissionId={admission._id}
            section="assignment"
            canWrite={canWrite}
          />
          <p className="text-sm">{admission.assignedTo?.name ?? "Unassigned"}</p>
        </div>

        {canViewRevenue ? (
          <div>
            <SectionHeader
              title="Admission revenue"
              icon={Wallet}
              admissionId={admission._id}
              section="revenue"
              canWrite={canWrite}
            />
            <p className="text-lg font-semibold">
              {admission.admissionRevenue != null && admission.admissionRevenue > 0
                ? formatCurrency(admission.admissionRevenue)
                : "-"}
            </p>
          </div>
        ) : null}
      </GlassCard>
    </div>
  );
}
