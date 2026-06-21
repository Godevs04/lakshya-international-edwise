"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth/auth";
import { requirePermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { runLoggedMutation } from "@/lib/action-utils";
import { revalidateInsightCaches } from "@/lib/cache/revalidate";
import { buildImportTemplateXlsx } from "@/lib/utils/student-import-template";
import { parseImportFile } from "@/lib/utils/student-import-parse";
import { importStudentsFromRows } from "@/lib/services/student-import.service";
import type { ActionResult } from "@/types";
import type { ImportStudentsResult } from "@/lib/services/student-import.service";
import { enforceUserRateLimit } from "@/lib/rate-limit";

const MAX_IMPORT_BYTES = 5 * 1024 * 1024;
const MAX_IMPORT_ROWS = 500;

export async function getStudentImportTemplateAction(): Promise<string> {
  const user = await getSessionUser();
  requirePermission(user, PERMISSIONS.STUDENTS_WRITE);
  return buildImportTemplateXlsx().toString("base64");
}

export async function importStudentsAction(
  formData: FormData
): Promise<ActionResult<ImportStudentsResult>> {
  return runLoggedMutation("importStudentsAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.STUDENTS_WRITE);
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    await enforceUserRateLimit("import", user.id);

    const file = formData.get("file");
    if (!(file instanceof File)) {
      return { success: false, error: "Please select a CSV or Excel file" };
    }

    if (file.size > MAX_IMPORT_BYTES) {
      return { success: false, error: "File must be 5 MB or smaller" };
    }

    const allowed = [".csv", ".xlsx", ".xls"];
    const lowerName = file.name.toLowerCase();
    if (!allowed.some((ext) => lowerName.endsWith(ext))) {
      return { success: false, error: "Only CSV or Excel (.xlsx, .xls) files are supported" };
    }

    const buffer = await file.arrayBuffer();
    const rows = parseImportFile(buffer, file.name);

    if (rows.length === 0) {
      return { success: false, error: "No data rows found in the file" };
    }

    if (rows.length > MAX_IMPORT_ROWS) {
      return {
        success: false,
        error: `Maximum ${MAX_IMPORT_ROWS} rows per import. Split your file and try again.`,
      };
    }

    const result = await importStudentsFromRows(rows, {
      userId: user?.id,
      userName: user?.name,
    });

    if (result.imported === 0) {
      return {
        success: false,
        error: result.errors[0]?.message ?? "No students could be imported",
        data: result,
      };
    }

    revalidatePath("/dashboard/students");
    revalidatePath("/dashboard/overview");
    revalidateInsightCaches();

    return { success: true, data: result };
  });
}
