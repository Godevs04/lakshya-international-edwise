"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/toast";
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
import { FormSection } from "@/components/forms/form-section";
import { LinkUrlField } from "@/components/forms/link-url-field";
import { PARTNER_STATUSES } from "@/lib/constants/statuses";
import {
  PARTNER_ACTION_STATUSES,
  PARTNER_ACTION_STATUS_LABELS,
} from "@/lib/constants/partner-action-statuses";
import { createPartnerAction, updatePartnerAction } from "@/lib/actions/partner.actions";

interface PartnerFormProps {
  initialData?: Record<string, string | number | undefined>;
  partnerId?: string;
  mode: "create" | "edit";
}

const PHONE_HINT = "10-digit Indian mobile (starts with 6–9). +91 prefix optional.";

export function PartnerForm({ initialData, partnerId, mode }: PartnerFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState((initialData?.status as string) ?? "active");
  const [actionStatus, setActionStatus] = useState((initialData?.actionStatus as string) ?? "active");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result =
      mode === "create"
        ? await createPartnerAction(formData)
        : await updatePartnerAction(partnerId!, formData);

    if (result.success) {
      notify.success(mode === "create" ? "Partner created" : "Partner updated");
      router.push(
        mode === "create"
          ? `/dashboard/partners/${result.data?.id}`
          : `/dashboard/partners/${partnerId}`
      );
      router.refresh();
    } else {
      notify.error(result.error ?? "Something went wrong");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormSection
        title="Required Fields"
        description="Fields marked with * must be completed before saving."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="companyName">Company Name *</Label>
            <Input
              id="companyName"
              name="companyName"
              defaultValue={initialData?.companyName as string}
              required
            />
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Optional — Company Details"
        description="Contact information, branding, and status."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="owner">Owner</Label>
            <Input id="owner" name="owner" defaultValue={initialData?.owner as string} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              inputMode="numeric"
              maxLength={13}
              placeholder="9363047040"
              defaultValue={initialData?.phone as string}
            />
            <p className="text-xs text-muted-foreground">{PHONE_HINT}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={initialData?.email as string} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gst">GST</Label>
            <Input id="gst" name="gst" defaultValue={initialData?.gst as string} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="commissionPercent">Commission %</Label>
            <Input
              id="commissionPercent"
              name="commissionPercent"
              type="number"
              step="0.01"
              min={0}
              max={100}
              inputMode="decimal"
              defaultValue={initialData?.commissionPercent as number}
            />
            <p className="text-xs text-muted-foreground">
              Used to calculate payout from disbursed loan amounts(Payout = disbursed × rate.)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v ?? "active")}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PARTNER_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="status" value={status} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="actionStatus">Action Status</Label>
            <Select value={actionStatus} onValueChange={(v) => setActionStatus(v ?? "active")}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PARTNER_ACTION_STATUSES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {PARTNER_ACTION_STATUS_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="actionStatus" value={actionStatus} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" name="address" defaultValue={initialData?.address as string} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="locationAddress">Location Address</Label>
            <Textarea
              id="locationAddress"
              name="locationAddress"
              defaultValue={initialData?.locationAddress as string}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="locationCity">City</Label>
            <Input id="locationCity" name="locationCity" defaultValue={initialData?.locationCity as string} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="locationState">State</Label>
            <Input id="locationState" name="locationState" defaultValue={initialData?.locationState as string} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <LinkUrlField
              name="companyLogo"
              label="Company logo link"
              defaultValue={(initialData?.companyLogo as string) ?? ""}
              placeholder="https://drive.google.com/file/d/..."
              hint="Paste a Google Drive or other HTTPS link to the company logo."
            />
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Optional — Points of Contact"
        description="Add up to three partner contacts."
      >
        <div className="space-y-6">
          {[0, 1, 2].map((index) => (
            <div key={index} className="rounded-lg border p-4">
              <p className="mb-3 text-sm font-medium">Contact {index + 1}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`contact${index}Name`}>Name</Label>
                  <Input
                    id={`contact${index}Name`}
                    name={`contact${index}Name`}
                    defaultValue={initialData?.[`contact${index}Name`] as string}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`contact${index}Role`}>Role</Label>
                  <Input
                    id={`contact${index}Role`}
                    name={`contact${index}Role`}
                    defaultValue={initialData?.[`contact${index}Role`] as string}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`contact${index}Phone`}>Phone</Label>
                  <Input
                    id={`contact${index}Phone`}
                    name={`contact${index}Phone`}
                    type="tel"
                    defaultValue={initialData?.[`contact${index}Phone`] as string}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`contact${index}Email`}>Email</Label>
                  <Input
                    id={`contact${index}Email`}
                    name={`contact${index}Email`}
                    type="email"
                    defaultValue={initialData?.[`contact${index}Email`] as string}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </FormSection>

      <FormSection
        title="Optional — Bank Details"
        description="Banking information for commission payouts."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="accountName">Account Name</Label>
            <Input id="accountName" name="accountName" defaultValue={initialData?.accountName as string} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              name="accountNumber"
              inputMode="numeric"
              defaultValue={initialData?.accountNumber as string}
              placeholder="Enter full account number"
            />
            <p className="text-xs text-muted-foreground">
              Stored encrypted. Full number shown when editing.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ifsc">IFSC</Label>
            <Input
              id="ifsc"
              name="ifsc"
              maxLength={11}
              placeholder="SBIN0001234"
              defaultValue={initialData?.ifsc as string}
              className="font-mono uppercase"
            />
            <p className="text-xs text-muted-foreground">11 characters (e.g. SBIN0001234).</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bankName">Bank Name</Label>
            <Input id="bankName" name="bankName" defaultValue={initialData?.bankName as string} />
          </div>
        </div>
      </FormSection>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : mode === "create" ? "Create Partner" : "Update Partner"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
