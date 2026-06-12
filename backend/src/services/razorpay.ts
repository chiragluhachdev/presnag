/**
 * Razorpay service layer (Orders API + signature verification).
 *
 * When the live/test keys are NOT configured, calls fall back to a SAFE
 * SIMULATED response so the app keeps working locally. Set RAZORPAY_KEY_ID /
 * RAZORPAY_KEY_SECRET to activate.
 */
import crypto from "crypto";
import { env, razorpayEnabled } from "../config/env";

const BASE = "https://api.razorpay.com/v1";

function authHeader() {
  const token = Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString("base64");
  return { Authorization: `Basic ${token}`, "Content-Type": "application/json" };
}

async function http(url: string, init: RequestInit) {
  const res = await fetch(url, init);
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw new Error(data?.error?.description || `Razorpay request failed (${res.status})`);
  }
  return data;
}

export function razorpayKeyId(): string {
  return env.RAZORPAY_KEY_ID;
}

/** Create a Razorpay order. amount is in RUPEES (converted to paise here). */
export async function createRazorpayOrder(args: {
  amount: number;
  receipt: string;
}): Promise<{ razorpayOrderId: string; amount: number; currency: string; keyId: string; demo: boolean }> {
  const amountPaise = Math.round(args.amount * 100);
  if (!razorpayEnabled) {
    return { razorpayOrderId: `demo_rzp_${args.receipt}`, amount: amountPaise, currency: "INR", keyId: env.RAZORPAY_KEY_ID, demo: true };
  }
  const data = await http(`${BASE}/orders`, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify({ amount: amountPaise, currency: "INR", receipt: args.receipt }),
  });
  return { razorpayOrderId: data.id, amount: data.amount, currency: data.currency, keyId: env.RAZORPAY_KEY_ID, demo: false };
}

/** Verify the checkout signature Razorpay returns to the success handler. */
export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string): boolean {
  if (!razorpayEnabled) return true; // demo
  const expected = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return expected === signature;
}

/** Fallback: check whether a Razorpay order has a captured/authorized payment. */
export async function getRazorpayOrderPaid(orderId: string): Promise<{ paid: boolean; demo: boolean }> {
  if (!razorpayEnabled) return { paid: true, demo: true };
  const data = await http(`${BASE}/orders/${orderId}/payments`, { method: "GET", headers: authHeader() });
  const items: any[] = data?.items || [];
  const paid = items.some((p) => p.status === "captured" || p.status === "authorized");
  return { paid, demo: false };
}

/** Verify a Razorpay webhook signature. */
export function verifyRazorpayWebhook(rawBody: string, signature?: string): boolean {
  const secret = env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return true; // demo / unset
  if (!signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return expected === signature;
}
