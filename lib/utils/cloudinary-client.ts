import { getUploadSignatureAction } from "@/lib/actions/upload.actions";
import type { UploadFolder } from "@/lib/constants/upload-folders";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  mimeType: string;
}

export async function uploadFileToCloudinary(
  file: File,
  folder: UploadFolder
): Promise<{ success: true; data: CloudinaryUploadResult } | { success: false; error: string }> {
  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: "File must be under 10 MB" };
  }

  const sigResult = await getUploadSignatureAction(folder);
  if (!sigResult.success || !sigResult.data) {
    return { success: false, error: sigResult.error ?? "Upload is not available" };
  }

  const { timestamp, signature, apiKey, cloudName, folder: uploadFolder } = sigResult.data;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder", uploadFolder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    { method: "POST", body: formData }
  );

  if (!response.ok) {
    return { success: false, error: "Upload failed. Please try again." };
  }

  const result = (await response.json()) as {
    secure_url: string;
    public_id: string;
    format?: string;
    resource_type?: string;
  };

  const mimeType = result.format
    ? `${result.resource_type === "image" ? "image" : "application"}/${result.format}`
    : file.type || "application/octet-stream";

  return {
    success: true,
    data: {
      url: result.secure_url,
      publicId: result.public_id,
      mimeType,
    },
  };
}
