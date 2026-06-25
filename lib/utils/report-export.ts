import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { APP_TAGLINE } from "@/lib/brand/app-logo";

const BRAND_RGB: [number, number, number] = [45, 27, 105];
const ACCENT_RGB: [number, number, number] = [109, 94, 247];
const MUTED_RGB: [number, number, number] = [100, 116, 139];
const BORDER_RGB: [number, number, number] = [226, 232, 240];
const ZEBRA_RGB: [number, number, number] = [248, 249, 255];

const MAX_COLUMNS_PER_TABLE = 9;
const PINNED_COLUMNS = ["Student ID", "Full Name"];

export interface ReportExportOptions {
  title: string;
  subtitle?: string;
  companyName: string;
  tagline?: string;
  logoSrc?: string;
  generatedBy: string;
  generatedAt?: Date;
}

export type PdfExportOptions = ReportExportOptions;

function flattenRow(row: Record<string, string | number>): Record<string, string> {
  const flat: Record<string, string> = {};
  for (const [key, value] of Object.entries(row)) {
    flat[key] = value === null || value === undefined ? "" : String(value);
  }
  return flat;
}

export function sanitizePdfText(value: string): string {
  return value
    .replace(/\u20B9/g, "Rs. ")
    .replace(/\u00A0/g, " ")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "")
    .trim();
}

function pdfHeaderLabel(column: string): string {
  const labels: Record<string, string> = {
    "Last Update Note": "Update Note",
    "Last Updated By": "Updated By",
    "Last Updated On": "Updated On",
    "Loan Requested": "Requested",
    "Loan Sanctioned": "Sanctioned",
    "Loan Disbursed": "Disbursed",
    "Interest %": "Interest",
    "Bank LAN": "LAN",
    "Created On": "Created",
    "Updated On": "Updated",
    "Created By": "Created By",
  };
  return labels[column] ?? column;
}

function humanizeCell(column: string, value: string): string {
  const text = sanitizePdfText(value);
  if (column.toLowerCase() === "status" && text.includes("_")) {
    return text
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }
  return text;
}

function isRightAlignedColumn(column: string): boolean {
  return /total|count|amount|requested|sanctioned|disbursed|commission|earned|settled|pending|documents|notes|students|interest|%/i.test(
    column
  );
}

export function buildColumnChunks(columns: string[]): string[][] {
  if (columns.length <= MAX_COLUMNS_PER_TABLE) {
    return [columns];
  }

  const pinned = PINNED_COLUMNS.filter((column) => columns.includes(column));
  const rest = columns.filter((column) => !pinned.includes(column));
  const chunkSize = Math.max(1, MAX_COLUMNS_PER_TABLE - pinned.length);
  const chunks: string[][] = [];

  for (let index = 0; index < rest.length; index += chunkSize) {
    chunks.push([...pinned, ...rest.slice(index, index + chunkSize)]);
  }

  return chunks.length > 0 ? chunks : [columns];
}

function resolveFontSize(columnCount: number): number {
  if (columnCount <= 6) return 8.2;
  if (columnCount <= 9) return 7.4;
  return 6.8;
}

function lineHeight(fontSize: number): number {
  return fontSize * 0.42;
}

