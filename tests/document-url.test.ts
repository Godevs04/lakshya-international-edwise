import { describe, expect, it } from "vitest";
import { getDocumentUrlError, getOptionalLinkUrlError, isValidDocumentUrl, normalizeDocumentUrl, normalizeOptionalLinkUrl } from "@/lib/utils/document-url";

describe("document-url", () => {
  it("accepts https google drive links", () => {
    const url = "https://drive.google.com/file/d/abc123/view?usp=sharing";
    expect(normalizeDocumentUrl(`  ${url}  `)).toBe(url);
    expect(isValidDocumentUrl(url)).toBe(true);
    expect(getDocumentUrlError(url)).toBeNull();
  });

  it("accepts other https document links", () => {
    const url = "https://example.com/docs/student-aadhaar.pdf";
    expect(isValidDocumentUrl(url)).toBe(true);
  });

  it("rejects empty and non-https urls", () => {
    expect(getDocumentUrlError("")).toBe("Document URL is required");
    expect(isValidDocumentUrl("http://drive.google.com/file")).toBe(false);
    expect(isValidDocumentUrl("not-a-url")).toBe(false);
  });

  it("allows empty optional link urls", () => {
    expect(getOptionalLinkUrlError("")).toBeNull();
    expect(getOptionalLinkUrlError(undefined)).toBeNull();
    expect(normalizeOptionalLinkUrl("  ")).toBeUndefined();
  });
});
