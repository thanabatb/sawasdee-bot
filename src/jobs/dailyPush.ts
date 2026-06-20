import { LineBotClient } from "@line/bot-sdk";
import cron from "node-cron";

import { config } from "../config.js";
import { buildTemplateImages } from "../line/messages.js";
import { getAllUserIds } from "../repositories/userRepository.js";
import { getDailyGreetingMessages } from "../services/greetingService.js";

const client = LineBotClient.fromChannelAccessToken({
  channelAccessToken: config.line.channelAccessToken,
});

async function sendDailyPush(): Promise<void> {
  console.log("[daily-push] starting");

  const messages = await getDailyGreetingMessages();
  if (messages.length === 0) {
    console.log("[daily-push] no templates for today, skipping");
    return;
  }

  const userIds = await getAllUserIds();
  console.log("[daily-push] sending to users", { count: userIds.length });

  let sent = 0;
  let failed = 0;

  for (const userId of userIds) {
    try {
      await client.pushMessage({ to: userId, messages });
      sent++;
    } catch (error) {
      console.error("[daily-push] failed to push to user", { userId, error });
      failed++;
    }
  }

  console.log("[daily-push] done", { sent, failed });
}

// 04:00 Bangkok time = 21:00 UTC (UTC+7)
export function registerDailyPushJob(): void {
  cron.schedule("0 21 * * *", () => {
    void sendDailyPush();
  }, { timezone: "UTC" });

  console.log("[daily-push] job registered — fires at 04:00 Bangkok time");
}
