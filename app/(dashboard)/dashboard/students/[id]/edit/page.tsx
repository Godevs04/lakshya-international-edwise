import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { StudentForm } from "@/components/forms/student-form";
import { getStudentById } from "@/lib/actions/student.actions";
import { getPartnersList } from "@/lib/actions/partner.actions";
import { format } from "date-fns";

export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [student, partners] = await Promise.all([
    getStudentById(id),
    getPartnersList(),
  ]);
  if (!student) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Student" description={student.studentId} />
      <StudentForm
        mode="edit"
        studentId={id}
        partners={partners.map((p) => ({ _id: p._id.toString(), companyName: p.companyName }))}
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
          college: student.education?.college,
          course: student.education?.course,
          year: student.education?.year,
          loanRequested: student.loan?.requested,
          loanSanctioned: student.loan?.sanctioned,
          loanDisbursed: student.loan?.disbursed,
          interest: student.loan?.interest,
          bankName: student.loan?.bankName,
          applicationNumber: student.loan?.applicationNumber,
          partnerId: student.partnerId?.toString(),
          status: student.status,
          remarks: student.remarks,
        }}
      />
    </div>
  );
}
