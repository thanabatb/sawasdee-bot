# Sawasdee Bot

LINE bot สำหรับส่งรูปสวัสดีรายวันและรูปอวยพรตามโอกาส โดยใช้ Firebase เป็น backend หลักใน MVP แรก

## Stack

- Node.js + TypeScript
- Express
- LINE Messaging API
- Firebase Admin SDK
- Firestore

## Setup

1. คัดลอก `.env.example` เป็น `.env`
2. ใส่ค่า `LINE_CHANNEL_ACCESS_TOKEN` และ `LINE_CHANNEL_SECRET`
3. ใส่ค่า Firebase service account:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`
4. รัน `npm install`
5. รัน `npm run dev`

หรือใช้ wrapper เดียว:

```bash
./bin/dev-line-webhook
```

## Endpoints

- `GET /health`
- `POST /webhook/line`

ตั้งค่า LINE webhook URL ไปที่ `https://your-domain.com/webhook/line`

สำหรับ local testing ให้ใช้ URL ที่ `./bin/dev-line-webhook` พิมพ์ออกมา แล้วนำค่า `.../webhook/line` ไปใส่ใน LINE Developers console

ถ้าต้องการสตาร์ต server แบบไม่ watch สำหรับ wrapper หรือ background process:

```bash
npm run serve:local
```

wrapper `./bin/dev-line-webhook` จะ:

- โหลด `.env.local` หรือ `.env`
- สตาร์ต local server ผ่าน `npm run serve:local`
- รอ `GET /health`
- เปิด `localtunnel`
- พิมพ์ webhook URL สุดท้ายให้เอาไปวางใน LINE Developers

## Firestore Collections

### `users`

ใช้ document id เป็น `lineUserId`

field หลัก:

- `lineUserId`
- `displayName`
- `pictureUrl`
- `language`
- `createdAt`
- `lastActiveAt`

### `templates`

ใช้ document id เป็น `templateId`

field หลัก:

- `title`
- `imageUrl`
- `thumbnailUrl`
- `category`: `daily` หรือ `occasion`
- `dayOfWeek`: 0-6
- `occasionKey`: เช่น `birthday`
- `tags`
- `altText`
- `isActive`
- `sortOrder`

## Seed Templates

แก้ไฟล์ `templates.seed.json` ให้เป็น URL รูปจริงก่อน แล้วรัน:

```bash
npm run seed:templates
```

## Supported Commands

- `สวัสดีวันนี้`
- `วันเกิด`
- `ช่วยเหลือ`

## Next Step

- เพิ่ม rich menu
- เพิ่ม admin flow สำหรับอัปโหลด template
- ต่อ image generation worker ในเฟสถัดไป
