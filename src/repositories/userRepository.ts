import { db, timestamp } from "../firebase.js";

const collection = db.collection("users");

interface UpsertUserInput {
  lineUserId: string;
  displayName?: string;
  pictureUrl?: string;
  language?: string;
}

export async function getAllUserIds(): Promise<string[]> {
  const snapshot = await collection.select("lineUserId").get();
  return snapshot.docs.map((doc) => doc.id);
}

export async function upsertUser(input: UpsertUserInput): Promise<void> {
  await collection.doc(input.lineUserId).set(
    {
      lineUserId: input.lineUserId,
      displayName: input.displayName ?? null,
      pictureUrl: input.pictureUrl ?? null,
      language: input.language ?? null,
      createdAt: timestamp(),
      lastActiveAt: timestamp(),
    },
    { merge: true },
  );
}
