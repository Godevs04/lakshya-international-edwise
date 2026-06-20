"use client";

export default function OverviewError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <h2 className="text-lg font-semibold">Failed to load dashboard</h2>
      <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
      <button onClick={reset} className="mt-4 text-sm text-primary hover:underline">
        Try again
      </button>
    </div>
  );
}
