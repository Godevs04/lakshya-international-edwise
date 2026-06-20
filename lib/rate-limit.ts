import { RateLimiterMemory } from "rate-limiter-flexible";
import { headers } from "next/headers";

const limiterOptions = { duration: 900, blockDuration: 900 };

const loginLimiter = new RateLimiterMemory({ points: 5, ...limiterOptions });
const registerLimiter = new RateLimiterMemory({ points: 3, duration: 3600, blockDuration: 3600 });
const otpVerifyLimiter = new RateLimiterMemory({ points: 5, duration: 600, blockDuration: 600 });
const otpResendLimiter = new RateLimiterMemory({ points: 3, duration: 600, blockDuration: 600 });
const forgotPasswordLimiter = new RateLimiterMemory({ points: 3, duration: 3600, blockDuration: 3600 });

export type RateLimitAction =
  | "login"
  | "register"
  | "otp-verify"
  | "otp-resend"
  | "forgot-password";

const limiters: Record<RateLimitAction, RateLimiterMemory> = {
  login: loginLimiter,
  register: registerLimiter,
  "otp-verify": otpVerifyLimiter,
  "otp-resend": otpResendLimiter,
  "forgot-password": forgotPasswordLimiter,
};

export async function getClientIp(): Promise<string> {
  const headerList = await headers();
  return (
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "unknown"
  );
}

export async function checkRateLimit(
  action: RateLimitAction,
  key: string
): Promise<{ allowed: true } | { allowed: false; retryAfterSeconds: number }> {
  const limiter = limiters[action];
  const rateKey = `${action}:${key}`;

  try {
    await limiter.consume(rateKey);
    return { allowed: true };
  } catch (error) {
    const retryAfterSeconds =
      error && typeof error === "object" && "msBeforeNext" in error
        ? Math.ceil(Number(error.msBeforeNext) / 1000)
        : 60;
    return { allowed: false, retryAfterSeconds };
  }
}
