import { PageHeader } from "@/components/dashboard/page-header";
import { StudentForm } from "@/components/forms/student-form";
import { getPartnersList } from "@/lib/actions/partner.actions";

export default async function NewStudentPage() {
  const partners = await getPartnersList();
  return (
    <div className="space-y-6">
      <PageHeader title="Add Student" description="Create a new student record" />
      <StudentForm
        partners={partners.map((p) => ({ _id: p._id.toString(), companyName: p.companyName }))}
        mode="create"
      />
    </div>
  );
}
