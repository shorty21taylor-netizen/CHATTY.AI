import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db/drizzle";
import { telegramSessions, telegramMessages, businessProfile } from "@/db/schema";
import { eq } from "drizzle-orm";
import { handleCommand, handleNaturalLanguage } from "@/lib/telegram/ea-agent";
import { sendMessage } from "@/lib/telegram/client";
import { getRedis } from "@/lib/utils/redis";

const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || "";

export async function POST(req: NextRequest) {
  if (WEBHOOK_SECRET) {
    const token = req.headers.get("x-telegram-bot-api-secret-token") || "";
    if (token !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  let update: Record<string, unknown>;
  try {
    update = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const message = update.message as Record<string, unknown> | undefined;
  if (!message) {
    return NextResponse.json({ ok: true });
  }

  const chat = message.chat as Record<string, unknown>;
  const from = message.from as Record<string, unknown> | undefined;
  const chatId = Number(chat.id);
  const text = (message.text as string) || "";
  const username = (from?.username as string) || "";

  const [session] = await db
    .select()
    .from(telegramSessions)
    .where(eq(telegramSessions.chatId, chatId))
    .limit(1);

  if (!session && text.startsWith("/start")) {
    const code = text.replace("/start", "").trim();
    if (!code) {
      await sendMessage(chatId, "Welcome! Use the link code from your Chatty AI dashboard to connect.");
      return NextResponse.json({ ok: true });
    }

    const redis = getRedis();
    const linkData = await redis.get(`telegram:link:${code}`);
    if (!linkData) {
      await sendMessage(chatId, "That link code is expired or invalid. Generate a new one from your dashboard.");
      return NextResponse.json({ ok: true });
    }

    const { orgId, userId } = JSON.parse(linkData);
    await redis.del(`telegram:link:${code}`);

    await db.insert(telegramSessions).values({
      orgId,
      userId,
      chatId,
      username,
    });

    const [profile] = await db
      .select({ name: businessProfile.companyName })
      .from(businessProfile)
      .where(eq(businessProfile.orgId, orgId))
      .limit(1);

    await sendMessage(
      chatId,
      `Connected to <b>${profile?.name || "your business"}</b>! Type /help to see what I can do.`,
    );
    return NextResponse.json({ ok: true });
  }

  if (!session) {
    await sendMessage(chatId, "Not linked yet. Use /start with your link code from the Chatty AI dashboard.");
    return NextResponse.json({ ok: true });
  }

  await db
    .update(telegramSessions)
    .set({ lastActiveAt: new Date() })
    .where(eq(telegramSessions.chatId, chatId));

  await db.insert(telegramMessages).values({
    orgId: session.orgId,
    chatId,
    direction: "inbound",
    messageType: "text",
    text,
  });

  const [profile] = await db
    .select({ name: businessProfile.companyName })
    .from(businessProfile)
    .where(eq(businessProfile.orgId, session.orgId))
    .limit(1);

  const ctx = {
    orgId: session.orgId,
    chatId,
    businessName: profile?.name || "your business",
  };

  if (text.startsWith("/")) {
    const cmd = text.split(" ")[0].split("@")[0].toLowerCase();
    await handleCommand(cmd, text, ctx);
  } else {
    await handleNaturalLanguage(text, ctx);
  }

  return NextResponse.json({ ok: true });
}
