"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Pencil, Trash2, Users } from "lucide-react";
import { notify } from "@/lib/toast";
import { GlassCard } from "@/components/cards/glass-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LenderLogo } from "@/components/lenders/lender-logo";
import { AddBankSheet } from "@/components/dashboard/add-bank-sheet";
import { BankFormSheet } from "@/components/dashboard/bank-form-sheet";
import { deleteLenderAction } from "@/lib/actions/lender.actions";
import type { LenderListItem } from "@/types";

interface LendersViewProps {
  lenders: LenderListItem[];
  canWrite?: boolean;
}

function canDeleteLender(lender: LenderListItem): boolean {
  return !lender.isSeed && lender.applicationCount === 0;
}

function deleteBlockReason(lender: LenderListItem): string | null {
  if (lender.isSeed) {
    return "Built-in banks cannot be deleted. You can still edit their name, logo, or accent color.";
  }
  if (lender.applicationCount > 0) {
    return `This bank is linked to ${lender.applicationCount} student application${
      lender.applicationCount === 1 ? "" : "s"
    }. Remove or reassign those applications before deleting.`;
  }
  return null;
}

function LenderCard({
  lender,
  canWrite,
  onEdit,
  onDelete,
}: {
  lender: LenderListItem;
  canWrite: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const deleteBlocked = deleteBlockReason(lender);

  return (
    <GlassCard hover className="flex h-full flex-col p-6">
      <Link
        href={`/dashboard/students?lenderId=${encodeURIComponent(lender.slug)}`}
        className="block flex-1"
      >
        <div className="flex items-start justify-between gap-4">
          <LenderLogo
            slug={lender.slug}
            name={lender.name}
            logo={lender.logo}
            accent={lender.accent}
            size="sm"
          />
          <div className="flex items-center gap-1.5 rounded-full bg-[#E8952E]/10 px-3 py-1 text-xs font-semibold text-[#E8952E]">
            <Users className="h-3.5 w-3.5" />
            {lender.applicationCount}
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-bold">{lender.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {lender.applicationCount === 1
              ? "1 application"
              : `${lender.applicationCount} applications`}
          </p>
          {lender.isSeed ? (
            <p className="mt-1 text-xs text-muted-foreground">Built-in bank</p>
          ) : null}
        </div>
      </Link>

      {canWrite ? (
        <div className="mt-4 flex items-center gap-2 border-t border-border/60 pt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onEdit}
          >
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={onDelete}
            title={deleteBlocked ?? `Delete ${lender.name}`}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      ) : (
        <Link
          href={`/dashboard/students?lenderId=${encodeURIComponent(lender.slug)}`}
          className="mt-4 flex items-center justify-end gap-1 text-xs font-medium text-[#E8952E] hover:underline"
        >
          View students
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </GlassCard>
  );
}

export function LendersView({ lenders, canWrite = false }: LendersViewProps) {
  const router = useRouter();
  const [editingLender, setEditingLender] = useState<LenderListItem | null>(null);
  const [deletingLender, setDeletingLender] = useState<LenderListItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const deleteBlockedMessage = deletingLender ? deleteBlockReason(deletingLender) : null;
  const deleteAllowed = deletingLender ? canDeleteLender(deletingLender) : false;

  async function handleDelete() {
    if (!deletingLender || !deleteAllowed) return;
    setDeleteLoading(true);
    const result = await deleteLenderAction(deletingLender._id);
    if (result.success) {
      notify.success("Bank deleted");
      setDeletingLender(null);
      router.refresh();
    } else {
      notify.error(result.error ?? "Failed to delete bank");
    }
    setDeleteLoading(false);
  }

  if (lenders.length === 0) {
    return (
      <div className="space-y-4">
        {canWrite ? (
          <div className="flex justify-end">
            <AddBankSheet />
          </div>
        ) : null}
        <GlassCard className="p-8">
          <EmptyState
            title="No lenders configured"
            description="Add your first bank partner to show them in lender dropdowns."
          />
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {canWrite ? (
        <div className="flex justify-end">
          <AddBankSheet />
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {lenders.map((lender) => (
          <LenderCard
            key={lender._id}
            lender={lender}
            canWrite={canWrite}
            onEdit={() => setEditingLender(lender)}
            onDelete={() => setDeletingLender(lender)}
          />
        ))}
      </div>

      {editingLender ? (
        <BankFormSheet
          lender={editingLender}
          open={Boolean(editingLender)}
          onOpenChange={(open) => {
            if (!open) setEditingLender(null);
          }}
        />
      ) : null}

      <AlertDialog
        open={Boolean(deletingLender)}
        onOpenChange={(open) => {
          if (!open) setDeletingLender(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteAllowed ? `Delete ${deletingLender?.name}?` : "Cannot delete bank"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteAllowed
                ? "This will permanently remove the bank from lender dropdowns. This action cannot be undone."
                : deleteBlockedMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {deleteAllowed ? (
              <>
                <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  disabled={deleteLoading}
                  onClick={(event) => {
                    event.preventDefault();
                    void handleDelete();
                  }}
                >
                  {deleteLoading ? "Deleting..." : "Delete Bank"}
                </AlertDialogAction>
              </>
            ) : (
              <AlertDialogCancel>OK</AlertDialogCancel>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
