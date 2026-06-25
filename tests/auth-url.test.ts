import { afterEach, describe, expect, it, vi } from "vitest";
import { getConfiguredAuthUrl, getPublicAuthUrl, resolveAuthUrl } from "@/lib/config/env";

describe("resolveAuthUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses AUTH_URL when set for non-production", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("AUTH_URL", "http://localhost:4000");
    expect(resolveAuthUrl()).toBe("http://localhost:4000");
  });

  it("uses AUTH_URL in production when it is not localhost", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("AUTH_URL", "https://crm.example.com");
    expect(resolveAuthUrl()).toBe("https://crm.example.com");
  });

  it("ignores localhost AUTH_URL in production and uses VERCEL_URL", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("AUTH_URL", "http://localhost:4000");
    vi.stubEnv("VERCEL_URL", "my-app.vercel.app");
    expect(resolveAuthUrl()).toBe("https://my-app.vercel.app");
  });

  it("falls back to localhost in development", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("AUTH_URL", "");
    vi.stubEnv("NEXTAUTH_URL", "");
    vi.stubEnv("PORT", "4000");
    expect(resolveAuthUrl()).toBe("http://localhost:4000");
  });
});

describe("getConfiguredAuthUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns the explicit auth URL when configured", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("AUTH_URL", "https://lie.teamgodevs.in");
    expect(getConfiguredAuthUrl()).toBe("https://lie.teamgodevs.in");
  });

  it("ignores localhost auth URLs in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("AUTH_URL", "http://localhost:4000");
    expect(getConfiguredAuthUrl()).toBeUndefined();
  });
});

describe("getPublicAuthUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses AUTH_URL instead of Vercel fallback for user-facing links", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("AUTH_URL", "https://lie.teamgodevs.in");
    vi.stubEnv("VERCEL_URL", "preview-project.vercel.app");
    expect(getPublicAuthUrl()).toBe("https://lie.teamgodevs.in");
  });

  it("falls back to localhost when no explicit auth URL is set", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("AUTH_URL", "");
    vi.stubEnv("NEXTAUTH_URL", "");
    vi.stubEnv("PORT", "4000");
    expect(getPublicAuthUrl()).toBe("http://localhost:4000");
  });
});
