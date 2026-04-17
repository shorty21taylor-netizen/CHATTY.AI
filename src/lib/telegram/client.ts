// Telegram Bot API wrapper for Chatty AI Executive Assistant

const BASE = "https://api.telegram.org";

function token(): string {
  const t = process.env.TELEGRAM_BOT_TOKEN;
  if (!t) throw new Error("TELEGRAM_BOT_TOKEN required");
  return t;
}

async function call(method: string, body?: Record<string, unknown>) {
  const r = await fetch(`${BASE}/bot${token()}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await r.json();
  if (!data.ok) {
    throw new Error(`Telegram API ${method} failed: ${data.description}`);
  }
  return data.result;
}

export async function sendMessage(
  chatId: number,
  text: string,
  options?: { parseMode?: string; replyMarkup?: unknown },
) {
  return call("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: options?.parseMode || "HTML",
    reply_markup: options?.replyMarkup,
  });
}

export async function sendPhoto(
  chatId: number,
  photo: string,
  caption?: string,
) {
  return call("sendPhoto", {
    chat_id: chatId,
    photo,
    caption,
    parse_mode: "HTML",
  });
}

export async function getMe() {
  return call("getMe");
}

export async function setWebhook(url: string, secretToken?: string) {
  return call("setWebhook", {
    url,
    secret_token: secretToken,
    allowed_updates: ["message", "callback_query"],
  });
}

export async function answerCallbackQuery(
  callbackQueryId: string,
  text?: string,
) {
  return call("answerCallbackQuery", {
    callback_query_id: callbackQueryId,
    text,
  });
}
