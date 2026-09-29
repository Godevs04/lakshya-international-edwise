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
import { updateStudentAgreedNetPayableAction } from "@/lib/actions/partner.actions";

interface AgreedNetPayableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partnerId: string;
  studentDbId: string;
  studentName: string;
  calculatedNet: number;
  agreedNet: number;
  existingNote?: string | null;
}

export function AgreedNetPayableDialog({
  open,
  onOpenChange,
  partnerId,
  studentDbId,
  studentName,
  calculatedNet,
  agreedNet,
  existingNote,
}: AgreedNetPayableDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {open ? (
          <AgreedNetPayableForm
            partnerId={partnerId}
            studentDbId={studentDbId}
            studentName={studentName}
            calculatedNet={calculatedNet}
            agreedNet={agreedNet}
            existingNote={existingNote}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function AgreedNetPayableForm({
  partnerId,
  studentDbId,
  studentName,
  calculatedNet,
  agreedNet,
  existingNote,
  onClose,
}: Omit<AgreedNetPayableDialogProps, "open" | "onOpenChange"> & { onClose: () => void }) {
  const router = useRouter();
  const [amount, setAmount] = useState(() => String(agreedNet));
  const [note, setNote] = useState(existingNote ?? "");
  const [loading, setLoading] = useState(false);

  const parsed = Number(amount);
  const retained =
    Number.isFinite(parsed) && parsed >= 0
      ? calculateRetainedFromNet(calculatedNet, Math.min(parsed, calculatedNet))
      : 0;
  const isReduced = Number.isFinite(parsed) && parsed < calculatedNet;

  async function save(clear: boolean) {
    if (!clear) {
      if (!Number.isFinite(parsed) || parsed < 0) {
        notify.error("Enter a valid amount");
        return;
      }
      if (parsed > calculatedNet) {
        notify.error(`Amount cannot exceed calculated net ${formatCurrency(calculatedNet)}`);
        return;
      }
      if (parsed < calculatedNet && !note.trim()) {
        notify.error("Add a note explaining why the payable was reduced");
        return;
      }
    }

    setLoading(true);
    const formData = new FormData();
    formData.set("agreedNetPayable", clear ? "" : String(parsed));
    if (!clear && note.trim()) formData.set("note", note.trim());

    const result = await updateStudentAgreedNetPayableAction(partnerId, studentDbId, formData);
    setLoading(false);

    if (result.success) {
      notify.success(clear ? "Net payable reset to calculated amount" : "Agreed net payable saved");
      onClose();
      router.refresh();
      return;
    }

    notify.error(result.error ?? "Failed to save agreed payable");
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void save(false);
      }}
    >
      <DialogHeader>
        <DialogTitle>Agreed net payable</DialogTitle>
        <DialogDescription>
          Set the cash you will pay {studentName}. The gap stays with you and is no longer pending.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="rounded-lg border bg-muted/40 p-3 text-sm">
          <p>
            Calculated net:{" "}
            <span className="font-semibold text-foreground">{formatCurrency(calculatedNet)}</span>
          </p>
          <p className="mt-1 text-muted-foreground">
            TDS stays on the original partner share. This only reduces the cash you transfer.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="agreedNetPayable">Agreed payable (INR)</Label>
          <Input
            id="agreedNetPayable"
            type="number"
            step="0.01"
            min={0}
            max={calculatedNet}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
          />
        </div>
        <div className="rounded-lg border border-[#0D9488]/25 bg-[#0D9488]/8 p-3 text-sm">
          <p>
            Retained by you:{" "}
            <span className="font-semibold text-foreground">{formatCurrency(retained)}</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Calculated {formatCurrency(calculatedNet)} = agreed{" "}
            {formatCurrency(Number.isFinite(parsed) ? Math.min(parsed, calculatedNet) : 0)} +
            retained {formatCurrency(retained)}
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="agreedNetPayableNote">
            Note {isReduced ? "(required)" : "(optional)"}
          </Label>
          <Textarea
            id="agreedNetPayableNote"
            rows={2}
            placeholder="Agreed ₹40,000 instead of full net"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            required={isReduced}
          />
        </div>
      </div>
      <DialogFooter className="gap-2 sm:justify-between">
        <Button type="button" variant="ghost" disabled={loading} onClick={() => void save(true)}>
          Reset to calculated
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogFooter>
    </form>
  );
}
