import { RateLimiterMemory, RateLimiterRedis } from "rate-limiter-flexible";
import type { RateLimiterAbstract } from "rate-limiter-flexible";
import { headers } from "next/headers";
import { logger } from "@/lib/logger";

const limiterOptions = { duration: 900, blockDuration: 900 };

type LimiterConfig = { points: number; duration?: number; blockDuration?: number };

function createMemoryLimiter(config: LimiterConfig): RateLimiterMemory {
  return new RateLimiterMemory({
    points: config.points,
    duration: config.duration ?? limiterOptions.duration,
    blockDuration: config.blockDuration ?? limiterOptions.blockDuration,
  });
}

let redisClient: import("ioredis").default | null = null;
let redisInitAttempted = false;

async function getRedisClient(): Promise<import("ioredis").default | null> {
  const redisUrl = process.env.REDIS_URL?.trim();
  if (!redisUrl) return null;

  if (redisClient) return redisClient;
  if (redisInitAttempted) return null;

  redisInitAttempted = true;
  try {
    const Redis = (await import("ioredis")).default;
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      lazyConnect: true,
    });
    await redisClient.connect();
    logger.info("Rate limiting using Redis", { url: redisUrl.replace(/:[^:@]+@/, ":***@") });
    return redisClient;
  } catch (error) {
    logger.warn("Redis unavailable for rate limiting; falling back to memory", error);
    redisClient = null;
    return null;
  }
}

async function createLimiter(
  keyPrefix: string,
  config: LimiterConfig
): Promise<RateLimiterAbstract> {
  const client = await getRedisClient();
  if (client) {
    return new RateLimiterRedis({
      storeClient: client,
      keyPrefix: `rl:${keyPrefix}`,
      points: config.points,
      duration: config.duration ?? limiterOptions.duration,
      blockDuration: config.blockDuration ?? limiterOptions.blockDuration,
    });
  }
  return createMemoryLimiter(config);
}

const limiterConfigs: Record<RateLimitAction, LimiterConfig> = {
  login: { points: 5, ...limiterOptions },
  register: { points: 3, duration: 3600, blockDuration: 3600 },
  "otp-verify": { points: 5, duration: 600, blockDuration: 600 },
  "otp-resend": { points: 3, duration: 600, blockDuration: 600 },
  "forgot-password": { points: 3, duration: 3600, blockDuration: 3600 },
  search: { points: 60, duration: 900, blockDuration: 120 },
  upload: { points: 40, duration: 900, blockDuration: 120 },
  import: { points: 5, duration: 3600, blockDuration: 3600 },
};

const memoryLimiters: Partial<Record<RateLimitAction, RateLimiterMemory>> = {};
const redisLimiters = new Map<RateLimitAction, RateLimiterAbstract>();

export type RateLimitAction =
  | "login"
  | "register"
  | "otp-verify"
  | "otp-resend"
  | "forgot-password"
  | "search"
  | "upload"
  | "import";

async function getLimiter(action: RateLimitAction): Promise<RateLimiterAbstract> {
  const client = await getRedisClient();
  if (client) {
    const existing = redisLimiters.get(action);
    if (existing) return existing;
    const limiter = await createLimiter(action, limiterConfigs[action]);
    redisLimiters.set(action, limiter);
    return limiter;
  }

  if (!memoryLimiters[action]) {
    memoryLimiters[action] = createMemoryLimiter(limiterConfigs[action]);
  }
  return memoryLimiters[action]!;
}

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
  const limiter = await getLimiter(action);
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

export async function enforceUserRateLimit(
  action: Extract<RateLimitAction, "search" | "upload" | "import">,
  userId: string
): Promise<void> {
  const result = await checkRateLimit(action, userId);
  if (!result.allowed) {
    throw new Error(
      `Too many requests. Please try again in ${result.retryAfterSeconds} seconds.`
    );
  }
}
