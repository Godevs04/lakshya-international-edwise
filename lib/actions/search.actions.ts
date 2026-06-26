"use server";

import { globalSearch } from "@/lib/services/search.service";
import { getSessionUser } from "@/lib/auth/auth";
import { hasPermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { runLoggedQuery } from "@/lib/action-utils";
import type { SearchResult } from "@/types";
import { enforceUserRateLimit } from "@/lib/rate-limit";

export async function globalSearchAction(query: string): Promise<SearchResult[]> {
  return runLoggedQuery("globalSearchAction", async () => {
    const user = await getSessionUser();
    if (!user) {
      throw new Error("Unauthorized: insufficient permissions");
    }

    await enforceUserRateLimit("search", user.id);

    return globalSearch(query, {
      students: hasPermission(user, PERMISSIONS.STUDENTS_READ),
      partners: hasPermission(user, PERMISSIONS.PARTNERS_READ),
      applications: hasPermission(user, PERMISSIONS.APPLICATIONS_READ),
    }, 10, user);
  }, []);
}
