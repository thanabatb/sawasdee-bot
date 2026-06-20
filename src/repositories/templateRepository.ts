import type {
  DocumentSnapshot,
  QueryDocumentSnapshot,
} from "firebase-admin/firestore";

import { db } from "../firebase.js";
import type { GreetingTemplate, TemplateCategory } from "../types.js";

const collection = db.collection("templates");

function mapTemplate(
  doc: QueryDocumentSnapshot | DocumentSnapshot,
): GreetingTemplate {
  const data = doc.data();
  if (!data) {
    throw new Error(`Template ${doc.id} has no data`);
  }

  return {
    id: doc.id,
    title: String(data.title),
    imageUrl: String(data.imageUrl),
    thumbnailUrl: data.thumbnailUrl ? String(data.thumbnailUrl) : undefined,
    category: data.category as TemplateCategory,
    dayOfWeek: typeof data.dayOfWeek === "number" ? data.dayOfWeek : undefined,
    occasionKey: data.occasionKey ? String(data.occasionKey) : undefined,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    altText: String(data.altText ?? data.title ?? "Greeting image"),
    isActive: Boolean(data.isActive),
    sortOrder: Number(data.sortOrder ?? 0),
  };
}

export async function getDailyTemplates(dayOfWeek: number): Promise<GreetingTemplate[]> {
  const snapshot = await collection
    .where("category", "==", "daily")
    .where("isActive", "==", true)
    .where("dayOfWeek", "==", dayOfWeek)
    .orderBy("sortOrder", "asc")
    .limit(8)
    .get();

  return snapshot.docs.map(mapTemplate);
}

export async function getOccasionTemplates(occasionKey: string): Promise<GreetingTemplate[]> {
  const snapshot = await collection
    .where("category", "==", "occasion")
    .where("isActive", "==", true)
    .where("occasionKey", "==", occasionKey)
    .orderBy("sortOrder", "asc")
    .limit(8)
    .get();

  return snapshot.docs.map(mapTemplate);
}
