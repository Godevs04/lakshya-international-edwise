import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isApiDocsEnabled } from "@/lib/config/api-docs";
import { ApiDocsClient } from "./api-docs-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "API Documentation",
  robots: { index: false, follow: false },
};

export default function ApiDocsPage() {
  if (!isApiDocsEnabled()) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <ApiDocsClient />
    </div>
  );
}
