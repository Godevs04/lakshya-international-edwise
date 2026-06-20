import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { StudentsTable } from "@/components/tables/students-table";
import { getStudents } from "@/lib/actions/student.actions";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

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
        badge="CRM"
        action={
          <Link href="/dashboard/students/new">
            <Button><Plus className="mr-1.5 h-4 w-4" /> Add Student</Button>
          </Link>
        }
      />
      <StudentsTable {...result} />
    </div>
  );
}
