import { v2 as cloudinary } from "cloudinary";
import { getCloudinaryCloudName } from "@/lib/config/env";
import { logger } from "@/lib/logger";

export const UPLOAD_FOLDER_PREFIX = "lakshya-international-edwise";

function trim(value: string | undefined): string | undefined {
  return value?.trim();
}

cloudinary.config({
  cloud_name: trim(process.env.CLOUDINARY_CLOUD_NAME),
  api_key: trim(process.env.CLOUDINARY_API_KEY),
  api_secret: trim(process.env.CLOUDINARY_API_SECRET),
});

export interface UploadResult {
  url: string;
  publicId: string;
  mimeType: string;
}

export interface SignedUploadParams {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
}

export function getUploadFolder(folder: string): string {
  return `${UPLOAD_FOLDER_PREFIX}/${folder}`;
}

export function isValidCloudinaryPublicId(publicId: string, folder: string): boolean {
  return publicId.startsWith(`${getUploadFolder(folder)}/`);
}

export function isValidCloudinaryUrl(url: string): boolean {
  const cloudName = getCloudinaryCloudName();
  if (!cloudName) return false;
  return url.includes(`res.cloudinary.com/${cloudName}/`);
}

export function validateCloudinaryDocument(
  url: string,
  publicId: string,
  folder: string
): { valid: true } | { valid: false; error: string } {
  if (!isValidCloudinaryUrl(url)) {
    return { valid: false, error: "Document URL must be hosted on Cloudinary" };
  }
  if (!isValidCloudinaryPublicId(publicId, folder)) {
    return { valid: false, error: "Invalid document upload path" };
  }
  return { valid: true };
}

export function getSignedUploadParams(folder: string): SignedUploadParams | null {
  const cloudName = getCloudinaryCloudName();
  const apiKey = trim(process.env.CLOUDINARY_API_KEY);
  const apiSecret = trim(process.env.CLOUDINARY_API_SECRET);

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  const uploadFolder = getUploadFolder(folder);
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: uploadFolder },
    apiSecret
  );

  return { timestamp, signature, apiKey, cloudName, folder: uploadFolder };
}

export async function uploadToCloudinary(
  file: string,
  folder: string,
  resourceType: "image" | "raw" | "auto" = "auto"
): Promise<UploadResult> {
  const cloudName = getCloudinaryCloudName();
  if (!cloudName) {
    logger.error("Cloudinary upload failed: not configured in .env.local");
    throw new Error("Cloudinary is not configured in .env.local");
  }

  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: getUploadFolder(folder),
      resource_type: resourceType,
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      mimeType: result.format
        ? `${resourceType === "image" ? "image" : "application"}/${result.format}`
        : "application/octet-stream",
    };
  } catch (error) {
    logger.error("Cloudinary upload failed", error);
    throw error;
  }
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  if (!getCloudinaryCloudName()) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    logger.error("Cloudinary delete failed", error);
    throw error;
  }
}

export function validateOptionalCloudinaryUrl(
  url: string | undefined,
  folder: string
): { valid: true } | { valid: false; error: string } {
  const trimmed = url?.trim();
  if (!trimmed) return { valid: true };
  if (!isValidCloudinaryUrl(trimmed)) {
    return { valid: false, error: "Please upload the file using the upload button" };
  }
  if (!trimmed.includes(getUploadFolder(folder))) {
    return { valid: false, error: "Invalid upload path for this field" };
  }
  return { valid: true };
}

export function getCloudinaryUploadUrl(): string {
  return `https://api.cloudinary.com/v1_1/${getCloudinaryCloudName()}/auto/upload`;
}
