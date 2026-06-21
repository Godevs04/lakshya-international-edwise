import { describe, it, expect, afterEach } from "vitest";
import {
  isValidCloudinaryPublicId,
  isValidCloudinaryUrl,
  validateCloudinaryDocument,
  validateOptionalCloudinaryUrl,
  getUploadFolder,
} from "@/lib/services/upload.service";

describe("upload.service validation", () => {
  const originalCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  afterEach(() => {
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = originalCloudName;
  });

  it("builds upload folder path", () => {
    expect(getUploadFolder("students")).toBe("nandhini-crm/students");
  });

  it("validates public id prefix", () => {
    expect(isValidCloudinaryPublicId("nandhini-crm/students/doc1", "students")).toBe(true);
    expect(isValidCloudinaryPublicId("other-folder/doc1", "students")).toBe(false);
  });

  it("validates cloudinary url", () => {
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = "demo";
    expect(isValidCloudinaryUrl("https://res.cloudinary.com/demo/image/upload/v1/x.pdf")).toBe(true);
    expect(isValidCloudinaryUrl("https://evil.com/file.pdf")).toBe(false);
  });

  it("validates full document", () => {
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = "demo";
    const result = validateCloudinaryDocument(
      "https://res.cloudinary.com/demo/raw/upload/v1/nandhini-crm/students/a.pdf",
      "nandhini-crm/students/a",
      "students"
    );
    expect(result.valid).toBe(true);
  });

  it("validates optional cloudinary url", () => {
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = "demo";
    expect(
      validateOptionalCloudinaryUrl(
        "https://res.cloudinary.com/demo/image/upload/v1/nandhini-crm/students/photo.jpg",
        "students"
      ).valid
    ).toBe(true);
    expect(validateOptionalCloudinaryUrl("", "students").valid).toBe(true);
    expect(validateOptionalCloudinaryUrl("https://evil.com/x.jpg", "students").valid).toBe(false);
  });
});
