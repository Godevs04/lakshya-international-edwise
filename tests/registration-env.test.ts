import { afterEach, describe, expect, it } from "vitest";
import { isPublicRegistrationAllowed } from "@/lib/config/env";

describe("isPublicRegistrationAllowed", () => {
  const original = process.env.ALLOW_PUBLIC_REGISTRATION;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.ALLOW_PUBLIC_REGISTRATION;
    } else {
      process.env.ALLOW_PUBLIC_REGISTRATION = original;
    }
  });

  it("returns false when unset", () => {
    delete process.env.ALLOW_PUBLIC_REGISTRATION;
    expect(isPublicRegistrationAllowed()).toBe(false);
  });

  it("returns false when explicitly false", () => {
    process.env.ALLOW_PUBLIC_REGISTRATION = "false";
    expect(isPublicRegistrationAllowed()).toBe(false);
  });

  it("returns true only when explicitly enabled", () => {
    process.env.ALLOW_PUBLIC_REGISTRATION = "true";
    expect(isPublicRegistrationAllowed()).toBe(true);

    process.env.ALLOW_PUBLIC_REGISTRATION = "1";
    expect(isPublicRegistrationAllowed()).toBe(true);
  });
});
