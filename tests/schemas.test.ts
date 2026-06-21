import { describe, expect, it } from "vitest";
import { registerSchema, studentSchema, verifyOtpSchema } from "@/lib/validations/schemas";

describe("schemas", () => {
  it("validates register payload", () => {
    const result = registerSchema.safeParse({
      name: "Kavin",
      email: "kavin@example.com",
      password: "Password1!",
      confirmPassword: "Password1!",
    });
    expect(result.success).toBe(true);
  });

  it("rejects mismatched register passwords", () => {
    const result = registerSchema.safeParse({
      name: "Kavin",
      email: "kavin@example.com",
      password: "Password1!",
      confirmPassword: "Different1!",
    });
    expect(result.success).toBe(false);
  });

  it("validates otp format", () => {
    expect(verifyOtpSchema.safeParse({ email: "a@b.com", otp: "123456" }).success).toBe(true);
    expect(verifyOtpSchema.safeParse({ email: "a@b.com", otp: "12345" }).success).toBe(false);
  });

  it("accepts decimal interest on student payload", () => {
    const result = studentSchema.safeParse({
      firstName: "Test",
      lastName: "Student",
      interest: "7.8",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.interest).toBe(7.8);
    }
  });
});
