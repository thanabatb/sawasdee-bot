import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function normalizePrivateKey(value: string): string {
  return value.replace(/\\n/g, "\n");
}

export const config = {
  port: Number(process.env.PORT ?? 3000),
  line: {
    channelAccessToken: requireEnv("LINE_CHANNEL_ACCESS_TOKEN"),
    channelSecret: requireEnv("LINE_CHANNEL_SECRET"),
  },
  firebase: {
    projectId: requireEnv("FIREBASE_PROJECT_ID"),
    clientEmail: requireEnv("FIREBASE_CLIENT_EMAIL"),
    privateKey: normalizePrivateKey(requireEnv("FIREBASE_PRIVATE_KEY")),
  },
} as const;
