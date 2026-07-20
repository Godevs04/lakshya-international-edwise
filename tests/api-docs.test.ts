import { afterEach, describe, expect, it } from "vitest";
import { isApiDocsEnabled } from "@/lib/config/api-docs";
import { buildOpenApiDocument } from "@/lib/openapi/spec";
import { SERVER_ACTION_GROUPS } from "@/lib/openapi/server-actions-catalog";

describe("isApiDocsEnabled", () => {
  const original = process.env.ENABLE_API_DOCS;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.ENABLE_API_DOCS;
    } else {
      process.env.ENABLE_API_DOCS = original;
    }
  });

  it("returns false when unset", () => {
    delete process.env.ENABLE_API_DOCS;
    expect(isApiDocsEnabled()).toBe(false);
  });

  it("returns false when explicitly false", () => {
    process.env.ENABLE_API_DOCS = "false";
    expect(isApiDocsEnabled()).toBe(false);
  });

  it("returns true only when explicitly enabled", () => {
    process.env.ENABLE_API_DOCS = "true";
    expect(isApiDocsEnabled()).toBe(true);

    process.env.ENABLE_API_DOCS = "1";
    expect(isApiDocsEnabled()).toBe(true);
  });
});

describe("buildOpenApiDocument", () => {
  it("includes REST routes and all server action groups", () => {
    process.env.AUTH_URL = "http://localhost:4000";
    const doc = buildOpenApiDocument() as {
      paths: Record<string, unknown>;
      tags: Array<{ name: string }>;
    };

    expect(doc.paths["/api/health"]).toBeDefined();
    expect(doc.paths["/api/cron/follow-up-reminders"]).toBeDefined();
    expect(doc.paths["/api/auth/session"]).toBeDefined();

    const actionCount = SERVER_ACTION_GROUPS.reduce(
      (sum, group) => sum + group.actions.length,
      0
    );
    const actionPaths = Object.keys(doc.paths).filter((path) =>
      path.startsWith("/server-actions/")
    );
    expect(actionPaths).toHaveLength(actionCount);
    expect(doc.tags.length).toBeGreaterThan(SERVER_ACTION_GROUPS.length);
    expect(doc.paths["/server-actions/marketing/submitWebsiteEnquiryAction"]).toBeDefined();
    expect(doc.paths["/server-actions/site-leads/getSiteLeadCounts"]).toBeDefined();
  });
});
