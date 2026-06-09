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

  // ---- Cashfree (Payments / Easy Split) ----
  CASHFREE_ENV: process.env.CASHFREE_ENV || "sandbox", // "sandbox" | "production"
  CASHFREE_APP_ID: process.env.CASHFREE_APP_ID || "",
  CASHFREE_SECRET_KEY: process.env.CASHFREE_SECRET_KEY || "",
  CASHFREE_WEBHOOK_SECRET: process.env.CASHFREE_WEBHOOK_SECRET || "",
  // ---- Cashfree Payouts (separate credentials) ----
  CASHFREE_PAYOUT_CLIENT_ID: process.env.CASHFREE_PAYOUT_CLIENT_ID || "",
  CASHFREE_PAYOUT_CLIENT_SECRET: process.env.CASHFREE_PAYOUT_CLIENT_SECRET || "",
};

export const cloudinaryEnabled = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET
);

// When Cashfree keys are absent (e.g. local dev) the app runs in a safe "demo"
// mode: onboarding / payout / payment calls are simulated instead of hitting Cashfree.
export const cashfreePgEnabled = Boolean(env.CASHFREE_APP_ID && env.CASHFREE_SECRET_KEY);
export const cashfreePayoutEnabled = Boolean(
  env.CASHFREE_PAYOUT_CLIENT_ID && env.CASHFREE_PAYOUT_CLIENT_SECRET
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
