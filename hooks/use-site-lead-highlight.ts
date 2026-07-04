"use client";

import { useEffect, useRef } from "react";
import { notify } from "@/lib/toast";

export function useSiteLeadHighlight<T extends { _id: string }>({
  highlightId,
  data,
  onHighlight,
  toastMessage = "New lead from website",
}: {
  highlightId?: string;
  data: T[];
  onHighlight: (lead: T) => void;
  toastMessage?: string;
}) {
  const handledRef = useRef<string | null>(null);

  useEffect(() => {
    if (!highlightId || handledRef.current === highlightId) return;

    const lead = data.find((entry) => entry._id === highlightId);
    if (!lead) return;

    handledRef.current = highlightId;
    notify.info(toastMessage);
    onHighlight(lead);
  }, [data, highlightId, onHighlight, toastMessage]);
}
