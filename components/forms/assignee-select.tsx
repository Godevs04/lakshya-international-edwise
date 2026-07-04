"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const UNASSIGNED_ASSIGNEE = "__unassigned__";

export interface AssigneeOption {
  _id: string;
  name: string;
}

interface AssigneeSelectProps {
  id?: string;
  users: AssigneeOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  allowUnassigned?: boolean;
  triggerClassName?: string;
}

function buildAssigneeItems(users: AssigneeOption[], allowUnassigned: boolean) {
  return [
    ...(allowUnassigned ? [{ value: UNASSIGNED_ASSIGNEE, label: "Unassigned" }] : []),
    ...users.map((user) => ({ value: user._id, label: user.name })),
  ];
}

export function AssigneeSelect({
  id,
  users,
  value,
  onValueChange,
  placeholder = "Select assignee",
  allowUnassigned = false,
  triggerClassName,
}: AssigneeSelectProps) {
  const items = buildAssigneeItems(users, allowUnassigned);
  const selectValue = value || (allowUnassigned ? UNASSIGNED_ASSIGNEE : "");

  return (
    <Select
      value={selectValue}
      onValueChange={(next) =>
        onValueChange(next === UNASSIGNED_ASSIGNEE ? "" : (next ?? ""))
      }
      items={items}
    >
      <SelectTrigger id={id} className={cn("w-full", triggerClassName)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {allowUnassigned ? (
          <SelectItem value={UNASSIGNED_ASSIGNEE}>Unassigned</SelectItem>
        ) : null}
        {users.map((user) => (
          <SelectItem key={user._id} value={user._id}>
            {user.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function mergeAssigneeOptions(
  users: AssigneeOption[],
  selectedId?: string,
  selectedName?: string
): AssigneeOption[] {
  if (!selectedId || users.some((user) => user._id === selectedId)) {
    return users;
  }

  if (selectedName) {
    return [...users, { _id: selectedId, name: selectedName }];
  }

  return users;
}
