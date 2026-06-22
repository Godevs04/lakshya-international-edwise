"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addStudentDocumentAction } from "@/lib/actions/student.actions";
import { Link2 } from "lucide-react";

interface DocumentLinkFormProps {
  studentId: string;
}

export function DocumentLinkForm({ studentId }: DocumentLinkFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const url = String(formData.get("url") ?? "").trim();

    const result = await addStudentDocumentAction(studentId, { name, url });
    if (result.success) {
      notify.success("Document link saved");
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } else {
      notify.error(result.error ?? "Could not save document link");
    }

    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-dashed p-4">
      <div className="space-y-1">
        <Label htmlFor="documentName">Document name</Label>
        <Input id="documentName" name="name" placeholder="Aadhaar copy" required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="documentUrl">Google Drive URL</Label>
        <Input
          id="documentUrl"
          name="url"
          type="url"
          placeholder="https://drive.google.com/file/d/..."
          required
        />
        <p className="text-xs text-muted-foreground">
          Paste a shareable Google Drive link (Anyone with the link can view).
        </p>
      </div>
      <Button type="submit" variant="outline" size="sm" disabled={saving}>
        <Link2 className="mr-1.5 h-4 w-4" />
        {saving ? "Saving..." : "Add document link"}
      </Button>
    </form>
  );
}
