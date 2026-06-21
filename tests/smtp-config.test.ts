import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { isSmtpConfigured, warnIfSmtpMissing } from "@/lib/config/smtp-config";

describe("smtp-config", () => {
  const original = { ...process.env };

  beforeEach(() => {
    process.env = { ...original };
  });

  afterEach(() => {
    process.env = original;
  });

  it("detects configured SMTP", () => {
    process.env.SMTP_HOST = "smtp.gmail.com";
    process.env.SMTP_USER = "user@example.com";
    process.env.SMTP_PASS = "secret";
    expect(isSmtpConfigured()).toBe(true);
  });

  it("detects missing SMTP", () => {
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    expect(isSmtpConfigured()).toBe(false);
  });

  it("warnIfSmtpMissing does not throw when SMTP missing", () => {
    delete process.env.SMTP_HOST;
    expect(() => warnIfSmtpMissing()).not.toThrow();
  });
});
