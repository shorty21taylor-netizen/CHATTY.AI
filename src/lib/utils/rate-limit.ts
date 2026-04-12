// ─── Rate Limiting via Railway Redis ────────────────────────────
import { Redis } from "ioredis";

let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    if (!process.env.REDIS_URL) {
      throw new Error("REDIS_URL environment variable is required");
    }
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
    redis.on("error", (err) => {
      console.error("[Redis] Connection error:", err.message);
    });
  }
  return redis;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  limit: number;
}

/**
 * Sliding window rate limiter.
 * @param key - Unique key (e.g., `ratelimit:${orgId}:${route}`)
 * @param limit - Max requests per window
 * @param windowMs - Window size in milliseconds
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const r = getRedis();
  const now = Date.now();
  const windowStart = now - windowMs;

  // Use sorted set: score = timestamp, member = unique request ID
  const multi = r.multi();
  multi.zremrangebyscore(key, 0, windowStart); // Remove expired entries
  multi.zadd(key, now.toString(), `${now}:${Math.random()}`); // Add current request
  multi.zcard(key); // Count requests in window
  multi.pexpire(key, windowMs); // Set TTL

  const results = await multi.exec();
  const count = (results?.[2]?.[1] as number) || 0;

  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    resetAt: new Date(now + windowMs),
    limit,
  };
}

/**
 * Rate limit middleware helper for API routes.
 */
export async function rateLimitRequest(
  orgId: string,
  route: string,
  options: { limit?: number; windowMs?: number } = {}
): Promise<RateLimitResult> {
  const limit = options.limit || 60; // 60 requests per minute default
  const windowMs = options.windowMs || 60_000;
  const key = `ratelimit:${orgId}:${route}`;
  return checkRateLimit(key, limit, windowMs);
}

/**
 * Build rate limit headers for API responses.
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": result.resetAt.toISOString(),
  };
}