async function loadLogoDataUrl(logoSrc?: string): Promise<string | undefined> {
  if (!logoSrc?.trim()) return undefined;
  const src = logoSrc.trim();

  try {
    if (src.startsWith("/") && !src.startsWith("//")) {
      const fs = await import("fs/promises");
      const path = await import("path");
      const filePath = path.join(process.cwd(), "public", src.replace(/^\//, ""));
      const buffer = await fs.readFile(filePath);
      const mime = src.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
      return `data:${mime};base64,${buffer.toString("base64")}`;
    }

    if (src.startsWith("http://") || src.startsWith("https://")) {
      const response = await fetch(src);
      if (!response.ok) return undefined;
      const buffer = Buffer.from(await response.arrayBuffer());
      const contentType = response.headers.get("content-type") ?? "image/jpeg";
      return `data:${contentType};base64,${buffer.toString("base64")}`;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

function imageFormat(dataUrl: string): "PNG" | "JPEG" {
  return dataUrl.toLowerCase().includes("image/png") ? "PNG" : "JPEG";
}

function wrapText(doc: jsPDF, text: string, maxWidth: number, fontSize: number): string[] {
  doc.setFontSize(fontSize);
  return doc.splitTextToSize(text || "-", Math.max(maxWidth - 4, 6)) as string[];
}

function measureTextWidth(doc: jsPDF, text: string, fontSize: number, bold = false): number {
  doc.setFontSize(fontSize);
  doc.setFont("helvetica", bold ? "bold" : "normal");
  return doc.getTextWidth(text || "-");
}

function calculateColumnWidths(
  doc: jsPDF,
  columns: string[],
  rows: Record<string, string>[],
  tableWidth: number,
  fontSize: number
): number[] {
  const minWidth = 14;
  const maxWidth = Math.min(52, tableWidth * 0.34);

  const rawWidths = columns.map((column) => {
    const header = pdfHeaderLabel(column);
    let widest = measureTextWidth(doc, header, fontSize, true) + 4;

    for (const row of rows.slice(0, 25)) {
      const cell = humanizeCell(column, row[column] ?? "");
      const width = measureTextWidth(doc, cell, fontSize) + 4;
      if (width > widest) widest = width;
    }

    return Math.min(Math.max(widest, minWidth), maxWidth);
  });

  const total = rawWidths.reduce((sum, width) => sum + width, 0);
  if (total <= tableWidth) {
    const extra = tableWidth - total;
    return rawWidths.map((width) => width + (width / total) * extra);
  }

  return rawWidths.map((width) => (width / total) * tableWidth);
}

function measureRowHeight(
  doc: jsPDF,
  columns: string[],
  columnWidths: number[],
  row: Record<string, string>,
  fontSize: number,
  minHeight: number
): number {
  const lh = lineHeight(fontSize);
  let maxLines = 1;

  columns.forEach((column, index) => {
    const lines = wrapText(doc, humanizeCell(column, row[column] ?? ""), columnWidths[index], fontSize);
    if (lines.length > maxLines) maxLines = lines.length;
  });

  return Math.max(minHeight, maxLines * lh + 4);
}

function drawPageFooter(
  doc: jsPDF,
  pageNumber: number,
  totalPages: number,
  companyName: string
) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const footerY = pageHeight - 10;

  doc.setDrawColor(...BORDER_RGB);
  doc.setLineWidth(0.2);
  doc.line(14, footerY - 4, pageWidth - 14, footerY - 4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED_RGB);
  doc.text(`Confidential — ${sanitizePdfText(companyName)}`, 14, footerY);
  doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - 14, footerY, { align: "right" });
}

function drawReportHeader(
  doc: jsPDF,
  options: ReportExportOptions,
  logoDataUrl: string | undefined,
  recordCount: number,
  sectionLabel?: string
) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const generatedAt = options.generatedAt ?? new Date();

  doc.setFillColor(...BRAND_RGB);
  doc.rect(0, 0, pageWidth, 6, "F");

  let textX = margin;
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, imageFormat(logoDataUrl), margin, 10, 18, 18);
      textX = margin + 22;
    } catch {
      textX = margin;
    }
  }

  doc.setTextColor(...BRAND_RGB);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(sanitizePdfText(options.companyName), textX, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED_RGB);
  doc.text(sanitizePdfText(options.tagline ?? APP_TAGLINE), textX, 21);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12.5);
  doc.setTextColor(15, 23, 42);
  doc.text(sanitizePdfText(options.title), margin, 34);

  if (options.subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...MUTED_RGB);
    doc.text(sanitizePdfText(options.subtitle), margin, 39);
  }

  if (sectionLabel) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...ACCENT_RGB);
    doc.text(sanitizePdfText(sectionLabel), pageWidth - margin, 34, { align: "right" });
  }

  const metaTop = options.subtitle ? 44 : 40;
  doc.setFillColor(...ZEBRA_RGB);
  doc.roundedRect(margin, metaTop, pageWidth - margin * 2, 12, 2, 2, "F");
  doc.setDrawColor(...BORDER_RGB);
  doc.setLineWidth(0.2);
  doc.roundedRect(margin, metaTop, pageWidth - margin * 2, 12, 2, 2, "S");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(`Generated on: ${format(generatedAt, "dd MMM yyyy, hh:mm a")}`, margin + 4, metaTop + 4.8);
  doc.text(`Generated by: ${sanitizePdfText(options.generatedBy)}`, margin + 4, metaTop + 9.2);
  doc.text(`Records: ${recordCount}`, pageWidth - margin - 4, metaTop + 7, { align: "right" });

  doc.setDrawColor(...ACCENT_RGB);
  doc.setLineWidth(0.4);
  doc.line(margin, metaTop + 15, pageWidth - margin, metaTop + 15);

  return metaTop + 20;
}

