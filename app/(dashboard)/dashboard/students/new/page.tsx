import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { StudentForm } from "@/components/forms/student-form";
import { getPartnersList } from "@/lib/actions/partner.actions";
import { requireModuleEnabled } from "@/lib/auth/module-guard";
import { getStudentPageAccess } from "@/lib/auth/page-access";

export default async function NewStudentPage() {
  await requireModuleEnabled("students");
  const access = await getStudentPageAccess();
  if (!access.canWrite) {
    redirect("/dashboard/students");
  }

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
