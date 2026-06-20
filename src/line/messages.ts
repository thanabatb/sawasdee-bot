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

export function buildOccasionSelectorCard(): messagingApi.FlexMessage {
  return {
    type: "flex",
    altText: "อยากได้รูปอวยพรแบบไหนคะ?",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        contents: [
          {
            type: "text",
            text: "รูปอวยพร 🙏",
            weight: "bold",
            size: "xl",
            align: "center",
          },
          {
            type: "text",
            text: "อยากได้รูปอวยพรแบบไหนคะ?",
            size: "sm",
            color: "#888888",
            align: "center",
          },
          {
            type: "box",
            layout: "horizontal",
            spacing: "sm",
            margin: "lg",
            contents: [
              {
                type: "button",
                action: {
                  type: "message",
                  label: "💰 ร่ำรวย",
                  text: "ร่ำรวย",
                },
                style: "primary",
                color: "#F5A623",
                flex: 1,
              },
              {
                type: "button",
                action: {
                  type: "message",
                  label: "💪 สุขภาพ",
                  text: "สุขภาพ",
                },
                style: "primary",
                color: "#4CAF50",
                flex: 1,
              },
            ],
          },
          {
            type: "button",
            action: {
              type: "message",
              label: "🎂 วันเกิด",
              text: "วันเกิด",
            },
            style: "secondary",
            margin: "sm",
          },
        ],
      },
    },
  };
}

export function buildDailyPreviewCard(template: GreetingTemplate): messagingApi.FlexMessage {
  return {
    type: "flex",
    altText: `รูปสวัสดีวันนี้ — ${template.title}`,
    contents: {
      type: "bubble",
      hero: {
        type: "image",
        url: template.imageUrl,
        size: "full",
        aspectMode: "cover",
        aspectRatio: "1:1",
        action: {
          type: "postback",
          label: "รับรูป",
          data: `action=send_image&templateId=${template.id}`,
        },
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
            size: "md",
            wrap: true,
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "button",
            style: "primary",
            color: "#06C755",
            action: {
              type: "postback",
              label: "📥 รับรูปนี้เลย",
              data: `action=send_image&templateId=${template.id}`,
            },
          },
        ],
      },
    },
  };
}

export function buildHelpMessage(): messagingApi.Message {
  return {
    type: "text",
    text: "กดปุ่มด้านล่างได้เลยนะคะ 😊\nหรือพิมพ์ \"สวัสดีวันนี้\" เพื่อรับรูปสวัสดี\nพิมพ์ \"รูปอวยพร\" เพื่อเลือกรูปอวยพร",
  };
}
