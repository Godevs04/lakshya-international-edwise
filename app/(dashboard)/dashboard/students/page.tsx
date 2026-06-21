import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { StudentsTable } from "@/components/tables/students-table";
import { getStudents } from "@/lib/actions/student.actions";
import { requireModuleEnabled } from "@/lib/auth/module-guard";
import { getStudentPageAccess, requirePagePermission } from "@/lib/auth/page-access";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}) {
  await requireModuleEnabled("students");
  await requirePagePermission(PERMISSIONS.STUDENTS_READ);

  const params = await searchParams;
  const access = await getStudentPageAccess();
  const result = await getStudents({
    page: parseInt(params.page ?? "1", 10),
    search: params.search,
    status: params.status,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        description="Manage your student CRM records"
        badge="CRM"
        action={
          access.canWrite ? (
            <Link href="/dashboard/students/new">
              <Button><Plus className="mr-1.5 h-4 w-4" /> Add Student</Button>
            </Link>
          ) : undefined
        }
      />
      <StudentsTable {...result} {...access} canWrite={access.canWrite} />
    </div>
  );
}
