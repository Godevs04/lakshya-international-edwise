import { NextResponse } from "next/server";
import { isApiDocsEnabled } from "@/lib/config/api-docs";
import { buildOpenApiDocument } from "@/lib/openapi/spec";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isApiDocsEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(buildOpenApiDocument(), {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
