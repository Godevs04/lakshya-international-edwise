"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth/auth";
import { requirePermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/constants/permissions";
import {
  createLender,
  deleteLender,
  getLenderOptions,
  getLendersWithCounts,
  updateLender,
} from "@/lib/services/lender.service";
import { runLoggedMutation, runLoggedQuery } from "@/lib/action-utils";
import { createLenderSchema, updateLenderSchema } from "@/lib/validations/schemas";
import { logActivity } from "@/lib/services/activity.service";
import type { ActionResult, LenderListItem, LenderOption } from "@/types";

function parseLenderFormData(formData: FormData) {
  const read = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value.trim() : "";
  };

  return {
    name: read("name"),
    slug: read("slug"),
    logoUrl: read("logoUrl"),
    logoPublicId: read("logoPublicId"),
    accentColor: read("accentColor"),
  };
}

export async function getLendersAction(): Promise<LenderListItem[]> {
  return runLoggedQuery("getLendersAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.STUDENTS_READ);
    return getLendersWithCounts();
  }, []);
}

export async function getLenderOptionsAction(): Promise<LenderOption[]> {
  return runLoggedQuery("getLenderOptionsAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.STUDENTS_READ);
    return getLenderOptions();
  }, []);
}

export async function createLenderAction(
  formData: FormData
): Promise<ActionResult<{ id: string; slug: string }>> {
  return runLoggedMutation("createLenderAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.STUDENTS_WRITE);

    const parsed = createLenderSchema.safeParse(parseLenderFormData(formData));

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
    }

    try {
      const lender = await createLender({
        name: parsed.data.name,
        slug: parsed.data.slug,
        logoUrl: parsed.data.logoUrl || undefined,
        logoPublicId: parsed.data.logoPublicId || undefined,
        accentColor: parsed.data.accentColor || undefined,
      });

      await logActivity({
        action: "lender.created",
        description: `Bank ${lender.name} was added`,
        resourceType: "lender",
        resourceId: lender._id.toString(),
        userId: user?.id,
        userName: user?.name,
      });

      revalidatePath("/dashboard/lenders");
      revalidatePath("/dashboard/students");
      return {
        success: true,
        data: { id: lender._id.toString(), slug: lender.slug },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to add bank",
      };
    }
  });
}

export async function updateLenderAction(
  id: string,
  formData: FormData
): Promise<ActionResult<{ id: string; slug: string }>> {
  return runLoggedMutation("updateLenderAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.STUDENTS_WRITE);

    const parsed = updateLenderSchema.safeParse(parseLenderFormData(formData));

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
    }

    try {
      const lender = await updateLender(id, {
        name: parsed.data.name,
        logoUrl: parsed.data.logoUrl || undefined,
        logoPublicId: parsed.data.logoPublicId || undefined,
        accentColor: parsed.data.accentColor || undefined,
      });

      await logActivity({
        action: "lender.updated",
        description: `Bank ${lender.name} was updated`,
        resourceType: "lender",
        resourceId: lender._id.toString(),
        userId: user?.id,
        userName: user?.name,
      });

      revalidatePath("/dashboard/lenders");
      revalidatePath("/dashboard/students");
      return {
        success: true,
        data: { id: lender._id.toString(), slug: lender.slug },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update bank",
      };
    }
  });
}

export async function deleteLenderAction(id: string): Promise<ActionResult> {
  return runLoggedMutation("deleteLenderAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.STUDENTS_WRITE);

    try {
      const lender = await deleteLender(id);

      await logActivity({
        action: "lender.deleted",
        description: `Bank ${lender.name} was deleted`,
        resourceType: "lender",
        resourceId: id,
        userId: user?.id,
        userName: user?.name,
      });

      revalidatePath("/dashboard/lenders");
      revalidatePath("/dashboard/students");
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete bank",
      };
    }
  });
}
