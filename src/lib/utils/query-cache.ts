import { getRedis } from "./redis";

const DEFAULT_TTL_SECONDS = 60;

export async function cached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds = DEFAULT_TTL_SECONDS,
): Promise<T> {
  try {
    const redis = getRedis();
    const raw = await redis.get(key);
    if (raw) {
      return JSON.parse(raw) as T;
    }
  } catch {
    // Redis unavailable — fall through to fetcher
  }

  const data = await fetcher();

  try {
    const redis = getRedis();
    await redis.set(key, JSON.stringify(data), "EX", ttlSeconds);
  } catch {
    // Redis unavailable — still return data
  }

  return data;
}

export async function invalidate(key: string): Promise<void> {
  try {
    const redis = getRedis();
    await redis.del(key);
  } catch {
    // Redis unavailable
  }
}

export async function invalidatePattern(pattern: string): Promise<void> {
  try {
    const redis = getRedis();
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch {
    // Redis unavailable
  }
}

export function orgCacheKey(orgId: string, resource: string): string {
  return `cache:${orgId}:${resource}`;
}
