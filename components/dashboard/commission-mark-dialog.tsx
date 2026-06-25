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
import {
  recordStudentCommissionReceivedAction,
  recordStudentCommissionSettlementAction,
} from "@/lib/actions/partner.actions";

export type CommissionMarkType = "received" | "paid";

interface CommissionMarkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partnerId: string;
  studentDbId: string;
  studentName: string;
  type: CommissionMarkType;
  pendingAmount: number;
}

interface CommissionMarkFormProps {
  partnerId: string;
  studentDbId: string;
  studentName: string;
  type: CommissionMarkType;
  pendingAmount: number;
  onClose: () => void;
}

function CommissionMarkForm({
  partnerId,
  studentDbId,
  studentName,
  type,
  pendingAmount,
  onClose,
}: CommissionMarkFormProps) {
  const router = useRouter();
  const [amount, setAmount] = useState(() => (pendingAmount > 0 ? String(pendingAmount) : ""));
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const isReceived = type === "received";
  const title = isReceived ? "Mark commission received" : "Mark paid to partner";
  const description = isReceived
    ? "Record amount received from the lender/bank for this student."
    : "Record amount paid to the partner for this student.";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      notify.error("Enter a valid amount");
      return;
    }
    if (parsedAmount > pendingAmount) {
      notify.error(`Amount cannot exceed pending ${formatCurrency(pendingAmount)}`);
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.set("amount", String(parsedAmount));
    if (note.trim()) formData.set("note", note.trim());

    const result = isReceived
      ? await recordStudentCommissionReceivedAction(partnerId, studentDbId, formData)
      : await recordStudentCommissionSettlementAction(partnerId, studentDbId, formData);

    if (result.success) {
      notify.success(
        isReceived
          ? `Recorded ${formatCurrency(parsedAmount)} received for ${studentName}`
          : `Recorded ${formatCurrency(parsedAmount)} paid for ${studentName}`
      );
      onClose();
      router.refresh();
    } else {
      notify.error(result.error ?? "Failed to save");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="rounded-lg border bg-muted/40 p-3 text-sm">
          <p className="font-medium">{studentName}</p>
          <p className="mt-1 text-muted-foreground">
            Pending: <span className="font-semibold text-foreground">{formatCurrency(pendingAmount)}</span>
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="commissionMarkAmount">Amount (INR)</Label>
          <Input
            id="commissionMarkAmount"
            type="number"
            step="0.01"
            min={0.01}
            max={pendingAmount}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">
            Enter full pending for complete payment, or a lower amount for partial.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pendingAmount <= 0}
            onClick={() => setAmount(String(pendingAmount))}
          >
            Use full pending ({formatCurrency(pendingAmount)})
          </Button>
          {pendingAmount > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAmount(String(Math.round((pendingAmount / 2) * 100) / 100))}
            >
              Use half
            </Button>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="commissionMarkNote">Note (optional)</Label>
          <Textarea
            id="commissionMarkNote"
            rows={2}
            placeholder="UPI ref, invoice no., bank name, etc."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || pendingAmount <= 0}>
          {loading ? "Saving..." : isReceived ? "Mark Received" : "Mark Paid"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function CommissionMarkDialog({
  open,
  onOpenChange,
  partnerId,
  studentDbId,
  studentName,
  type,
  pendingAmount,
}: CommissionMarkDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open ? (
          <CommissionMarkForm
            key={`${studentDbId}-${type}-${pendingAmount}`}
            partnerId={partnerId}
            studentDbId={studentDbId}
            studentName={studentName}
            type={type}
            pendingAmount={pendingAmount}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
