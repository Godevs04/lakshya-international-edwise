"use server";

import { globalSearch } from "@/lib/services/search.service";
import type { SearchResult } from "@/types";

export async function globalSearchAction(query: string): Promise<SearchResult[]> {
  try {
    return await globalSearch(query);
  } catch {
    return [];
  }
}
