"use server";

import { globalSearch } from "@/lib/services/search.service";
import { runLoggedQuery } from "@/lib/action-utils";
import type { SearchResult } from "@/types";

export async function globalSearchAction(query: string): Promise<SearchResult[]> {
  return runLoggedQuery("globalSearchAction", () => globalSearch(query), []);
}
