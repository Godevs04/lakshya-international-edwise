import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { StudentsTable } from "@/components/tables/students-table";
import {
  getAssignableUsers,
  getStudents,
} from "@/lib/actions/student.actions";
import { getPartnersList } from "@/lib/actions/partner.actions";
import { requireModuleEnabled } from "@/lib/auth/module-guard";
import { getStudentPageAccess, requirePagePermission } from "@/lib/auth/page-access";
import { PERMISSIONS } from "@/lib/constants/permissions";
import type { StudentListFilters } from "@/lib/utils/student-list-filters";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

function parseFilters(
  params: Record<string, string | undefined>
): StudentListFilters {
  return {
    page: params.page,
    search: params.search,
    status: params.status,
    stage: params.stage,
    mine: params.mine,
    partnerId: params.partnerId,
    assignedToId: params.assignedToId,
    targetCountry: params.targetCountry,
    targetIntake: params.targetIntake,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    loanMin: params.loanMin,
    loanMax: params.loanMax,
    state: params.state,
    college: params.college,
    course: params.course,
    bank: params.bank,
  };
}

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireModuleEnabled("students");
  await requirePagePermission(PERMISSIONS.STUDENTS_READ);

  const params = await searchParams;
  const filters = parseFilters(params);
  const access = await getStudentPageAccess();

  const [result, partners, assignableUsers] = await Promise.all([
    getStudents({
      page: parseInt(params.page ?? "1", 10),
      search: params.search,
      status: params.status,
      stage: params.stage,
      partnerId: params.partnerId,
      assignedToId: params.assignedToId,
      targetCountry: params.targetCountry,
      targetIntake: params.targetIntake,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
      loanMin: params.loanMin ? Number(params.loanMin) : undefined,
      loanMax: params.loanMax ? Number(params.loanMax) : undefined,
      state: params.state,
      college: params.college,
      course: params.course,
      bank: params.bank,
      mine: params.mine === "1",
    }),
    getPartnersList(),
    getAssignableUsers(),
  ]);

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
      <StudentsTable
        {...result}
        {...access}
        canWrite={access.canWrite}
        filters={filters}
        partners={partners.map((partner) => ({
          _id: partner._id.toString(),
          companyName: partner.companyName,
        }))}
        assignableUsers={assignableUsers.map((user) => ({
          _id: user._id,
          name: user.name,
        }))}
      />
    </div>
  );
}
