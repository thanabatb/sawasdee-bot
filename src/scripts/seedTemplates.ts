import { readFile } from "node:fs/promises";
import path from "node:path";

import { db } from "../firebase.js";
import type { GreetingTemplate } from "../types.js";

async function main(): Promise<void> {
  const filePath = path.resolve(process.cwd(), "templates.seed.json");
  const raw = await readFile(filePath, "utf8");
  const templates = JSON.parse(raw) as GreetingTemplate[];

  const batch = db.batch();
  for (const template of templates) {
    const ref = db.collection("templates").doc(template.id);
    batch.set(ref, template, { merge: true });
  }

  await batch.commit();
  console.log(`Seeded ${templates.length} templates from ${filePath}`);
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
