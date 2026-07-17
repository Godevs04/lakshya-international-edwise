"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { UserRound, Building2, ListChecks, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AssigneeSelect } from "@/components/forms/assignee-select";
import { bulkUpdateStudentsAction } from "@/lib/actions/student.actions";
import { APPLICATION_STATUS_OPTIONS } from "@/lib/constants/application-status";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";

interface PartnerOption {
  _id: string;
  companyName: string;
}

interface AssigneeOption {
  _id: string;
  name: string;
}

interface StudentBulkActionsBarProps {
  selectedIds: string[];
  assignableUsers: AssigneeOption[];
  partners: PartnerOption[];
  canDelete?: boolean;
  onClear: () => void;
  onComplete: () => void;
  className?: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;

const BAR_VARIANTS = {
  hidden: { opacity: 0, y: 10, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.32, ease: EASE },
  },
  exit: {
    opacity: 0,
    y: -6,
    scale: 0.985,
    transition: { duration: 0.2, ease: EASE },
  },
};

const POD_VARIANTS = {
  hidden: { opacity: 0, y: 6 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.05 + index * 0.05, duration: 0.28, ease: EASE },
  }),
};

const SELECT_TRIGGER_CLASS = "h-8 w-full min-w-0";

function ActionPod({
  icon: Icon,
  label,
  children,
  index,
  className,
}: {
  icon: typeof UserRound;
  label: string;
  children: ReactNode;
  index: number;
  className?: string;
}) {
  return (
    <motion.div
      custom={index}
      variants={POD_VARIANTS}
      className={cn(
        "flex min-w-0 flex-col gap-2 rounded-xl border border-border/60 bg-white/85 p-3 shadow-sm backdrop-blur-sm dark:bg-white/5",
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </span>
      </div>
      {children}
    </motion.div>
  );
}

export function StudentBulkActionsBar({
  selectedIds,
  assignableUsers,
  partners,
  canDelete = false,
  onClear,
  onComplete,
  className,
}: StudentBulkActionsBarProps) {
  const [assigneeId, setAssigneeId] = useState("");
  const [partnerId, setPartnerId] = useState("");
  const [status, setStatus] = useState("");
  const [loadingAction, setLoadingAction] = useState<
    "assignee" | "unassign" | "partner" | "status" | "delete" | null
  >(null);

  const count = selectedIds.length;
  const busy = loadingAction !== null;

  async function runBulk(
    action: "assign_assignee" | "assign_partner" | "change_status" | "delete",
    value?: string
  ) {
    setLoadingAction(
      action === "assign_assignee"
        ? value === ""
          ? "unassign"
          : "assignee"
        : action === "assign_partner"
          ? "partner"
          : action === "change_status"
            ? "status"
            : "delete"
    );

    const result = await bulkUpdateStudentsAction(selectedIds, action, value);
    setLoadingAction(null);

    if (!result.success) {
      notify.error(result.error ?? "Bulk action failed");
      return;
    }

    if (action === "assign_assignee") {
      notify.success(
        value
          ? `Assigned ${count} student${count === 1 ? "" : "s"}`
          : `Unassigned ${count} student${count === 1 ? "" : "s"}`
      );
      setAssigneeId("");
    } else if (action === "assign_partner") {
      notify.success(`Updated partner for ${count} student${count === 1 ? "" : "s"}`);
      setPartnerId("");
    } else if (action === "change_status") {
      notify.success(`Updated status for ${count} student${count === 1 ? "" : "s"}`);
      setStatus("");
    } else {
      notify.success(`Deleted ${count} student${count === 1 ? "" : "s"}`);
    }

    onComplete();
  }

  async function handleAssign() {
    if (!assigneeId) {
      notify.error("Choose a team member to assign");
      return;
    }
    await runBulk("assign_assignee", assigneeId);
  }

  async function handleUnassign() {
    await runBulk("assign_assignee", "");
  }

  async function handlePartner() {
    if (!partnerId) {
      notify.error("Select a partner first");
      return;
    }
    await runBulk("assign_partner", partnerId);
  }

  async function handleStatus() {
    if (!status) {
      notify.error("Select a status first");
      return;
    }
    await runBulk("change_status", status);
  }

  async function handleDelete() {
    if (!window.confirm(`Delete ${count} selected student${count === 1 ? "" : "s"}?`)) {
      return;
    }
    await runBulk("delete");
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={BAR_VARIANTS}
      className={cn(
        "overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-[#E8952E]/8 via-white/95 to-white/90 p-4 shadow-[0_12px_40px_rgba(232,149,46,0.12)] backdrop-blur-xl dark:from-[#E8952E]/12 dark:via-white/5 dark:to-white/5",
        className
      )}
      role="region"
      aria-label="Bulk student actions"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-3">
        <div className="flex items-center gap-2.5">
          <motion.span
            key={count}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-primary px-2.5 text-xs font-bold text-primary-foreground shadow-sm"
          >
            {count}
          </motion.span>
          <p className="text-sm font-medium text-foreground">
            {count === 1 ? "student selected" : "students selected"}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 shrink-0 px-2.5 text-muted-foreground hover:text-foreground"
          onClick={onClear}
          disabled={busy}
        >
          <X className="mr-1 h-3.5 w-3.5" />
          Clear
        </Button>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        className={cn(
          "mt-3 grid gap-3",
          canDelete
            ? "md:grid-cols-2 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
            : "md:grid-cols-3"
        )}
      >
        <ActionPod icon={UserRound} label="Assignee" index={0}>
          <AssigneeSelect
            users={assignableUsers}
            value={assigneeId}
            onValueChange={setAssigneeId}
            placeholder="Choose team member…"
            triggerClassName={SELECT_TRIGGER_CLASS}
          />
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              className="min-w-[5.5rem] flex-1"
              onClick={handleAssign}
              disabled={busy || !assigneeId}
            >
              {loadingAction === "assignee" ? "Assigning…" : "Assign"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="min-w-[5.5rem] flex-1"
              onClick={handleUnassign}
              disabled={busy}
            >
              {loadingAction === "unassign" ? "Clearing…" : "Unassign"}
            </Button>
          </div>
        </ActionPod>

        <ActionPod icon={Building2} label="Partner" index={1}>
          <Select value={partnerId} onValueChange={(value) => setPartnerId(value ?? "")}>
            <SelectTrigger className={SELECT_TRIGGER_CLASS}>
              <SelectValue placeholder="Set partner…" />
            </SelectTrigger>
            <SelectContent>
              {partners.map((partner) => (
                <SelectItem key={partner._id} value={partner._id}>
                  {partner.companyName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="w-full"
            onClick={handlePartner}
            disabled={busy || !partnerId}
          >
            {loadingAction === "partner" ? "Saving…" : "Apply partner"}
          </Button>
        </ActionPod>

        <ActionPod icon={ListChecks} label="Status" index={2}>
          <Select
            value={status}
            onValueChange={(value) => setStatus(value ?? "")}
            items={APPLICATION_STATUS_OPTIONS.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
          >
            <SelectTrigger className={SELECT_TRIGGER_CLASS}>
              <SelectValue placeholder="Set status…" />
            </SelectTrigger>
            <SelectContent>
              {APPLICATION_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="w-full"
            onClick={handleStatus}
            disabled={busy || !status}
          >
            {loadingAction === "status" ? "Saving…" : "Apply status"}
          </Button>
        </ActionPod>

        {canDelete && (
          <motion.div
            custom={3}
            variants={POD_VARIANTS}
            className="flex items-end md:col-span-2 xl:col-span-1"
          >
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="h-8 w-full xl:min-w-[7.5rem]"
              onClick={handleDelete}
              disabled={busy}
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              {loadingAction === "delete" ? "Deleting…" : "Delete"}
            </Button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