function drawTableHeader(
  doc: jsPDF,
  columns: string[],
  columnWidths: number[],
  startX: number,
  y: number,
  rowHeight: number,
  fontSize: number
): number {
  const lh = lineHeight(fontSize);
  let maxLines = 1;

  columns.forEach((column, index) => {
    const lines = wrapText(doc, pdfHeaderLabel(column), columnWidths[index], fontSize);
    if (lines.length > maxLines) maxLines = lines.length;
  });

  const headerHeight = Math.max(rowHeight, maxLines * lh + 4);
  let x = startX;

  columns.forEach((column, index) => {
    const cellWidth = columnWidths[index];
    doc.setFillColor(...BRAND_RGB);
    doc.rect(x, y, cellWidth, headerHeight, "F");
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.15);
    doc.rect(x, y, cellWidth, headerHeight, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(fontSize);
    doc.setTextColor(255, 255, 255);

    const align = isRightAlignedColumn(column) ? "right" : "left";
    const textX = align === "right" ? x + cellWidth - 2 : x + 2;
    const lines = wrapText(doc, pdfHeaderLabel(column), cellWidth, fontSize);
    doc.text(lines, textX, y + 4, { align, baseline: "top" });

    x += cellWidth;
  });

  return headerHeight;
}

function drawTableRow(
  doc: jsPDF,
  columns: string[],
  columnWidths: number[],
  row: Record<string, string>,
  startX: number,
  y: number,
  rowHeight: number,
  shaded: boolean,
  fontSize: number
) {
  let x = startX;

  columns.forEach((column, index) => {
    const cellWidth = columnWidths[index];

    if (shaded) {
      doc.setFillColor(...ZEBRA_RGB);
      doc.rect(x, y, cellWidth, rowHeight, "F");
    }

    doc.setDrawColor(...BORDER_RGB);
    doc.setLineWidth(0.15);
    doc.rect(x, y, cellWidth, rowHeight, "S");

    const value = humanizeCell(column, row[column] ?? "");
    const align = isRightAlignedColumn(column) ? "right" : "left";
    const textX = align === "right" ? x + cellWidth - 2 : x + 2;
    const lines = wrapText(doc, value, cellWidth, fontSize);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(30, 41, 59);
    doc.text(lines, textX, y + 3.5, { align, baseline: "top" });

    x += cellWidth;
  });
}

interface TableSectionContext {
  pdfOptions: ReportExportOptions;
  logoDataUrl?: string;
  recordCount: number;
  margin: number;
  pageHeight: number;
  footerReserve: number;
}

