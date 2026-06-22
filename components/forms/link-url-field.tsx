"use client";

import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isDirectImageUrl } from "@/lib/utils/document-url";
import { ExternalLink, Link2 } from "lucide-react";

interface LinkUrlFieldProps {
  name: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
  hint?: string;
}

export function LinkUrlField({
  name,
  label,
  defaultValue = "",
  placeholder = "https://drive.google.com/file/d/...",
  hint = "Paste a shareable Google Drive link (Anyone with the link can view).",
}: LinkUrlFieldProps) {
  const value = defaultValue.trim();
  const showImagePreview = value && isDirectImageUrl(value);

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <div className="relative">
        <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={name}
          name={name}
          type="url"
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="pl-9"
        />
      </div>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {value ? (
        <div className="flex items-center gap-3 rounded-lg border border-dashed p-3">
          {showImagePreview ? (
            <Image
              src={value}
              alt=""
              width={48}
              height={48}
              unoptimized
              className="h-12 w-12 shrink-0 rounded-md border object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border bg-muted/30">
              <Link2 className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-w-0 items-center gap-1.5 text-xs text-primary hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Open attached link</span>
          </a>
        </div>
      ) : null}
    </div>
  );
}
