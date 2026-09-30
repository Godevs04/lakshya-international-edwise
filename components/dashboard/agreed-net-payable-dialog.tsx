"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils/format";
import { calculateRetainedFromNet } from "@/lib/utils/commission-calculations";
import {
  reopenStudentPayoutAction,
  syncStudentPaidAndFinalNetAction,
} from "@/lib/actions/partner.actions";

interface AgreedNetPayableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partnerId: string;
  studentDbId: string;
  studentName: string;
  calculatedNet: number;
  paidCash: number;
  existingNote?: string | null;
}

export function AgreedNetPayableDialog({
  open,
  onOpenChange,
  partnerId,
  studentDbId,
  studentName,
  calculatedNet,
  paidCash,
  existingNote,
}: AgreedNetPayableDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {open ? (
          <PaidFinalNetForm
            partnerId={partnerId}
            studentDbId={studentDbId}
            studentName={studentName}
            calculatedNet={calculatedNet}
            paidCash={paidCash}
            existingNote={existingNote}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function PaidFinalNetForm({
  partnerId,
  studentDbId,
  studentName,
  calculatedNet,
  paidCash,
  existingNote,
  onClose,
}: Omit<AgreedNetPayableDialogProps, "open" | "onOpenChange"> & { onClose: () => void }) {
  const router = useRouter();
  const [amount, setAmount] = useState(() => (paidCash > 0 ? String(paidCash) : ""));
  const [note, setNote] = useState(existingNote ?? "");
  const [loading, setLoading] = useState(false);

  const parsed = Number(amount);
  const capped = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 0), calculatedNet) : 0;
  const retained =
    Number.isFinite(parsed) && parsed >= 0 ? calculateRetainedFromNet(calculatedNet, capped) : 0;

  async function save() {
    if (!Number.isFinite(parsed) || parsed <= 0) {
      notify.error("Enter the amount paid");
      return;
    }
    if (parsed > calculatedNet) {
      notify.error(`Amount cannot exceed net payable ${formatCurrency(calculatedNet)}`);
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.set("amount", String(parsed));
    if (note.trim()) formData.set("note", note.trim());

    const result = await syncStudentPaidAndFinalNetAction(partnerId, studentDbId, formData);
    setLoading(false);

    if (result.success) {
      notify.success(`Paid and final net set to ${formatCurrency(parsed)}`);
      onClose();
      router.refresh();
      return;
    }

    notify.error(result.error ?? "Failed to save");
  }

  async function markPending() {
    setLoading(true);
    const result = await reopenStudentPayoutAction(partnerId, studentDbId);
    setLoading(false);
    if (result.success) {
      notify.success("Marked as pending");
      onClose();
      router.refresh();
      return;
    }
    notify.error(result.error ?? "Failed to mark pending");
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <DialogHeader>
        <DialogTitle>Paid and final net</DialogTitle>
        <DialogDescription>
          Enter the cash paid to {studentName}. The same amount is saved as Paid and Final net.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="rounded-lg border bg-muted/40 p-3 text-sm">
          <p>
            Net payable:{" "}
            <span className="font-semibold text-foreground">{formatCurrency(calculatedNet)}</span>
          </p>
          <p className="mt-1 text-muted-foreground">
            This can be higher than the old pending amount. Both Paid and Final net become this
            figure, and the row is completed.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="paidFinalNetAmount">Amount paid (INR)</Label>
          <Input
            id="paidFinalNetAmount"
            type="number"
            step="0.01"
            min={0.01}
            max={calculatedNet}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
          />
        </div>
        <div className="rounded-lg border border-[#0D9488]/25 bg-[#0D9488]/8 p-3 text-sm">
          <p>
            Kept by you:{" "}
            <span className="font-semibold text-foreground">{formatCurrency(retained)}</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Net payable {formatCurrency(calculatedNet)} = final net {formatCurrency(capped)} + kept{" "}
            {formatCurrency(retained)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAmount(String(calculatedNet))}
          >
            Use full net payable ({formatCurrency(calculatedNet)})
          </Button>
        </div>
        <div className="space-y-2">
          <Label htmlFor="paidFinalNetNote">Note (optional)</Label>
          <Textarea
            id="paidFinalNetNote"
            rows={2}
            placeholder="UPI ref, invoice no., bank name"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </div>
      </div>
      <DialogFooter className="gap-2 sm:justify-between">
        <Button type="button" variant="ghost" disabled={loading} onClick={() => void markPending()}>
          Mark pending
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Complete"}
          </Button>
        </div>
      </DialogFooter>
    </form>
  );
}
