import { afterEach, describe, expect, it, vi } from "vitest";
import { getProductionEnvStatus, validateProductionEnv } from "@/lib/config/validate-env";

describe("validate-env", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("skips validation outside production", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("MONGODB_URI", "");
    expect(() => validateProductionEnv()).not.toThrow();
  });

  it("throws when required production variables are missing", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("MONGODB_URI", "");
    vi.stubEnv("AUTH_SECRET", "");
    vi.stubEnv("NEXTAUTH_SECRET", "");
    vi.stubEnv("AUTH_URL", "");
    vi.stubEnv("APP_ENCRYPTION_KEY", "");

    expect(() => validateProductionEnv()).toThrow(/Missing required production environment variables/);
  });

  it("passes when production variables are present", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("MONGODB_URI", "mongodb://localhost:27017/test");
    vi.stubEnv("AUTH_SECRET", "x".repeat(32));
    vi.stubEnv("AUTH_URL", "https://crm.example.com");
    vi.stubEnv("APP_ENCRYPTION_KEY", "a".repeat(64));

    expect(() => validateProductionEnv()).not.toThrow();
    expect(getProductionEnvStatus().valid).toBe(true);
  });
});
