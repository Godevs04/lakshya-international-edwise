"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  getStudentImportTemplateAction,
  importStudentsAction,
} from "@/lib/actions/student-import.actions";
import { Upload, Download, FileSpreadsheet } from "lucide-react";

interface StudentImportDialogProps {
  canWrite?: boolean;
}

export function StudentImportDialog({ canWrite = false }: StudentImportDialogProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!canWrite) return null;

  async function handleDownloadTemplate() {
    try {
      const csv = await getStudentImportTemplateAction();
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "student-import-template.csv";
      anchor.click();
      URL.revokeObjectURL(url);
      notify.success("Template downloaded");
    } catch {
      notify.error("Could not download template");
    }
  }

  function handleImport() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      notify.error("Select a CSV or Excel file first");
      return;
    }

    const formData = new FormData();
    formData.set("file", file);

    startTransition(async () => {
      const result = await importStudentsAction(formData);
      if (result.success && result.data) {
        const { imported, failed } = result.data;
        notify.success(`Imported ${imported} student${imported === 1 ? "" : "s"}`, {
          description: failed > 0 ? `${failed} row(s) failed validation` : undefined,
        });
        setOpen(false);
        if (fileRef.current) fileRef.current.value = "";
        router.refresh();
      } else {
        notify.error(result.error ?? "Import failed", {
          description:
            result.data && result.data.errors.length > 0
              ? `Row ${result.data.errors[0]?.row}: ${result.data.errors[0]?.message}`
              : undefined,
        });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" type="button">
            <Upload className="mr-1 h-4 w-4" /> Import
          </Button>
        }
      />
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Bulk import students</DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file (max 500 rows). Download the template for the correct column format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Button variant="outline" className="w-full" onClick={handleDownloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Download template
          </Button>

          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed border-[#6D5EF7]/25 bg-[#6D5EF7]/5 p-6 transition-colors hover:bg-[#6D5EF7]/10">
            <FileSpreadsheet className="h-8 w-8 text-[#6D5EF7]" />
            <span className="text-sm font-medium">Choose CSV or Excel file</span>
            <span className="text-xs text-muted-foreground">.csv, .xlsx, .xls — up to 5 MB</span>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="sr-only"
            />
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={pending}>
            {pending ? "Importing..." : "Import students"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
