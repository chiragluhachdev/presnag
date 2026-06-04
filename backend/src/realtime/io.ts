import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { isAllowedOrigin } from "../config/env";

let io: Server | null = null;

export function initIO(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, cb) =>
        isAllowedOrigin(origin || undefined)
          ? cb(null, true)
          : cb(new Error("CORS blocked"), false),
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    // Vendor dashboard joins its own room to receive new orders / updates.
    socket.on("vendor:join", (vendorId: string) => {
      if (vendorId) socket.join(`vendor:${vendorId}`);
    });
    // Customer joins an order room to track status live.
    socket.on("order:track", (orderNumber: string) => {
      if (orderNumber) socket.join(`order:${orderNumber}`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
}

export function emitNewOrder(vendorId: string, order: unknown) {
  io?.to(`vendor:${vendorId}`).emit("order:new", order);
}

export function emitOrderStatus(vendorId: string, orderNumber: string, order: unknown) {
  io?.to(`vendor:${vendorId}`).emit("order:status", order);
  io?.to(`order:${orderNumber}`).emit("order:status", order);
}
