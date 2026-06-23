import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { StudentDetailView } from "@/components/dashboard/student-detail";
import { getStudentById } from "@/lib/actions/student.actions";
import { deriveApplicationStatus } from "@/lib/constants/application-status";
import { requireModuleEnabled } from "@/lib/auth/module-guard";
import { getStudentPageAccess, requirePagePermission } from "@/lib/auth/page-access";
import { PERMISSIONS } from "@/lib/constants/permissions";

function resolvePartner(partnerRaw: unknown) {
  if (
    partnerRaw &&
    typeof partnerRaw === "object" &&
    partnerRaw !== null &&
    "companyName" in partnerRaw
  ) {
    const partner = partnerRaw as {
      _id: { toString(): string };
      companyName: string;
      phone?: string;
      email?: string;
    };
    return {
      _id: partner._id.toString(),
      companyName: partner.companyName,
      phone: partner.phone,
      email: partner.email,
    };
  }
  return null;
}

function resolveAssignee(assigneeRaw: unknown) {
  if (
    assigneeRaw &&
    typeof assigneeRaw === "object" &&
    assigneeRaw !== null &&
    "name" in assigneeRaw
  ) {
    const assignee = assigneeRaw as {
      _id: { toString(): string };
      name: string;
      email?: string;
    };
    return {
      _id: assignee._id.toString(),
      name: assignee.name,
      email: assignee.email,
    };
  }
  return null;
}

function resolveLender(lenderRaw: unknown) {
  if (
    lenderRaw &&
    typeof lenderRaw === "object" &&
    lenderRaw !== null &&
    "name" in lenderRaw
  ) {
    const lender = lenderRaw as {
      _id: { toString(): string };
      name: string;
      slug?: string;
    };
    return {
      _id: lender._id.toString(),
      name: lender.name,
      slug: lender.slug,
    };
  }
  return null;
}

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireModuleEnabled("students");
  await requirePagePermission(PERMISSIONS.STUDENTS_READ);

  const { id } = await params;
  const access = await getStudentPageAccess();
  const student = await getStudentById(id);
  if (!student) notFound();

  const lender = resolveLender(student.loan?.lenderId);

  return (
    <div className="space-y-6">
      <PageHeader title="Student Details" />
      <StudentDetailView
        canWrite={access.canWrite}
        student={{
          _id: student._id.toString(),
          studentId: student.studentId,
          firstName: student.firstName,
          lastName: student.lastName,
          photo: student.photo,
          phone: student.phone,
          whatsapp: student.whatsapp,
          email: student.email,
          gender: student.gender,
          dob: student.dob,
          status: student.status,
          remarks: student.remarks,
          targetCountry: student.targetCountry,
          targetIntake: student.targetIntake,
          targetDegree: student.targetDegree,
          targetUniversity: student.targetUniversity,
          admissionRevenue: student.admissionRevenue,
          applicationStatus: deriveApplicationStatus(student),
          sentToBank: student.sentToBank,
          sentToBankAt: student.sentToBankAt,
          sentToBankByName: student.sentToBankByName,
          loggedIn: student.loggedIn,
          assignedAt: student.assignedAt,
          address: student.address,
          aadhaar: student.aadhaar,
          pan: student.pan,
          education: student.education,
          loan: student.loan
            ? {
                ...student.loan,
                lenderId: lender,
              }
            : undefined,
          documents: student.documents?.map((d) => ({
            _id: d._id?.toString(),
            name: d.name,
            url: d.url,
            mimeType: d.mimeType,
          })),
          timeline: student.timeline?.map((t) => ({
            _id: t._id?.toString(),
            status: t.status,
            note: t.note,
            createdByName: t.createdByName,
            createdAt: t.createdAt,
          })),
          notes: student.notes?.map((n) => ({
            _id: n._id?.toString(),
            content: n.content,
            createdByName: n.createdByName,
            dueDate: n.dueDate,
            createdAt: n.createdAt,
          })),
          partnerId: resolvePartner(student.partnerId),
          assignedTo: resolveAssignee(student.assignedTo),
          metadata: student.metadata
            ? {
                createdByName: student.metadata.createdByName,
              }
            : undefined,
          createdAt: student.createdAt,
        }}
      />
    </div>
  );
}
