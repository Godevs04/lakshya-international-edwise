"use client";

import { PageError } from "@/components/dashboard/page-error";

export default function StudentsError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return <PageError error={error} reset={reset} title="Failed to load students" />;
}
