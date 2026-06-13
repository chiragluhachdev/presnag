import http from "http";
import { createApp } from "./app";
import { connectDB } from "./config/db";
import { initIO } from "./realtime/io";
import { scheduleDailyPayout } from "./jobs/dailyPayout";
import { scheduleAutoCancel } from "./jobs/autoCancel";
import { env } from "./config/env";

async function main() {
  const app = createApp();
  const server = http.createServer(app);
  initIO(server);

  // Bind the port FIRST so the platform (Render) detects a live service and the
  // /health route responds immediately — even before the DB is ready.
  server.listen(env.PORT, "0.0.0.0", () => {
    console.log(`[server] PreSnag API listening on :${env.PORT}`);
    console.log(`[server] Socket.IO ready, CORS → ${env.CLIENT_URL}`);
  });

  // Connect to MongoDB in the background, retrying so a slow/late DB never
  // blocks the deploy from going live.
  async function connectWithRetry(attempt = 1): Promise<void> {
    try {
      await connectDB();
    } catch (err) {
      const delay = Math.min(30000, attempt * 5000);
      console.error(`[db] connection failed (attempt ${attempt}) — retrying in ${delay / 1000}s`, err);
      setTimeout(() => connectWithRetry(attempt + 1), delay);
    }
  }
  await connectWithRetry();

  // Schedule the once-daily managed-vendor settlement payout.
  scheduleDailyPayout();

  // Auto-decline orders the vendor doesn't answer within the response window.
  scheduleAutoCancel();
}

main().catch((err) => {
  console.error("[fatal]", err);
  process.exit(1);
});
