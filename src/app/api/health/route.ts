import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getPoolStats } from "@/lib/db/pool";

export async function GET() {
  const checks: Record<string, { status: string; latency_ms?: number; error?: string }> = {};

  // Check database
  try {
    const start = Date.now();
    await pool.query("SELECT 1");
    checks.database = { status: "healthy", latency_ms: Date.now() - start };
  } catch (error: any) {
    checks.database = { status: "unhealthy", error: error.message };
  }

  // Check Redis
  try {
    const start = Date.now();
    const IORedisModule = await import("ioredis");
    const IORedis = IORedisModule.default;
    const redis = new IORedis(process.env.REDIS_URL || "", { connectTimeout: 3000, lazyConnect: false, maxRetriesPerRequest: 1 });
    await redis.ping();
    redis.disconnect();
    checks.redis = { status: "healthy", latency_ms: Date.now() - start };
  } catch (error: any) {
    checks.redis = { status: "unhealthy", error: error.message };
  }

  let poolStats;
  try {
    poolStats = getPoolStats();
  } catch {
    poolStats = null;
  }

  const allHealthy = Object.values(checks).every((c) => c.status === "healthy");

  return NextResponse.json(
    {
      status: allHealthy ? "healthy" : "degraded",
      version: process.env.RAILWAY_GIT_COMMIT_SHA?.slice(0, 7) || "dev",
      timestamp: new Date().toISOString(),
      checks,
      pool: poolStats,
    },
    { status: allHealthy ? 200 : 503 }
  );
}
