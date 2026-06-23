"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { notify } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { uploadFileToCloudinary } from "@/lib/utils/cloudinary-client";
import type { UploadFolder } from "@/lib/constants/upload-folders";
import { cn } from "@/lib/utils";
import { FileText, ImagePlus, Upload, X } from "lucide-react";

interface ImageUploadFieldProps {
  name: string;
  label: string;
  folder: UploadFolder;
  defaultValue?: string;
  accept?: string;
  hint?: string;
  variant?: "image" | "document";
  /** Wide logo preview with object-contain (for company branding). */
  logoPreview?: boolean;
  disabled?: boolean;
}

export function ImageUploadField({
  name,
  label,
  folder,
  defaultValue = "",
  accept = "image/jpeg,image/png,image/webp,image/gif",
  hint,
  variant = "image",
  logoPreview = false,
  disabled = false,
}: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);

  const isImage = variant === "image" && value && /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(value);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadFileToCloudinary(file, folder);
      if (!result.success) {
        notify.error(result.error ?? "Upload failed");
        return;
      }
      setValue(result.data.url);
      notify.success(variant === "image" ? "Image uploaded" : "File uploaded");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleRemove() {
    setValue("");
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <input type="hidden" name={name} value={value} />
      <div
        className={cn(
          "rounded-lg border border-dashed border-border/80 bg-muted/20 p-3",
          disabled && "pointer-events-none opacity-60"
        )}
      >
        {value ? (
          <div className="flex items-start gap-3">
            {isImage ? (
              <div
                className={
                  logoPreview
                    ? "flex h-24 w-44 shrink-0 items-center justify-center rounded-lg border bg-white p-1.5"
                    : "h-16 w-16 shrink-0 overflow-hidden rounded-md border"
                }
              >
                <Image
                  src={value}
                  alt=""
                  width={logoPreview ? 176 : 64}
                  height={logoPreview ? 96 : 64}
                  unoptimized
                  className={
                    logoPreview
                      ? "h-full w-full object-contain object-center"
                      : "h-16 w-16 object-cover"
                  }
                />
              </div>
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border bg-background">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-muted-foreground">
                {variant === "image" ? "Uploaded image" : "Uploaded file"}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading || disabled}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-1.5 h-3.5 w-3.5" />
                  Replace
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={uploading || disabled}
                  onClick={handleRemove}
                >
                  <X className="mr-1.5 h-3.5 w-3.5" />
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-4 text-center">
            {variant === "image" ? (
              <ImagePlus className="h-8 w-8 text-muted-foreground/70" />
            ) : (
              <FileText className="h-8 w-8 text-muted-foreground/70" />
            )}
            <p className="text-xs text-muted-foreground">
              {variant === "image" ? "Upload a photo from your device" : "Upload a file from your device"}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading || disabled}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-1.5 h-3.5 w-3.5" />
              {uploading ? "Uploading..." : "Choose file"}
            </Button>
          </div>
        )}
      </div>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={accept}
        disabled={disabled || uploading}
        onChange={handleUpload}
      />
    </div>
  );
}
