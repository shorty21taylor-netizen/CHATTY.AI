import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getRedis } from "@/lib/utils/redis";
import { rateLimitRequest, rateLimitHeaders } from "@/lib/utils/rate-limit";

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST() {
  const { orgId, userId } = await auth();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await rateLimitRequest(orgId, "telegram-link", { limit: 10 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const code = generateCode();
  const redis = getRedis();
  await redis.set(
    `telegram:link:${code}`,
    JSON.stringify({ orgId, userId }),
    "EX",
    600,
  );

  const botUsername = process.env.TELEGRAM_BOT_USERNAME || "ChattyOpsBot";

  return NextResponse.json(
    {
      code,
      link: `https://t.me/${botUsername}?start=${code}`,
      expiresIn: 600,
    },
    { headers: rateLimitHeaders(rl) },
  );
}
