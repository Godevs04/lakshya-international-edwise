"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { promoteSitePartnerLeadAction } from "@/lib/actions/site-lead.actions";
import { ArrowUpRight } from "lucide-react";

interface PromotePartnerLeadSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: {
    _id: string;
    partnerCode?: string;
    companyName: string;
    commissionPercent?: number;
  };
}

export function PromotePartnerLeadSheet({
  open,
  onOpenChange,
  lead,
}: PromotePartnerLeadSheetProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [commissionPercent, setCommissionPercent] = useState(
    String(lead.commissionPercent ?? 0)
  );

  async function handlePromote() {
    setLoading(true);
    const formData = new FormData();
    formData.set("commissionPercent", commissionPercent);

    const result = await promoteSitePartnerLeadAction(lead._id, formData);
    if (result.success) {
      notify.success(`Promoted to partner ${result.data?.officialCode}`);
      onOpenChange(false);
      router.refresh();
    } else {
      notify.error(result.error ?? "Failed to promote lead");
    }
    setLoading(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border/60 px-4 py-4 pr-12">
          <SheetTitle>Promote to partner</SheetTitle>
          <SheetDescription>
            {lead.companyName} ({lead.partnerCode ?? "pending"}) will receive an official partner
            code and appear on the Partners page.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="promote-commissionPercent">Commission %</Label>
            <Input
              id="promote-commissionPercent"
              type="number"
              min={0}
              max={100}
              step="0.1"
              className="w-full"
              value={commissionPercent}
              onChange={(event) => setCommissionPercent(event.target.value)}
            />
          </div>
        </div>

        <SheetFooter className="mt-0 flex-row justify-end gap-2 border-t border-border/60 px-4 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="min-w-[96px]"
          >
            Cancel
          </Button>
          <Button type="button" onClick={handlePromote} disabled={loading} className="min-w-[112px]">
            <ArrowUpRight className="mr-1.5 h-4 w-4" />
            {loading ? "Promoting..." : "Promote"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
