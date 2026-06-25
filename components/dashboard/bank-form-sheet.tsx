"use client";

import { useMemo, useState } from "react";
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
  SheetTrigger,
} from "@/components/ui/sheet";
import { ImageUploadField } from "@/components/forms/image-upload-field";
import { createLenderAction, updateLenderAction } from "@/lib/actions/lender.actions";
import { LENDER_LOGO_ASPECT_HINT, slugifyLenderName } from "@/lib/constants/lenders";
import type { LenderListItem } from "@/types";

interface BankFormSheetProps {
  lender?: LenderListItem;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactElement;
}

export function BankFormSheet({ lender, open, onOpenChange, trigger }: BankFormSheetProps) {
  const router = useRouter();
  const isEdit = Boolean(lender);
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(lender?.name ?? "");
  const [accentColor, setAccentColor] = useState(lender?.accent ?? "");

  const sheetOpen = open ?? internalOpen;

  function handleOpenChange(next: boolean) {
    (onOpenChange ?? setInternalOpen)(next);
    if (!next && !isEdit) {
      setName("");
      setAccentColor("");
    }
  }

  const slugPreview = useMemo(() => {
    if (isEdit && lender?.slug) return lender.slug;
    return slugifyLenderName(name);
  }, [isEdit, lender?.slug, name]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);

    const result = isEdit && lender
      ? await updateLenderAction(lender._id, formData)
      : await createLenderAction(formData);

    if (result.success) {
      notify.success(isEdit ? "Bank updated" : "Bank added");
      handleOpenChange(false);
      if (!isEdit) {
        setName("");
        setAccentColor("");
        (event.target as HTMLFormElement).reset();
      }
      router.refresh();
    } else {
      notify.error(result.error ?? (isEdit ? "Failed to update bank" : "Failed to add bank"));
    }
    setLoading(false);
  }

  return (
    <Sheet open={sheetOpen} onOpenChange={handleOpenChange}>
      {trigger ? <SheetTrigger render={trigger} /> : null}
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit Bank" : "Add Bank"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update bank name, logo, or brand color. The bank code cannot be changed."
              : "Add a loan partner with logo. New banks appear in all lender dropdowns across the app."}
          </SheetDescription>
        </SheetHeader>

        <form key={lender?._id ?? "new-bank"} onSubmit={handleSubmit} className="space-y-4 p-4">
          <div className="space-y-2">
            <Label htmlFor={isEdit ? `bank-name-${lender?._id}` : "bank-name"}>Bank name *</Label>
            <Input
              id={isEdit ? `bank-name-${lender?._id}` : "bank-name"}
              name="name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Axis Bank"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={isEdit ? `bank-slug-${lender?._id}` : "bank-slug"}>Bank code</Label>
            <input type="hidden" name="slug" value={slugPreview} />
            <Input
              id={isEdit ? `bank-slug-${lender?._id}` : "bank-slug"}
              value={slugPreview}
              readOnly
              className="bg-muted/40 font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              {isEdit
                ? "Fixed after creation. Used in dropdowns and filters."
                : "Auto-generated from the bank name. Used in dropdowns and filters."}
            </p>
          </div>

          <ImageUploadField
            name="logoUrl"
            label="Bank logo"
            folder="lenders"
            variant="image"
            logoPreview
            defaultValue={lender?.logo ?? ""}
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            hint={LENDER_LOGO_ASPECT_HINT}
          />

          <div className="space-y-2">
            <Label htmlFor={isEdit ? `bank-accent-${lender?._id}` : "bank-accent"}>
              Brand accent color
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id={isEdit ? `bank-accent-${lender?._id}` : "bank-accent"}
                name="accentColor"
                type="text"
                value={accentColor}
                onChange={(event) => setAccentColor(event.target.value)}
                placeholder="#004B8D"
                className="font-mono"
              />
              <input
                type="color"
                className="h-10 w-12 shrink-0 cursor-pointer rounded-md border bg-transparent p-1"
                value={/^#[0-9A-Fa-f]{6}$/.test(accentColor) ? accentColor : "#E8952E"}
                onChange={(event) => setAccentColor(event.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Optional. Used as the left border accent on lender cards.
            </p>
          </div>

          <SheetFooter className="px-0">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Save Bank"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
