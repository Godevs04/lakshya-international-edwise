"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { uploadFileToCloudinary } from "@/lib/utils/cloudinary-client";
import { addStudentDocumentAction } from "@/lib/actions/student.actions";
import { Upload } from "lucide-react";

interface DocumentUploadProps {
  studentId: string;
}

export function DocumentUpload({ studentId }: DocumentUploadProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploadResult = await uploadFileToCloudinary(file, "students");
      if (!uploadResult.success) {
        notify.error(uploadResult.error);
        return;
      }

      const docResult = await addStudentDocumentAction(studentId, {
        name: file.name,
        url: uploadResult.data.url,
        publicId: uploadResult.data.publicId,
        mimeType: uploadResult.data.mimeType,
      });

      if (docResult.success) {
        notify.success("Document uploaded");
        router.refresh();
      } else {
        notify.error(docResult.error ?? "Could not save document");
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <>
      <input
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
    </>
  );
}
