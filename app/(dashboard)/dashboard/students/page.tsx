import { PageHeader } from "@/components/dashboard/page-header";
import { StudentsTable } from "@/components/tables/students-table";
import { getStudents } from "@/lib/actions/student.actions";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}) {
  const params = await searchParams;
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
      />
      <StudentsTable {...result} />
    </div>
  );
}