function drawTableSection(
  doc: jsPDF,
  ctx: TableSectionContext,
  columns: string[],
  rows: Record<string, string>[],
  startY: number,
  sectionLabel?: string,
  showFullHeader = false
): number {
  const { margin, pageHeight, footerReserve, logoDataUrl, recordCount, pdfOptions } = ctx;
  const tableWidth = doc.internal.pageSize.getWidth() - margin * 2;
  const fontSize = resolveFontSize(columns.length);
  const columnWidths = calculateColumnWidths(doc, columns, rows, tableWidth, fontSize);
  const minRowHeight = Math.max(8, lineHeight(fontSize) + 4);
  const minHeaderHeight = 9;

  let y = startY;

  if (showFullHeader) {
    y = drawReportHeader(doc, pdfOptions, logoDataUrl, recordCount, sectionLabel);
  } else if (sectionLabel) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...ACCENT_RGB);
    doc.text(sanitizePdfText(sectionLabel), margin, y + 4);
    y += 8;
  }

  let headerHeight = drawTableHeader(doc, columns, columnWidths, margin, y, minHeaderHeight, fontSize);
  y += headerHeight;

  rows.forEach((row, index) => {
    const rowHeight = measureRowHeight(doc, columns, columnWidths, row, fontSize, minRowHeight);

    if (y + rowHeight > pageHeight - footerReserve) {
      doc.addPage();
      y = drawReportHeader(
        doc,
        pdfOptions,
        logoDataUrl,
        recordCount,
        sectionLabel ? `${sectionLabel} (continued)` : undefined
      );
      headerHeight = drawTableHeader(doc, columns, columnWidths, margin, y, minHeaderHeight, fontSize);
      y += headerHeight;
    }

    drawTableRow(doc, columns, columnWidths, row, margin, y, rowHeight, index % 2 === 1, fontSize);
    y += rowHeight;
  });

  return y + 6;
}

function formatSpreadsheetValue(column: string, value: string | number | undefined): string {
  return humanizeCell(column, value === null || value === undefined ? "" : String(value));
}

function getExportColumns(data: Record<string, string | number>[]): string[] {
  return Object.keys(data[0] ?? {});
}

function buildMetadataRows(options: ReportExportOptions, recordCount: number): string[][] {
  const generatedAt = options.generatedAt ?? new Date();
  return [
    [options.companyName],
    [options.tagline ?? APP_TAGLINE],
    [options.title],
    ...(options.subtitle ? [[options.subtitle]] : []),
    [],
    [
      "Generated on",
      format(generatedAt, "dd MMM yyyy, hh:mm a"),
      "Generated by",
      options.generatedBy,
      "Records",
      String(recordCount),
    ],
    [],
  ];
}

function escapeCsvCell(value: string): string {
  const text = value.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function calculateSpreadsheetColumnWidths(
  columns: string[],
  rows: Record<string, string>[]
): Array<{ wch: number }> {
  return columns.map((column) => {
    let maxLen = column.length;
    for (const row of rows.slice(0, 100)) {
      const len = formatSpreadsheetValue(column, row[column] ?? "").length;
      if (len > maxLen) maxLen = len;
    }
    return { wch: Math.min(Math.max(maxLen + 2, 12), 52) };
  });
}

function excelSheetName(title: string): string {
  const sanitized = title.replace(/[\\/?*[\]:]/g, " ").trim() || "Report";
  return sanitized.slice(0, 31);
}

function applyExcelPresentation(
  worksheet: XLSX.WorkSheet,
  columns: string[],
  rows: Record<string, string>[],
  headerRowIndex: number,
  subtitleRowCount: number
) {
  const mergeEndCol = Math.max(columns.length - 1, 5);
  const merges: XLSX.Range[] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: mergeEndCol } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: mergeEndCol } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: mergeEndCol } },
  ];

  if (subtitleRowCount > 0) {
    merges.push({ s: { r: 3, c: 0 }, e: { r: 3, c: mergeEndCol } });
  }

  worksheet["!merges"] = merges;
  worksheet["!cols"] = calculateSpreadsheetColumnWidths(columns, rows);
  worksheet["!autofilter"] = {
    ref: XLSX.utils.encode_range({
      s: { r: headerRowIndex, c: 0 },
      e: { r: headerRowIndex, c: Math.max(columns.length - 1, 0) },
    }),
  };
  worksheet["!views"] = [
    {
      state: "frozen",
      xSplit: 0,
      ySplit: headerRowIndex + 1,
      topLeftCell: XLSX.utils.encode_cell({ r: headerRowIndex + 1, c: 0 }),
      activePane: "bottomLeft",
    },
  ];
}

