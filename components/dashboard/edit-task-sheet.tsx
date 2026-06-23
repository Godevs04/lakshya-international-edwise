"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AssigneeSelect, mergeAssigneeOptions } from "@/components/forms/assignee-select";
import { updateTaskAction } from "@/lib/actions/task.actions";
import { toDatetimeLocalValue } from "@/lib/utils/format";
import type { TaskListItem } from "@/types";

interface AssigneeOption {
  _id: string;
  name: string;
}

interface EditTaskSheetProps {
  task: TaskListItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignableUsers: AssigneeOption[];
}

export function EditTaskSheet({
  task,
  open,
  onOpenChange,
  assignableUsers,
}: EditTaskSheetProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [assignedToId, setAssignedToId] = useState(task.assignedToId ?? "");

  const assigneeOptions = mergeAssigneeOptions(
    assignableUsers,
    task.assignedToId,
    task.assignedToName
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!assignedToId) {
      notify.error("Please select an assignee");
      return;
    }

    const form = e.currentTarget;
    setLoading(true);
    const formData = new FormData(form);
    formData.set("taskId", task._id);
    formData.set("assignedToId", assignedToId);

    const studentId = formData.get("studentId");
    if (typeof studentId === "string" && !studentId.trim()) {
      formData.delete("studentId");
    }

    const result = await updateTaskAction(formData);
    if (result.success) {
      notify.success("Task updated");
      onOpenChange(false);
      router.refresh();
    } else {
      notify.error(result.error ?? "Failed to update task");
    }
    setLoading(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-md">
        <SheetHeader className="border-b border-[#6D5EF7]/10">
          <SheetTitle>Edit Task</SheetTitle>
          <SheetDescription>Update follow-up details for this open task.</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 p-4">
          <div className="space-y-2">
            <Label htmlFor="edit-task-title">Title</Label>
            <Input
              id="edit-task-title"
              name="title"
              required
              className="w-full"
              defaultValue={task.title}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-task-description">Description (optional)</Label>
            <Textarea
              id="edit-task-description"
              name="description"
              rows={3}
              className="w-full resize-none"
              defaultValue={task.description ?? ""}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-task-dueAt">Due date & time</Label>
              <Input
                id="edit-task-dueAt"
                name="dueAt"
                type="datetime-local"
                required
                className="w-full"
                defaultValue={toDatetimeLocalValue(task.dueAt)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-task-reminderAt">Reminder (optional)</Label>
              <Input
                id="edit-task-reminderAt"
                name="reminderAt"
                type="datetime-local"
                className="w-full"
                defaultValue={toDatetimeLocalValue(task.reminderAt)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-task-assignedToId">Assigned to</Label>
            <AssigneeSelect
              id="edit-task-assignedToId"
              users={assigneeOptions}
              value={assignedToId}
              onValueChange={setAssignedToId}
              placeholder="Select assignee"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-task-studentId">Linked student (optional)</Label>
            <Input
              id="edit-task-studentId"
              name="studentId"
              className="w-full"
              placeholder="Student ID (e.g. STU-001) — optional"
              defaultValue={task.studentCode ?? task.studentId ?? ""}
            />
          </div>

          <SheetFooter className="mt-auto px-0 pt-2">
            <Button type="submit" disabled={loading || !assignedToId} className="w-full">
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
