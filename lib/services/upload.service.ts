import { v2 as cloudinary } from "cloudinary";
import { getCloudinaryCloudName } from "@/lib/config/env";
import { logger } from "@/lib/logger";

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
      folder: `nandhini-crm/${folder}`,
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

export function getCloudinaryUploadUrl(): string {
  return `https://api.cloudinary.com/v1_1/${getCloudinaryCloudName()}/auto/upload`;
}
