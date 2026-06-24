"use client";

import { useEffect, useState } from "react";
import { getLenderOptionsAction } from "@/lib/actions/lender.actions";
import type { LenderOption } from "@/types";

export function useLenderOptions(initial?: LenderOption[]) {
  const [options, setOptions] = useState<LenderOption[]>(initial ?? []);
  const [loading, setLoading] = useState(!initial?.length);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const result = await getLenderOptionsAction();
      if (!cancelled) {
        setOptions(result);
        setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { options, loading };
}
