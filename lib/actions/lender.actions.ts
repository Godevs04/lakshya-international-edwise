"use server";

import { getSessionUser } from "@/lib/auth/auth";
import { requirePermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { getLendersWithCounts } from "@/lib/services/lender.service";
import { runLoggedQuery } from "@/lib/action-utils";
import type { LenderListItem } from "@/types";

export async function getLendersAction(): Promise<LenderListItem[]> {
  return runLoggedQuery("getLendersAction", async () => {
    const user = await getSessionUser();
    requirePermission(user, PERMISSIONS.STUDENTS_READ);
    return getLendersWithCounts();
  }, []);
}
