"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getUploadSignatureAction } from "@/lib/actions/upload.actions";
import { addStudentDocumentAction } from "@/lib/actions/student.actions";
import { Upload } from "lucide-react";

interface DocumentUploadProps {
  studentId: string;
  folder?: string;
}

export function DocumentUpload({ studentId, folder = "students" }: DocumentUploadProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const sigResult = await getUploadSignatureAction(folder);
      if (!sigResult.success || !sigResult.data) {
        toast.error(sigResult.error ?? "Upload not available");
        return;
      }

      const { timestamp, signature, apiKey, cloudName, folder: uploadFolder } = sigResult.data;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", String(timestamp));
      formData.append("signature", signature);
      formData.append("folder", uploadFolder);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        { method: "POST", body: formData }
      );

      if (!response.ok) {
        toast.error("Upload failed");
        return;
      }

      const result = (await response.json()) as {
        secure_url: string;
        public_id: string;
        format?: string;
        resource_type?: string;
      };

      const mimeType = result.format
        ? `${result.resource_type === "image" ? "image" : "application"}/${result.format}`
        : file.type || "application/octet-stream";

      const docResult = await addStudentDocumentAction(studentId, {
        name: file.name,
        url: result.secure_url,
        publicId: result.public_id,
        mimeType,
      });

      if (docResult.success) {
        toast.success("Document uploaded");
        router.refresh();
      } else {
        toast.error(docResult.error ?? "Could not save document");
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
        onChange={handleUpload}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploading}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="mr-1.5 h-4 w-4" />
        {uploading ? "Uploading..." : "Upload document"}
      </Button>
    </div>
  );
}
