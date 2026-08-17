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
  calculateNetAfterTds,
  calculateTdsAmount,
  PARTNER_TDS_PERCENT,
} from "@/lib/utils/commission-calculations";
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
    : "Record gross partner share. 2% TDS is withheld automatically; transfer the net amount.";
  const parsedAmount = Number(amount);
  const tdsAmount = !isReceived && parsedAmount > 0 ? calculateTdsAmount(parsedAmount) : 0;
  const netPayable = !isReceived && parsedAmount > 0 ? calculateNetAfterTds(parsedAmount) : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
          : `Recorded ${formatCurrency(parsedAmount)} paid for ${studentName} (TDS ${formatCurrency(calculateTdsAmount(parsedAmount))}, net ${formatCurrency(calculateNetAfterTds(parsedAmount))})`
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
            Pending:{" "}
            <span className="font-semibold text-foreground">{formatCurrency(pendingAmount)}</span>
          </p>
          {!isReceived && pendingAmount > 0 ? (
            <p className="mt-1 text-muted-foreground">
              Net to transfer if full pending:{" "}
              <span className="font-semibold text-foreground">
                {formatCurrency(calculateNetAfterTds(pendingAmount))}
              </span>
              <span className="ml-1">
                after {PARTNER_TDS_PERCENT}% TDS (
                {formatCurrency(calculateTdsAmount(pendingAmount))})
              </span>
            </p>
          ) : null}
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
            {isReceived
              ? "Enter full pending for complete payment, or a lower amount for partial."
              : "Enter the gross partner share. 2% TDS is calculated automatically."}
          </p>
          {!isReceived && parsedAmount > 0 ? (
            <div className="rounded-lg border border-[#0B8FD8]/20 bg-[#0B8FD8]/5 p-3 text-xs">
              <p>
                TDS {PARTNER_TDS_PERCENT}%:{" "}
                <span className="font-semibold text-foreground">{formatCurrency(tdsAmount)}</span>
              </p>
              <p className="mt-1">
                Net payable to partner:{" "}
                <span className="font-semibold text-foreground">{formatCurrency(netPayable)}</span>
              </p>
            </div>
          ) : null}
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
