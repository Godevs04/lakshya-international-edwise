import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { AdmissionForm } from "@/components/forms/admission-form";
import { getAdmissionForEdit } from "@/lib/actions/admission.actions";
import { getAssignableUsers } from "@/lib/actions/student.actions";
import { requireModuleEnabled } from "@/lib/auth/module-guard";
import { getAdmissionsPageAccess } from "@/lib/auth/page-access";
import {
  ADMISSION_EDIT_SECTIONS,
  parseAdmissionEditSection,
} from "@/lib/constants/admission-edit-sections";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function EditAdmissionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ section?: string }>;
}) {
  await requireModuleEnabled("students");
  const access = await getAdmissionsPageAccess();
  if (!access.canWrite) {
    redirect("/dashboard/admissions");
  }

  const { id } = await params;
  const { section: sectionParam } = await searchParams;
  const focusSection = parseAdmissionEditSection(sectionParam);

  const [admission, assignableUsers] = await Promise.all([
    getAdmissionForEdit(id),
    getAssignableUsers(),
  ]);
  if (!admission) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          focusSection
            ? `Edit ${ADMISSION_EDIT_SECTIONS[focusSection].label}`
            : "Edit Admission"
        }
        description={admission.studentId}
        action={
          <Link href={`/dashboard/admissions/${id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to admission
            </Button>
          </Link>
        }
      />
      <AdmissionForm
        admissionId={id}
        focusSection={focusSection}
        canViewRevenue={access.canViewRevenue}
        assignableUsers={assignableUsers.map((user) => ({ _id: user._id, name: user.name }))}
        initialData={{
          firstName: admission.firstName,
          lastName: admission.lastName,
          phone: admission.phone,
          targetCountry: admission.targetCountry,
          targetIntake: admission.targetIntake,
          targetUniversity: admission.targetUniversity,
          admissionRevenue: admission.admissionRevenue,
          assignedToId: admission.assignedToId,
          assignedToName: admission.assignedToName,
        }}
      />
    </div>
  );
}
