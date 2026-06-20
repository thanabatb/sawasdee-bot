import multer from "multer";
import express from "express";

import { config } from "./config.js";
import { uploadDailyImages, uploadOccasionImages, deleteTemplateWithStorage } from "./admin/upload.js";
import { getAllTemplates } from "./repositories/templateRepository.js";
import { renderAdminPage } from "./admin/ui.js";
import { lineMiddleware, webhookHandler } from "./handlers/webhook.js";
import { registerDailyPushJob, sendDailyPush } from "./jobs/dailyPush.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.post("/webhook/line", lineMiddleware, webhookHandler);

app.get("/admin", (_req, res) => {
  res.send(renderAdminPage());
});

app.post("/admin/upload", upload.array("images", 20), async (req, res, next) => {
  try {
    const { category, dayOfWeek, occasionKey } = req.body as Record<string, string>;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({ ok: false, error: "no files uploaded" });
      return;
    }

    let results;
    if (category === "daily") {
      results = await uploadDailyImages(files, Number(dayOfWeek));
    } else if (category === "occasion") {
      results = await uploadOccasionImages(files, occasionKey);
    } else {
      res.status(400).json({ ok: false, error: "invalid category" });
      return;
    }

    res.status(200).json({ ok: true, uploaded: results.length, templates: results });
  } catch (error) {
    next(error);
  }
});

app.get("/admin/templates", async (_req, res, next) => {
  try {
    const templates = await getAllTemplates();
    res.status(200).json({ ok: true, templates });
  } catch (error) {
    next(error);
  }
});

app.delete("/admin/templates/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body as { imageUrl: string };
    await deleteTemplateWithStorage(id, imageUrl ?? "");
    res.status(200).json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.post("/admin/push/daily", async (req, res, next) => {
  const secret = req.headers["x-admin-secret"];
  if (!config.adminSecret || secret !== config.adminSecret) {
    res.status(401).json({ ok: false, error: "unauthorized" });
    return;
  }
  try {
    await sendDailyPush();
    res.status(200).json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({
    ok: false,
    error: error.message,
  });
});

app.listen(config.port, () => {
  console.log(`Server listening on http://localhost:${config.port}`);
  registerDailyPushJob();
});
