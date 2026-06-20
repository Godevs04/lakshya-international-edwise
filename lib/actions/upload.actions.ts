"use server";

import { getSessionUser } from "@/lib/auth/auth";
import { requirePermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { getSignedUploadParams, type SignedUploadParams } from "@/lib/services/upload.service";
import { runLoggedMutation } from "@/lib/action-utils";
import type { ActionResult } from "@/types";

export async function getUploadSignatureAction(
  folder: string
): Promise<ActionResult<SignedUploadParams>> {
  return runLoggedMutation("getUploadSignatureAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.STUDENTS_WRITE);

    const params = getSignedUploadParams(folder);
    if (!params) {
      return { success: false, error: "Cloudinary is not configured" };
    }

    return { success: true, data: params };
  });
}