export function exportToCsv(
  data: Record<string, string | number>[],
  options: ReportExportOptions
): string {
  const rows = data.map(flattenRow);
  const columns = getExportColumns(data);
  const lines: string[] = [];

  for (const metaRow of buildMetadataRows(options, rows.length)) {
    if (metaRow.length === 0) {
      lines.push("");
      continue;
    }
    lines.push(metaRow.map((cell) => escapeCsvCell(cell)).join(","));
  }

  lines.push(columns.map((column) => escapeCsvCell(column)).join(","));
  for (const row of rows) {
    lines.push(
      columns
        .map((column) => escapeCsvCell(formatSpreadsheetValue(column, row[column])))
        .join(",")
    );
  }

  lines.push("");
  lines.push(escapeCsvCell(`Confidential — ${options.companyName}`));

  return `\uFEFF${lines.join("\n")}`;
}

export function exportToExcel(
  data: Record<string, string | number>[],
  options: ReportExportOptions
): Buffer {
  const rows = data.map(flattenRow);
  const columns = getExportColumns(data);
  const sheetRows: (string | number)[][] = [...buildMetadataRows(options, rows.length)];

  const headerRowIndex = sheetRows.length;
  sheetRows.push(columns);

  for (const row of rows) {
    sheetRows.push(columns.map((column) => formatSpreadsheetValue(column, row[column])));
  }

  const worksheet = XLSX.utils.aoa_to_sheet(sheetRows);
  applyExcelPresentation(
    worksheet,
    columns,
    rows,
    headerRowIndex,
    options.subtitle ? 1 : 0
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, excelSheetName(options.title));
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

export async function exportToPdf(
  data: Record<string, string | number>[],
  options: ReportExportOptions
): Promise<Uint8Array> {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const logoDataUrl = await loadLogoDataUrl(options.logoSrc);
  const rows = data.map(flattenRow);
  const allColumns = Object.keys(rows[0] ?? {});
  const margin = 14;
  const pageHeight = doc.internal.pageSize.getHeight();
  const footerReserve = 16;
  const columnChunks = buildColumnChunks(allColumns);

  const ctx: TableSectionContext = {
    pdfOptions: options,
    logoDataUrl,
    recordCount: rows.length,
    margin,
    pageHeight,
    footerReserve,
  };

  let y = drawReportHeader(doc, options, logoDataUrl, rows.length);

  if (rows.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(...MUTED_RGB);
    doc.text("No records found for the selected period.", margin, y + 8);
    drawPageFooter(doc, 1, 1, options.companyName);
    return new Uint8Array(doc.output("arraybuffer"));
  }

  columnChunks.forEach((columns, chunkIndex) => {
    const sectionLabel =
      columnChunks.length > 1
        ? `Section ${chunkIndex + 1} of ${columnChunks.length}`
        : undefined;

    if (chunkIndex > 0) {
      doc.addPage();
      y = margin + 6;
    }

    y = drawTableSection(
      doc,
      ctx,
      columns,
      rows,
      y,
      sectionLabel,
      chunkIndex > 0
    );
  });

  const totalPages = doc.getNumberOfPages();
  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);
    drawPageFooter(doc, page, totalPages, options.companyName);
  }

  return new Uint8Array(doc.output("arraybuffer"));
}
