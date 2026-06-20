"use client";
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return <div className="py-16 text-center"><p>{error.message}</p><button onClick={reset}>Retry</button></div>;
}
