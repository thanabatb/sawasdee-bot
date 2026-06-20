import express from "express";

import { config } from "./config.js";
import { lineMiddleware, webhookHandler } from "./handlers/webhook.js";
import { registerDailyPushJob, sendDailyPush } from "./jobs/dailyPush.js";

const app = express();

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.post("/webhook/line", lineMiddleware, webhookHandler);

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
