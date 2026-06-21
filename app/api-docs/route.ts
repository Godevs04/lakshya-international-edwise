import { NextResponse } from "next/server";
import { ApiReference } from "@scalar/nextjs-api-reference";
import { isApiDocsEnabled } from "@/lib/config/api-docs";

export const dynamic = "force-dynamic";

const renderApiDocs = ApiReference({
  url: "/api/openapi.json",
});

export async function GET() {
  if (!isApiDocsEnabled()) {
    return new NextResponse("Not Found", { status: 404 });
  }

  return renderApiDocs();
}
