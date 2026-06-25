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
  SheetTrigger,
} from "@/components/ui/sheet";
import { createTaskAction } from "@/lib/actions/task.actions";
import { AssigneeSelect } from "@/components/forms/assignee-select";
import { Plus } from "lucide-react";

interface AssigneeOption {
  _id: string;
  name: string;
}

interface TaskFormSheetProps {
  assignableUsers: AssigneeOption[];
  canWrite?: boolean;
  currentUserId?: string;
}

export function TaskFormSheet({
  assignableUsers,
  canWrite = true,
  currentUserId,
}: TaskFormSheetProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assignedToId, setAssignedToId] = useState("");

  function resetForm() {
    setAssignedToId(currentUserId ?? "");
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      setAssignedToId(currentUserId ?? "");
    } else {
      resetForm();
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!assignedToId) {
      notify.error("Please select an assignee");
      return;
    }

    const form = e.currentTarget;
    setLoading(true);
    const formData = new FormData(form);
    formData.set("assignedToId", assignedToId);

    const studentId = formData.get("studentId");
    if (typeof studentId === "string" && !studentId.trim()) {
      formData.delete("studentId");
    }

    const result = await createTaskAction(formData);
    if (result.success) {
      notify.success("Task created");
      form.reset();
      resetForm();
      setOpen(false);
      router.refresh();
    } else {
      notify.error(result.error ?? "Failed to create task");
    }
    setLoading(false);
  }

  if (!canWrite) return null;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger
        render={
          <Button>
            <Plus className="mr-1.5 h-4 w-4" />
            Add Task
          </Button>
        }
      />
      <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-md">
        <SheetHeader className="border-b border-[#E8952E]/10">
          <SheetTitle>New Task</SheetTitle>
          <SheetDescription>
            Assign to a team member — they will get an in-app notification and email when the
            reminder time is reached.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 p-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              name="title"
              required
              className="w-full"
              placeholder="Call student about documents"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description">Description (optional)</Label>
            <Textarea
              id="task-description"
              name="description"
              rows={3}
              className="w-full resize-none"
              placeholder="Optional details"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="task-dueAt">Due date & time</Label>
              <Input id="task-dueAt" name="dueAt" type="datetime-local" required className="w-full" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-reminderAt">Reminder (optional)</Label>
              <Input id="task-reminderAt" name="reminderAt" type="datetime-local" className="w-full" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="task-assignedToId">Assigned to</Label>
              {currentUserId ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-[#E8952E]"
                  onClick={() => setAssignedToId(currentUserId)}
                >
                  Assign to me
                </Button>
              ) : null}
            </div>
            <AssigneeSelect
              id="task-assignedToId"
              users={assignableUsers}
              value={assignedToId}
              onValueChange={setAssignedToId}
              placeholder="Select team member"
            />
            <input type="hidden" name="assignedToId" value={assignedToId} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-studentId">Linked student (optional)</Label>
            <Input
              id="task-studentId"
              name="studentId"
              className="w-full"
              placeholder="Student ID (e.g. STU-001) — optional"
            />
          </div>

          <SheetFooter className="mt-auto px-0 pt-2">
            <Button type="submit" disabled={loading || !assignedToId} className="w-full">
              {loading ? "Saving..." : "Create Task"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
