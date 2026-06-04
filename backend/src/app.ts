import express from "express";
import cors from "cors";
import { isAllowedOrigin } from "./config/env";
import { notFound, errorHandler } from "./middleware/error";

import authRoutes from "./routes/auth.routes";
import publicRoutes from "./routes/public.routes";
import vendorRoutes from "./routes/vendor.routes";
import adminRoutes from "./routes/admin.routes";
import uploadRoutes from "./routes/upload.routes";
import paymentRoutes from "./routes/payment.routes";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: (origin, cb) =>
        isAllowedOrigin(origin) ? cb(null, true) : cb(new Error(`CORS blocked: ${origin}`)),
      credentials: true,
    })
  );
  app.use(express.json({ limit: "2mb" }));

  app.get("/api/health", (_req, res) => res.json({ ok: true, service: "presnag-api" }));

  app.use("/api/auth", authRoutes);
  app.use("/api/public", publicRoutes);
  app.use("/api/vendor", vendorRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/uploads", uploadRoutes);
  app.use("/api/payments", paymentRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
