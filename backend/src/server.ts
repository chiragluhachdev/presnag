import http from "http";
import { createApp } from "./app";
import { connectDB } from "./config/db";
import { initIO } from "./realtime/io";
import { env } from "./config/env";

async function main() {
  await connectDB();
  const app = createApp();
  const server = http.createServer(app); 
  initIO(server);
  server.listen(env.PORT, () => {
    console.log(`[server] PreSnag API on http://localhost:${env.PORT}`);
    console.log(`[server] Socket.IO ready, CORS → ${env.CLIENT_URL}`);
  });
}

main().catch((err) => {
  console.error("[fatal]", err);
  process.exit(1);
});
