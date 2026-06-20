"use client";

import { PageError } from "@/components/dashboard/page-error";

export default function OverviewError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <PageError error={error} reset={reset} title="Failed to load dashboard" />
  );
}
