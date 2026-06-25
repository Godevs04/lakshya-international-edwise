"use client";

import { useEffect, useState } from "react";
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
import {
  PARTNER_EDIT_SECTIONS,
  type PartnerEditSectionKey,
} from "@/lib/constants/partner-edit-sections";

interface PartnerFormProps {
  initialData?: Record<string, string | number | undefined>;
  partnerId?: string;
  mode: "create" | "edit";
  focusSection?: PartnerEditSectionKey;
}

const PHONE_HINT = "10-digit Indian mobile (starts with 6–9). +91 prefix optional.";

export function PartnerForm({ initialData, partnerId, mode, focusSection }: PartnerFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState((initialData?.status as string) ?? "active");
  const [actionStatus, setActionStatus] = useState((initialData?.actionStatus as string) ?? "active");

  const focusedConfig = focusSection ? PARTNER_EDIT_SECTIONS[focusSection] : undefined;
  const isSectionEdit = mode === "edit" && Boolean(focusedConfig);

  function isFormSectionVisible(sectionKey: string) {
    if (!isSectionEdit || !focusedConfig) return true;
    return focusedConfig.formSections.includes(sectionKey);
  }

  function isFormSectionHighlighted(sectionKey: string) {
    if (!isSectionEdit || !focusedConfig) return false;
    return focusedConfig.formSections.includes(sectionKey);
  }

  useEffect(() => {
    if (!focusedConfig) return;
    const target = document.getElementById(focusedConfig.scrollTarget);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [focusedConfig]);

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
          : isSectionEdit && partnerId
            ? `/dashboard/partners/${partnerId}`
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
      {isSectionEdit && !isFormSectionVisible("required") ? (
        <input type="hidden" name="companyName" value={String(initialData?.companyName ?? "")} />
      ) : null}

      {isSectionEdit && !isFormSectionVisible("company") ? (
        <>
          <input type="hidden" name="owner" value={String(initialData?.owner ?? "")} />
          <input type="hidden" name="phone" value={String(initialData?.phone ?? "")} />
          <input type="hidden" name="email" value={String(initialData?.email ?? "")} />
          <input type="hidden" name="gst" value={String(initialData?.gst ?? "")} />
          <input
            type="hidden"
            name="commissionPercent"
            value={String(initialData?.commissionPercent ?? "")}
          />
          <input type="hidden" name="status" value={status} />
          <input type="hidden" name="actionStatus" value={actionStatus} />
          <input type="hidden" name="address" value={String(initialData?.address ?? "")} />
          <input
            type="hidden"
            name="locationAddress"
            value={String(initialData?.locationAddress ?? "")}
          />
          <input type="hidden" name="locationCity" value={String(initialData?.locationCity ?? "")} />
          <input type="hidden" name="locationState" value={String(initialData?.locationState ?? "")} />
          <input type="hidden" name="companyLogo" value={String(initialData?.companyLogo ?? "")} />
        </>
      ) : null}

      {isSectionEdit && !isFormSectionVisible("contacts")
        ? [0, 1, 2].map((index) => (
            <span key={index} className="hidden">
              <input
                type="hidden"
                name={`contact${index}Name`}
                value={String(initialData?.[`contact${index}Name`] ?? "")}
              />
              <input
                type="hidden"
                name={`contact${index}Role`}
                value={String(initialData?.[`contact${index}Role`] ?? "")}
              />
              <input
                type="hidden"
                name={`contact${index}Phone`}
                value={String(initialData?.[`contact${index}Phone`] ?? "")}
              />
              <input
                type="hidden"
                name={`contact${index}Email`}
                value={String(initialData?.[`contact${index}Email`] ?? "")}
              />
            </span>
          ))
        : null}

      {isSectionEdit && !isFormSectionVisible("bank") ? (
        <>
          <input type="hidden" name="accountName" value={String(initialData?.accountName ?? "")} />
          <input
            type="hidden"
            name="accountNumber"
            value={String(initialData?.accountNumber ?? "")}
          />
          <input type="hidden" name="ifsc" value={String(initialData?.ifsc ?? "")} />
          <input type="hidden" name="bankName" value={String(initialData?.bankName ?? "")} />
        </>
      ) : null}

      {isFormSectionVisible("required") ? (
      <FormSection
        id="section-required"
        highlighted={isFormSectionHighlighted("required")}
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
      ) : null}

      {isFormSectionVisible("company") ? (
      <FormSection
        id="section-company"
        highlighted={isFormSectionHighlighted("company")}
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
            <Label htmlFor="commissionPercent">Partner Share % (of disbursement)</Label>
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
              Partner share is calculated from disbursement (share = disbursed × rate).
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
      ) : null}

      {isFormSectionVisible("contacts") ? (
      <FormSection
        id="section-contacts"
        highlighted={isFormSectionHighlighted("contacts")}
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
      ) : null}

      {isFormSectionVisible("bank") ? (
      <FormSection
        id="section-bank"
        highlighted={isFormSectionHighlighted("bank")}
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
      ) : null}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading
            ? "Saving..."
            : isSectionEdit
              ? `Save ${focusedConfig?.label ?? "section"}`
              : mode === "create"
                ? "Create Partner"
                : "Update Partner"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            isSectionEdit && partnerId
              ? router.push(`/dashboard/partners/${partnerId}`)
              : router.back()
          }
        >
          Cancel
        </Button>
        {isSectionEdit && partnerId ? (
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push(`/dashboard/partners/${partnerId}/edit`)}
          >
            Edit all sections
          </Button>
        ) : null}
      </div>
    </form>
  );
}
