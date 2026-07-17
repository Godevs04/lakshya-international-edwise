import type { Metadata } from "next";
import { NotFoundView } from "@/components/marketing/sections/not-found-view";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function MarketingNotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <NotFoundView embedded />
    </div>
  );
}
