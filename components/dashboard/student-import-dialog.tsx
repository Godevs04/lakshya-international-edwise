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
import { cn } from "@/lib/utils";
import { Upload, Download, FileSpreadsheet, CheckCircle2, X } from "lucide-react";

interface StudentImportDialogProps {
  canWrite?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function StudentImportDialog({ canWrite = false }: StudentImportDialogProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pending, startTransition] = useTransition();

  if (!canWrite) return null;

  function resetFileSelection() {
    setSelectedFile(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) resetFileSelection();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
  }

  async function handleDownloadTemplate() {
    try {
      const base64 = await getStudentImportTemplateAction();
      const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
      const blob = new Blob([bytes], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "student-import-template.xlsx";
      anchor.click();
      URL.revokeObjectURL(url);
      notify.success("Template downloaded");
    } catch {
      notify.error("Could not download template");
    }
  }

  function handleImport() {
    if (!selectedFile) {
      notify.error("Select a CSV or Excel file first");
      return;
    }

    const formData = new FormData();
    formData.set("file", selectedFile);

    startTransition(async () => {
      const result = await importStudentsAction(formData);
      if (result.success && result.data) {
        const { imported, failed } = result.data;
        notify.success(`Imported ${imported} student${imported === 1 ? "" : "s"}`, {
          description: failed > 0 ? `${failed} row(s) failed validation` : undefined,
        });
        setOpen(false);
        resetFileSelection();
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
            Upload a CSV or Excel file (max 500 rows). Download the Excel template with sample records and field guide.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Button variant="outline" className="w-full" onClick={handleDownloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Download template
          </Button>

          <label
            className={cn(
              "relative flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed p-6 transition-colors",
              selectedFile
                ? "border-[#22C55E]/40 bg-[#22C55E]/5 hover:bg-[#22C55E]/10"
                : "border-[#6D5EF7]/25 bg-[#6D5EF7]/5 hover:bg-[#6D5EF7]/10"
            )}
          >
            {selectedFile ? (
              <>
                <CheckCircle2 className="h-8 w-8 text-[#22C55E]" />
                <span className="max-w-full truncate px-2 text-sm font-semibold text-foreground">
                  {selectedFile.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatFileSize(selectedFile.size)} · Ready to import
                </span>
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    resetFileSelection();
                  }}
                  className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                  Remove file
                </button>
              </>
            ) : (
              <>
                <FileSpreadsheet className="h-8 w-8 text-[#6D5EF7]" />
                <span className="text-sm font-medium">Choose CSV or Excel file</span>
                <span className="text-xs text-muted-foreground">.csv, .xlsx, .xls — up to 5 MB</span>
              </>
            )}
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="sr-only"
              onChange={handleFileChange}
            />
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={pending || !selectedFile}>
            {pending ? "Importing..." : "Import students"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
