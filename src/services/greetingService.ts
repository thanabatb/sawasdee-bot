import { messagingApi } from "@line/bot-sdk";

import { buildDailyPreviewCard, buildHelpMessage, buildOccasionSelectorCard, buildTemplateImages } from "../line/messages.js";
import { getDailyTemplates, getOccasionTemplates } from "../repositories/templateRepository.js";
import type { GreetingTemplate } from "../types.js";

const dayNames = [
  "วันอาทิตย์",
  "วันจันทร์",
  "วันอังคาร",
  "วันพุธ",
  "วันพฤหัสบดี",
  "วันศุกร์",
  "วันเสาร์",
];

function todayInBangkok(): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Bangkok",
    weekday: "short",
  });
  const weekday = formatter.format(new Date());
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return map[weekday] ?? new Date().getDay();
}

function buildTemplateResponse(
  templates: GreetingTemplate[],
): messagingApi.Message[] {
  if (templates.length === 0) {
    return [{ type: "text", text: "ขณะนี้ยังไม่มีรูปในหมวดนี้นะคะ รอติดตามได้เลย 🙏" }];
  }

  const random = templates[Math.floor(Math.random() * templates.length)];
  return buildTemplateImages([random]);
}

export async function getDailyGreetingMessages(): Promise<messagingApi.Message[]> {
  const dayOfWeek = todayInBangkok();
  const templates = await getDailyTemplates(dayOfWeek);
  console.log("[greeting] daily request", { dayOfWeek, templateCount: templates.length });
  if (templates.length === 0) {
    return [{ type: "text", text: "ขณะนี้ยังไม่มีรูปในหมวดนี้นะคะ รอติดตามได้เลย 🙏" }];
  }
  const random = templates[Math.floor(Math.random() * templates.length)];
  return [buildDailyPreviewCard(random)];
}

export async function getOccasionGreetingMessages(
  occasionKey: string,
): Promise<messagingApi.Message[]> {
  const templates = await getOccasionTemplates(occasionKey);
  console.log("[greeting] occasion request", { occasionKey, templateCount: templates.length });
  const heading = occasionKey === "birthday" ? "รูปอวยพรวันเกิด" : "รูปอวยพรโอกาสพิเศษ";
  return buildTemplateResponse(templates);
}

export async function resolveMessagesFromText(text: string): Promise<messagingApi.Message[]> {
  const normalized = text.trim().toLowerCase();

  if (normalized === "สวัสดีวันนี้" || normalized === "today" || normalized === "daily") {
    return getDailyGreetingMessages();
  }

  if (normalized === "รูปอวยพร" || normalized === "อวยพร") {
    return [buildOccasionSelectorCard()];
  }

  if (normalized === "วันเกิด" || normalized === "birthday") {
    return getOccasionGreetingMessages("birthday");
  }

  if (normalized === "ร่ำรวย") {
    return getOccasionGreetingMessages("rich");
  }

  if (normalized === "สุขภาพ") {
    return getOccasionGreetingMessages("health");
  }

  return [buildHelpMessage()];
}
