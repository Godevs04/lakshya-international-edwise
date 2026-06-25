import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { StudentForm } from "@/components/forms/student-form";
import { getStudentForEdit, getAssignableUsers } from "@/lib/actions/student.actions";
import { getLenderOptionsAction } from "@/lib/actions/lender.actions";
import { getPartnersList } from "@/lib/actions/partner.actions";
import { requireModuleEnabled } from "@/lib/auth/module-guard";
import { getStudentPageAccess } from "@/lib/auth/page-access";
import { format } from "date-fns";

export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireModuleEnabled("students");
  const access = await getStudentPageAccess();
  if (!access.canWrite) {
    redirect("/dashboard/students");
  }

  const { id } = await params;
  const [student, partners, assignableUsers, lenderOptions] = await Promise.all([
    getStudentForEdit(id),
    getPartnersList(),
    getAssignableUsers(),
    getLenderOptionsAction(),
  ]);
  if (!student) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Student" description={student.studentId} />
      <StudentForm
        mode="edit"
        studentId={id}
        partners={partners.map((p) => ({ _id: p._id.toString(), companyName: p.companyName }))}
        assignableUsers={assignableUsers.map((u) => ({ _id: u._id, name: u.name }))}
        lenderOptions={lenderOptions}
        initialData={{
          firstName: student.firstName,
          lastName: student.lastName,
          gender: student.gender,
          dob: student.dob ? format(new Date(student.dob), "yyyy-MM-dd") : undefined,
          phone: student.phone,
          whatsapp: student.whatsapp,
          email: student.email,
          photo: student.photo,
          addressLine: student.address?.line,
          city: student.address?.city,
          state: student.address?.state,
          pincode: student.address?.pincode,
          aadhaar: student.aadhaar,
          pan: student.pan,
          college: student.education?.college,
          course: student.education?.course,
          year: student.education?.year,
          loanRequested: student.loan?.requested,
          loanSanctioned: student.loan?.sanctioned,
          loanDisbursed: student.loan?.disbursed,
          disbursementType: student.loan?.disbursementType,
          interest: student.loan?.interest,
          applicationNumber: student.loan?.applicationNumber,
          partnerId:
            student.partnerId && typeof student.partnerId === "object"
              ? "_id" in student.partnerId
                ? String(student.partnerId._id)
                : String(student.partnerId)
              : student.partnerId
                ? String(student.partnerId)
                : undefined,
          commissionPercentOverride: student.commissionPercentOverride,
          assignedToId:
            student.assignedTo && typeof student.assignedTo === "object"
              ? "_id" in student.assignedTo
                ? String(student.assignedTo._id)
                : String(student.assignedTo)
              : student.assignedTo
                ? String(student.assignedTo)
                : "",
          assignedToName:
            student.assignedTo && typeof student.assignedTo === "object" && "name" in student.assignedTo
              ? String(student.assignedTo.name)
              : undefined,
          targetCountry: student.targetCountry,
          targetIntake: student.targetIntake,
          targetDegree: student.targetDegree,
          targetUniversity: student.targetUniversity,
          admissionRevenue: student.admissionRevenue,
          applicationStatus: student.applicationStatus as string | undefined,
          loanCurrency: student.loanCurrency as string | undefined,
          lenderId: student.lenderId as string | undefined,
          roi: student.roi as number | undefined,
          processingFee: student.processingFee as number | undefined,
          status: student.status,
          remarks: student.remarks,
        }}
      />
    </div>
  );
}
