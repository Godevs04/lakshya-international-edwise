"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GlassCard } from "@/components/cards/glass-card";
import { PARTNER_STATUSES } from "@/lib/constants/statuses";
import { createPartnerAction, updatePartnerAction } from "@/lib/actions/partner.actions";

interface PartnerFormProps {
  initialData?: Record<string, string | number | undefined>;
  partnerId?: string;
  mode: "create" | "edit";
}

export function PartnerForm({ initialData, partnerId, mode }: PartnerFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result =
      mode === "create"
        ? await createPartnerAction(formData)
        : await updatePartnerAction(partnerId!, formData);

    if (result.success) {
      toast.success(mode === "create" ? "Partner created" : "Partner updated");
      router.push(
        mode === "create"
          ? `/dashboard/partners/${result.data?.id}`
          : `/dashboard/partners/${partnerId}`
      );
      router.refresh();
    } else {
      toast.error(result.error ?? "Something went wrong");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <GlassCard className="p-6">
        <h3 className="mb-4 text-sm font-semibold">Company Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name *</Label>
            <Input id="companyName" name="companyName" defaultValue={initialData?.companyName as string} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="owner">Owner</Label>
            <Input id="owner" name="owner" defaultValue={initialData?.owner as string} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" defaultValue={initialData?.phone as string} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={initialData?.email as string} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" name="address" defaultValue={initialData?.address as string} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gst">GST</Label>
            <Input id="gst" name="gst" defaultValue={initialData?.gst as string} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="commissionPercent">Commission %</Label>
            <Input id="commissionPercent" name="commissionPercent" type="number" defaultValue={initialData?.commissionPercent as number} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyLogo">Company Logo URL</Label>
            <Input id="companyLogo" name="companyLogo" defaultValue={initialData?.companyLogo as string} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={(initialData?.status as string) ?? "active"}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PARTNER_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h3 className="mb-4 text-sm font-semibold">Bank Details</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="accountName">Account Name</Label>
            <Input id="accountName" name="accountName" defaultValue={initialData?.accountName as string} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input id="accountNumber" name="accountNumber" defaultValue={initialData?.accountNumber as string} placeholder="Leave blank to keep current" />
            <p className="text-xs text-muted-foreground">Stored encrypted. Masked value shown when editing.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ifsc">IFSC</Label>
            <Input id="ifsc" name="ifsc" defaultValue={initialData?.ifsc as string} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bankName">Bank Name</Label>
            <Input id="bankName" name="bankName" defaultValue={initialData?.bankName as string} />
          </div>
        </div>
      </GlassCard>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : mode === "create" ? "Create Partner" : "Update Partner"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
