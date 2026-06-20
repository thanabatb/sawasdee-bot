import { db, storage, timestamp } from "../firebase.js";
import { deleteTemplate } from "../repositories/templateRepository.js";
import type { TemplateCategory } from "../types.js";

const dailyTitles: Record<number, string> = {
  0: "สวัสดีวันอาทิตย์",
  1: "สวัสดีวันจันทร์",
  2: "สวัสดีวันอังคาร",
  3: "สวัสดีวันพุธ",
  4: "สวัสดีวันพฤหัสบดี",
  5: "สวัสดีวันศุกร์",
  6: "สวัสดีวันเสาร์",
};

const occasionTitles: Record<string, string> = {
  birthday: "อวยพรวันเกิด",
  rich: "อวยพรร่ำรวย",
  health: "อวยพรสุขภาพดี",
};

async function getNextSortOrder(category: TemplateCategory, key: string | number): Promise<number> {
  const field = category === "daily" ? "dayOfWeek" : "occasionKey";
  const snapshot = await db.collection("templates")
    .where("category", "==", category)
    .where(field, "==", key)
    .orderBy("sortOrder", "desc")
    .limit(1)
    .get();

  if (snapshot.empty) return 1;
  return (snapshot.docs[0].data().sortOrder as number) + 1;
}

export interface UploadedTemplate {
  id: string;
  imageUrl: string;
  title: string;
}

export async function uploadDailyImages(
  files: Express.Multer.File[],
  dayOfWeek: number,
): Promise<UploadedTemplate[]> {
  const bucket = storage.bucket();
  const results: UploadedTemplate[] = [];
  let sortOrder = await getNextSortOrder("daily", dayOfWeek);

  for (const file of files) {
    const destPath = `templates/daily/${dayOfWeek}/${Date.now()}-${file.originalname}`;
    const fileRef = bucket.file(destPath);

    await fileRef.save(file.buffer, { metadata: { contentType: file.mimetype } });
    await fileRef.makePublic();

    const imageUrl = `https://storage.googleapis.com/${bucket.name}/${destPath}`;
    const title = `${dailyTitles[dayOfWeek]} ${sortOrder}`;
    const id = `daily-${dayOfWeek}-${Date.now()}-${sortOrder}`;

    await db.collection("templates").doc(id).set({
      title, imageUrl, category: "daily", dayOfWeek,
      tags: [], altText: title, isActive: true, sortOrder, createdAt: timestamp(),
    });

    results.push({ id, imageUrl, title });
    sortOrder++;
  }

  return results;
}

export async function uploadOccasionImages(
  files: Express.Multer.File[],
  occasionKey: string,
): Promise<UploadedTemplate[]> {
  const bucket = storage.bucket();
  const results: UploadedTemplate[] = [];
  let sortOrder = await getNextSortOrder("occasion", occasionKey);

  for (const file of files) {
    const destPath = `templates/occasion/${occasionKey}/${Date.now()}-${file.originalname}`;
    const fileRef = bucket.file(destPath);

    await fileRef.save(file.buffer, { metadata: { contentType: file.mimetype } });
    await fileRef.makePublic();

    const imageUrl = `https://storage.googleapis.com/${bucket.name}/${destPath}`;
    const title = `${occasionTitles[occasionKey] ?? "อวยพร"} ${sortOrder}`;
    const id = `occasion-${occasionKey}-${Date.now()}-${sortOrder}`;

    await db.collection("templates").doc(id).set({
      title, imageUrl, category: "occasion", occasionKey,
      tags: [], altText: title, isActive: true, sortOrder, createdAt: timestamp(),
    });

    results.push({ id, imageUrl, title });
    sortOrder++;
  }

  return results;
}

export async function deleteTemplateWithStorage(id: string, imageUrl: string): Promise<void> {
  try {
    const bucket = storage.bucket();
    const bucketPrefix = `https://storage.googleapis.com/${bucket.name}/`;
    if (imageUrl.startsWith(bucketPrefix)) {
      const filePath = imageUrl.slice(bucketPrefix.length);
      await bucket.file(filePath).delete();
    }
  } catch (error) {
    console.warn("[admin] storage delete failed, continuing", { id, error });
  }
  await deleteTemplate(id);
}
