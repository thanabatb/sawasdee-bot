# Sawasdee Bot

LINE bot สำหรับส่งรูปสวัสดีรายวันและรูปอวยพรตามโอกาส โดยใช้ Firebase เป็น backend หลัก

## Stack

| Layer | Tech |
|---|---|
| Runtime | Node.js 20+ + TypeScript |
| Server | Express 5 |
| LINE SDK | `@line/bot-sdk` v11 |
| Database | Firebase Firestore (via Admin SDK) |
| Dev tunnel | localtunnel (ผ่าน `./bin/dev-line-webhook`) |

## Project Structure

```
src/
├── index.ts                    # Express app — health + webhook routes
├── config.ts                   # Env config, requireEnv() guard
├── firebase.ts                 # Firebase singleton init, exports db + timestamp
├── types.ts                    # GreetingTemplate, TemplateCategory
├── handlers/
│   └── webhook.ts              # LINE middleware + webhookHandler
├── services/
│   └── greetingService.ts      # resolveMessagesFromText() → message arrays
├── repositories/
│   ├── templateRepository.ts   # getDailyTemplates(), getOccasionTemplates()
│   └── userRepository.ts       # upsertUser()
├── line/
│   └── messages.ts             # LINE message builders (Flex carousel, images, help)
└── scripts/
    └── seedTemplates.ts        # Seed Firestore from templates.seed.json
```

### Adding a new command — pattern to follow

1. Add a Firestore query in `repositories/templateRepository.ts`
2. Add a resolver in `services/greetingService.ts`
3. Wire the keyword into `resolveMessagesFromText()` in the same file

## Setup

### Prerequisites

- Node.js 20+
- Firebase project with Firestore enabled
- LINE channel (Messaging API type) ใน [LINE Developers Console](https://developers.line.biz/)

### Environment

```bash
cp .env.example .env.local
```

แก้ค่าต่อไปนี้ใน `.env.local`:

```env
LINE_CHANNEL_ACCESS_TOKEN=...
LINE_CHANNEL_SECRET=...

FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

> `FIREBASE_PRIVATE_KEY` ต้องอยู่ในเครื่องหมาย `"..."` และใช้ `\n` แทน newline จริง

### Install & Run

```bash
npm install
npm run dev          # watch mode (tsx --watch)
```

หรือใช้ wrapper ที่เปิด localtunnel ให้อัตโนมัติ:

```bash
./bin/dev-line-webhook
```

wrapper จะ:
1. โหลด `.env.local` หรือ `.env`
2. สตาร์ต server ผ่าน `npm run serve:local`
3. รอ `GET /health` ผ่าน
4. เปิด localtunnel และพิมพ์ webhook URL
5. นำ URL `.../webhook/line` ไปวางใน LINE Developers console → Messaging API → Webhook URL

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Watch mode (tsx) |
| `npm run serve:local` | Single run, no watch |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm start` | Run compiled `dist/index.js` |
| `npm run check` | Type-check only (no emit) |
| `npm run seed:templates` | Seed Firestore from `templates.seed.json` |

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/webhook/line` | LINE webhook receiver |

## Supported User Commands

| User sends | Bot responds with |
|---|---|
| `สวัสดีวันนี้` / `today` / `daily` | Flex carousel + images สำหรับวันนี้ (Bangkok timezone) |
| `วันเกิด` / `birthday` | Flex carousel + images สำหรับ occasion `birthday` |
| anything else | Help message |

## Firestore Collections

### `users/{lineUserId}`

Upserted ทุกครั้งที่มี text message เข้ามา

| Field | Type | Notes |
|---|---|---|
| `lineUserId` | string | document ID |
| `displayName` | string \| null | จาก LINE profile |
| `pictureUrl` | string \| null | |
| `language` | string \| null | |
| `createdAt` | Timestamp | serverTimestamp, set once |
| `lastActiveAt` | Timestamp | serverTimestamp, updated every message |

### `templates/{templateId}`

| Field | Type | Notes |
|---|---|---|
| `title` | string | แสดงใน Flex bubble |
| `imageUrl` | string | URL รูปเต็ม |
| `thumbnailUrl` | string? | ถ้าไม่มีใช้ imageUrl แทน |
| `category` | `"daily"` \| `"occasion"` | |
| `dayOfWeek` | number (0–6) | 0 = อาทิตย์, ใช้เมื่อ category = `daily` |
| `occasionKey` | string? | เช่น `"birthday"`, ใช้เมื่อ category = `occasion` |
| `tags` | string[] | สำหรับ filter ในอนาคต |
| `altText` | string | accessibility / LINE notification text |
| `isActive` | boolean | query จะ filter เฉพาะ `true` |
| `sortOrder` | number | เรียงจากน้อยไปมาก, limit 8 ต่อ query |

### Seeding Templates

แก้ `templates.seed.json` ให้เป็น URL รูปจริง แล้วรัน:

```bash
npm run seed:templates
```

## Roadmap

- [ ] Rich menu
- [ ] Admin flow สำหรับอัปโหลด template
- [ ] Image generation worker (เฟสถัดไป)
- [ ] เพิ่ม occasion keys เพิ่มเติม (เช่น `new_year`, `songkran`)
