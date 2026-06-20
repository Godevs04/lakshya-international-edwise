"use client";

export default function StudentsError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="py-16 text-center">
      <p className="text-destructive">{error.message}</p>
      <button onClick={reset} className="mt-4 text-primary hover:underline">Retry</button>
    </div>
  );
}
