"use server";

import { getSessionUser } from "@/lib/auth/auth";
import { requirePermission } from "@/lib/auth/permissions";
import {
  isUploadFolder,
  UPLOAD_FOLDER_PERMISSIONS,
} from "@/lib/constants/upload-folders";
import { getSignedUploadParams, type SignedUploadParams } from "@/lib/services/upload.service";
import { runLoggedMutation } from "@/lib/action-utils";
import type { ActionResult } from "@/types";
import { enforceUserRateLimit } from "@/lib/rate-limit";

export async function getUploadSignatureAction(
  folder: string
): Promise<ActionResult<SignedUploadParams>> {
  return runLoggedMutation("getUploadSignatureAction", async () => {
    const user = await getSessionUser();

    if (!isUploadFolder(folder)) {
      return { success: false, error: "Invalid upload folder" };
    }

    requirePermission(user, UPLOAD_FOLDER_PERMISSIONS[folder]);
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    await enforceUserRateLimit("upload", user.id);

    const params = getSignedUploadParams(folder);
    if (!params) {
      return { success: false, error: "Cloudinary is not configured" };
    }

    return { success: true, data: params };
  });
}
