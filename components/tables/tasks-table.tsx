"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { notify } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GlassCard } from "@/components/cards/glass-card";
import { EditTaskSheet } from "@/components/dashboard/edit-task-sheet";
import { formatDateTime } from "@/lib/utils/format";
import { deleteTaskAction, updateTaskStatusAction } from "@/lib/actions/task.actions";
import type { TaskListItem } from "@/types";
import {
  Ban,
  CheckCircle2,
  Pencil,
  RotateCcw,
  Trash2,
} from "lucide-react";

interface AssigneeOption {
  _id: string;
  name: string;
}

interface TasksTableProps {
  data: TaskListItem[];
  total: number;
  page: number;
  totalPages: number;
  status?: string;
  canWrite?: boolean;
  assignableUsers?: AssigneeOption[];
}

const STATUS_TABS = [
  { id: "open", label: "Open" },
  { id: "done", label: "Done" },
  { id: "cancelled", label: "Cancelled" },
  { id: "all", label: "All" },
] as const;

const STATUS_STYLES: Record<TaskListItem["status"], string> = {
  open: "bg-[#6D5EF7]/12 text-[#6D5EF7] border-[#6D5EF7]/25",
  done: "bg-[#22C55E]/12 text-[#22C55E] border-[#22C55E]/25",
  cancelled: "bg-muted/80 text-muted-foreground border-border/50",
};

function TaskStatusBadge({ status }: { status: TaskListItem["status"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
        STATUS_STYLES[status]
      )}
    >
      {status}
    </span>
  );
}

export function TasksTable({
  data,
  total,
  page,
  totalPages,
  status,
  canWrite = false,
  assignableUsers = [],
}: TasksTableProps) {
  const router = useRouter();
  const currentStatus = status || "open";
  const [editingTask, setEditingTask] = useState<TaskListItem | null>(null);

  function navigate(nextStatus?: string) {
    const params = new URLSearchParams();
    if (nextStatus && nextStatus !== "open") {
      params.set("status", nextStatus);
    }
    const query = params.toString();
    router.push(query ? `/dashboard/tasks?${query}` : "/dashboard/tasks");
  }

  async function updateStatus(id: string, nextStatus: TaskListItem["status"], message: string) {
    const result = await updateTaskStatusAction(id, nextStatus);
    if (result.success) {
      notify.success(message);
      router.refresh();
    } else {
      notify.error(result.error ?? "Failed to update task");
    }
  }

  async function removeTask(id: string, title: string) {
    const confirmed = window.confirm(`Delete task "${title}"? This cannot be undone.`);
    if (!confirmed) return;

    const result = await deleteTaskAction(id);
    if (result.success) {
      notify.success("Task deleted");
      router.refresh();
    } else {
      notify.error(result.error ?? "Failed to delete task");
    }
  }

  return (
    <div className="space-y-4">
      <GlassCard className="p-4">
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {STATUS_TABS.map((tab) => {
            const isActive = currentStatus === tab.id || (tab.id === "open" && !status);
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => navigate(tab.id === "open" ? undefined : tab.id)}
                className={cn(
                  "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "border-[#6D5EF7] bg-[#6D5EF7] text-white shadow-sm"
                    : "border-[#6D5EF7]/15 bg-white/60 text-muted-foreground hover:border-[#6D5EF7]/30 hover:bg-[#6D5EF7]/8 hover:text-foreground dark:bg-white/5"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </GlassCard>

      <GlassCard className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[220px]">Task</TableHead>
              <TableHead className="min-w-[160px] whitespace-nowrap">Due</TableHead>
              <TableHead className="min-w-[120px]">Assignee</TableHead>
              <TableHead className="min-w-[140px]">Student</TableHead>
              <TableHead className="w-[110px]">Status</TableHead>
              {canWrite ? <TableHead className="w-[148px] text-right">Actions</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canWrite ? 6 : 5} className="py-10 text-center text-muted-foreground">
                  No tasks found
                </TableCell>
              </TableRow>
            ) : (
              data.map((task) => (
                <TableRow key={task._id}>
                  <TableCell className="py-4 align-top">
                    <div className="min-w-0">
                      <p className="font-medium leading-snug">{task.title}</p>
                      {task.description ? (
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {task.description}
                        </p>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap py-4 align-top text-sm">
                    {formatDateTime(task.dueAt)}
                  </TableCell>
                  <TableCell className="py-4 align-top text-sm">
                    {task.assignedToName ?? "—"}
                  </TableCell>
                  <TableCell className="py-4 align-top text-sm">
                    {task.studentId ? (
                      <Link
                        href={`/dashboard/students/${task.studentId}`}
                        className="text-[#6D5EF7] hover:underline"
                      >
                        {task.studentName || "View student"}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="py-4 align-top">
                    <TaskStatusBadge status={task.status} />
                  </TableCell>
                  {canWrite ? (
                    <TableCell className="py-4 align-top">
                      <div className="flex items-center justify-end gap-0.5">
                        {task.status === "open" ? (
                          <>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label="Edit task"
                              onClick={() => setEditingTask(task)}
                            >
                              <Pencil className="h-4 w-4 text-[#6D5EF7]" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label="Mark done"
                              onClick={() => updateStatus(task._id, "done", "Task marked done")}
                            >
                              <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label="Cancel task"
                              onClick={() => updateStatus(task._id, "cancelled", "Task cancelled")}
                            >
                              <Ban className="h-4 w-4 text-[#F59E0B]" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Reopen task"
                            onClick={() => updateStatus(task._id, "open", "Task reopened")}
                          >
                            <RotateCcw className="h-4 w-4 text-[#6D5EF7]" />
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Delete task"
                          onClick={() => removeTask(task._id, task.title)}
                        >
                          <Trash2 className="h-4 w-4 text-[#EF4444]" />
                        </Button>
                      </div>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </GlassCard>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {page} of {totalPages} ({total} tasks)
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => router.push(`/dashboard/tasks?page=${page - 1}${status ? `&status=${status}` : ""}`)}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => router.push(`/dashboard/tasks?page=${page + 1}${status ? `&status=${status}` : ""}`)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      {editingTask ? (
        <EditTaskSheet
          key={editingTask._id}
          task={editingTask}
          open
          onOpenChange={(open) => {
            if (!open) setEditingTask(null);
          }}
          assignableUsers={assignableUsers}
        />
      ) : null}
    </div>
  );
}
