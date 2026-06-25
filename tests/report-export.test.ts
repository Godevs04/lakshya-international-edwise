import { describe, expect, it } from "vitest";
import { buildColumnChunks, sanitizePdfText } from "@/lib/utils/report-export";

describe("report-export", () => {
  it("replaces rupee symbol with Rs. for PDF-safe output", () => {
    expect(sanitizePdfText("₹22,50,000")).toBe("Rs. 22,50,000");
  });

  it("strips unsupported characters from PDF text", () => {
    expect(sanitizePdfText("Test — value")).toBe("Test - value");
  });

  it("keeps narrow reports in a single table", () => {
    const columns = ["Name", "Status", "Amount"];
    expect(buildColumnChunks(columns)).toEqual([columns]);
  });

  it("chunks wide student reports with pinned identity columns", () => {
    const columns = [
      "Student ID",
      "Full Name",
      "Email",
      "Phone",
      "College",
      "Degree",
      "Status",
      "Bank",
      "LAN",
      "Notes",
      "Created On",
    ];
    const chunks = buildColumnChunks(columns);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].slice(0, 2)).toEqual(["Student ID", "Full Name"]);
    expect(chunks.every((chunk) => chunk.length <= 9)).toBe(true);
  });
});
