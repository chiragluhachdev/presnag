import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || "5008", 10),
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/presnag",
  JWT_SECRET: process.env.JWT_SECRET || "dev_secret",
  // Single-domain frontend (also used to build QR links to /vendor/:slug).
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || "placeholder",
};

export const cloudinaryEnabled = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET
);

// Allowed browser origin (the single frontend app). Extend if you add more.
export const allowedOrigins = [
  env.CLIENT_URL,
  "https://presnag.com",
  "https://www.presnag.com",
  "https://presnag.vercel.app",
];

// In local dev, accept any localhost port so the app works even if Vite
// bumps off 5173 (e.g. when another process already holds it).
export function isAllowedOrigin(origin?: string): boolean {
  if (!origin) return true; // non-browser clients (curl, server-to-server)
  if (allowedOrigins.includes(origin)) return true;
  return /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
}
