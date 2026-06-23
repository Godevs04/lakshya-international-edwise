import { PageHeader } from "@/components/dashboard/page-header";
import { TaskFormSheet } from "@/components/dashboard/task-form-sheet";
import { TasksTable } from "@/components/tables/tasks-table";
import { getTasks } from "@/lib/actions/task.actions";
import { getAssignableUsers } from "@/lib/actions/student.actions";
import { requireModuleEnabled } from "@/lib/auth/module-guard";
import { getStudentPageAccess, requirePagePermission } from "@/lib/auth/page-access";
import { PERMISSIONS } from "@/lib/constants/permissions";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  await requireModuleEnabled("tasks");
  await requirePagePermission(PERMISSIONS.STUDENTS_READ);

  const params = await searchParams;
  const access = await getStudentPageAccess();
  const status = params.status === "all" ? undefined : params.status || "open";

  const [result, assignableUsers] = await Promise.all([
    getTasks({
      page: parseInt(params.page ?? "1", 10),
      status,
    }),
    getAssignableUsers(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        description="Follow-ups, reminders, and team assignments"
        badge="Workflow"
        action={<TaskFormSheet assignableUsers={assignableUsers} canWrite={access.canWrite} />}
      />
      <TasksTable
        {...result}
        status={params.status ?? "open"}
        canWrite={access.canWrite}
        assignableUsers={assignableUsers}
      />
    </div>
  );
}
