import jsPDF from "jspdf";
import * as XLSX from "xlsx";

function flattenRow(row: Record<string, unknown>): Record<string, string> {
  const flat: Record<string, string> = {};
  for (const [key, value] of Object.entries(row)) {
    if (key === "__v" || key === "_id") continue;
    if (value === null || value === undefined) {
      flat[key] = "";
    } else if (typeof value === "object") {
      flat[key] = JSON.stringify(value);
    } else {
      flat[key] = String(value);
    }
  }
  return flat;
}

export function exportToExcel(data: Record<string, unknown>[]): Buffer {
  const rows = data.map(flattenRow);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

export function exportToPdf(
  data: Record<string, unknown>[],
  title: string
): Uint8Array {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  doc.setFontSize(14);
  doc.text(title, 14, 14);

  if (data.length === 0) {
    return new Uint8Array(doc.output("arraybuffer"));
  }

  const rows = data.map(flattenRow);
  const columns = Object.keys(rows[0] ?? {});
  const pageWidth = doc.internal.pageSize.getWidth();
  const colWidth = Math.min(40, (pageWidth - 28) / Math.max(columns.length, 1));

  doc.setFontSize(9);
  let y = 24;

  columns.forEach((col, index) => {
    doc.text(col.slice(0, 18), 14 + index * colWidth, y);
  });
  y += 7;

  doc.setFontSize(8);
  for (const row of rows) {
    columns.forEach((col, index) => {
      doc.text((row[col] ?? "").slice(0, 24), 14 + index * colWidth, y);
    });
    y += 6;
    if (y > 190) {
      doc.addPage();
      y = 14;
    }
  }

  return new Uint8Array(doc.output("arraybuffer"));
}
