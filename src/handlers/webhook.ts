import {
  LineBotClient,
  middleware,
  type MiddlewareConfig,
  webhook,
} from "@line/bot-sdk";
import type { RequestHandler } from "express";

import { config } from "../config.js";
import { upsertUser } from "../repositories/userRepository.js";
import { resolveMessagesFromText } from "../services/greetingService.js";

const lineConfig: MiddlewareConfig = {
  channelSecret: config.line.channelSecret,
};

export const lineMiddleware = middleware(lineConfig);
const client = LineBotClient.fromChannelAccessToken({
  channelAccessToken: config.line.channelAccessToken,
});

async function handleEvent(event: webhook.Event): Promise<void> {
  console.log("[line] incoming event", { type: event.type });

  if (event.type !== "message" || event.message.type !== "text") {
    return;
  }

  if (!event.source || event.source.type !== "user" || !event.source.userId) {
    return;
  }

  if (!event.replyToken) {
    return;
  }

  const userId = event.source.userId;
  console.log("[line] text message", {
    userId,
    text: event.message.text,
    replyToken: event.replyToken.slice(0, 8),
  });

  const profile = await client.getProfile(userId);
  try {
    await upsertUser({
      lineUserId: userId,
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl,
      language: profile.language,
    });
  } catch (error) {
    console.warn("[line] user upsert failed; continuing without persistence", error);
  }

  const messages = await resolveMessagesFromText(event.message.text);
  console.log("[line] replying", {
    userId,
    messageCount: messages.length,
    messageTypes: messages.map((message) => message.type),
  });
  await client.replyMessage({
    replyToken: event.replyToken,
    messages,
  });
  console.log("[line] reply sent", { userId });
}

export const webhookHandler: RequestHandler = async (req, res, next) => {
  try {
    const events = (req.body?.events ?? []) as webhook.Event[];
    console.log("[line] webhook batch", { eventCount: events.length });
    await Promise.all(events.map((event) => handleEvent(event)));
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error("[line] webhook error", error);
    next(error);
  }
};
