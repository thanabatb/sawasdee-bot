import { messagingApi } from "@line/bot-sdk";

import type { GreetingTemplate } from "../types.js";

export function buildGreetingCarousel(
  templates: GreetingTemplate[],
  heading: string,
): messagingApi.FlexMessage {
  return {
    type: "flex",
    altText: heading,
    contents: {
      type: "carousel",
      contents: templates.map((template) => ({
        type: "bubble",
        hero: {
          type: "image",
          url: template.imageUrl,
          size: "full",
          aspectMode: "cover",
          aspectRatio: "1:1",
        },
        body: {
          type: "box",
          layout: "vertical",
          spacing: "sm",
          contents: [
            {
              type: "text",
              text: template.title,
              weight: "bold",
              wrap: true,
            },
            {
              type: "text",
              text: template.altText,
              size: "sm",
              color: "#666666",
              wrap: true,
            },
          ],
        },
      })),
    },
  };
}

export function buildTemplateImages(templates: GreetingTemplate[]): messagingApi.ImageMessage[] {
  return templates.map((template) => ({
    type: "image",
    originalContentUrl: template.imageUrl,
    previewImageUrl: template.thumbnailUrl ?? template.imageUrl,
  }));
}

export function buildHelpMessage(): messagingApi.Message {
  return {
    type: "text",
    text: "ส่งข้อความว่า \"สวัสดีวันนี้\" เพื่อรับรูปประจำวัน หรือส่ง \"วันเกิด\" เพื่อดูรูปอวยพรวันเกิด",
  };
}
