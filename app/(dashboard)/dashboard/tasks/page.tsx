import { PageHeader } from "@/components/dashboard/page-header";
import { TaskFormSheet } from "@/components/dashboard/task-form-sheet";
import { TaskSummaryCards } from "@/components/dashboard/task-summary-cards";
import { TasksTable } from "@/components/tables/tasks-table";
import { getTasks, getTaskSummary } from "@/lib/actions/task.actions";
import { getAssignableUsers } from "@/lib/actions/student.actions";
import { requireModuleEnabled } from "@/lib/auth/module-guard";
import { getStudentPageAccess, requirePagePermission } from "@/lib/auth/page-access";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { auth } from "@/lib/auth/auth";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    status?: string;
    mine?: string;
    overdue?: string;
    dueToday?: string;
  }>;
}) {
  await requireModuleEnabled("tasks");
  await requirePagePermission(PERMISSIONS.STUDENTS_READ);

  const params = await searchParams;
  const session = await auth();
  const access = await getStudentPageAccess();

  const isMine = params.mine === "1";
  const isOverdue = params.overdue === "1";
  const isDueToday = params.dueToday === "1";
  const status =
    isOverdue || isDueToday || isMine
      ? "open"
      : params.status === "all"
        ? undefined
        : params.status || "open";

  const activeView = isMine ? "mine" : isOverdue ? "overdue" : isDueToday ? "dueToday" : undefined;

  const [result, assignableUsers, summary] = await Promise.all([
    getTasks({
      page: parseInt(params.page ?? "1", 10),
      status,
      mine: isMine,
      overdue: isOverdue,
      dueToday: isDueToday,
    }),
    getAssignableUsers(),
    getTaskSummary(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        description="Assign follow-ups to your team — assignees get in-app alerts and email reminders"
        badge="Workflow"
        action={
          <TaskFormSheet
            assignableUsers={assignableUsers}
            canWrite={access.canWrite}
            currentUserId={session?.user?.id}
          />
        }
      />
      <TaskSummaryCards
        myOpen={summary.myOpen}
        overdue={summary.overdue}
        dueToday={summary.dueToday}
        activeView={activeView}
      />
      <TasksTable
        {...result}
        status={params.status ?? "open"}
        view={activeView}
        canWrite={access.canWrite}
        assignableUsers={assignableUsers}
        currentUserId={session?.user?.id}
      />
    </div>
  );
}
