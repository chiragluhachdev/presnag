/**
 * Cashfree service layer.
 *
 * Wraps the Cashfree Payments (Easy Split) and Payouts REST APIs. When the
 * relevant credentials are NOT configured (e.g. local dev), every call falls
 * back to a SAFE SIMULATED response so the whole app keeps working — no real
 * money or network calls happen. Wire real sandbox/production keys via env to
 * activate the live calls.
 *
 * NOTE: endpoint paths / API version below target Cashfree's current REST APIs.
 * Verify against the Cashfree dashboard docs for your account when going live.
 */
import {
  env,
  cashfreePgEnabled,
  cashfreePayoutEnabled,
} from "../config/env";
import crypto from "crypto";

const PG_BASE =
  env.CASHFREE_ENV === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";
const PAYOUT_BASE =
  env.CASHFREE_ENV === "production"
    ? "https://api.cashfree.com/payout"
    : "https://sandbox.cashfree.com/payout";
const API_VERSION = "2023-08-01";

function pgHeaders() {
  return {
    "x-client-id": env.CASHFREE_APP_ID,
    "x-client-secret": env.CASHFREE_SECRET_KEY,
    "x-api-version": API_VERSION,
    "Content-Type": "application/json",
  };
}
function payoutHeaders() {
  return {
    "x-client-id": env.CASHFREE_PAYOUT_CLIENT_ID,
    "x-client-secret": env.CASHFREE_PAYOUT_CLIENT_SECRET,
    "x-api-version": API_VERSION,
    "Content-Type": "application/json",
  };
}

async function http(url: string, init: RequestInit) {
  const res = await fetch(url, init);
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const msg = data?.message || data?.error_description || `Cashfree request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

/* ----------------------------- masking helpers ---------------------------- */
export function last4(s: string): string {
  return (s || "").replace(/\s+/g, "").slice(-4);
}
export function maskPan(pan: string): string {
  const p = (pan || "").toUpperCase().trim();
  if (p.length < 4) return p;
  return `${p.slice(0, 2)}XXXX${p.slice(-2)}`;
}

/* --------------------------- MANAGED: Payouts ----------------------------- */
export interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  ifsc: string;
  pan: string;
}

/** Create / upsert a Cashfree Payouts beneficiary for a managed vendor. */
export async function createPayoutBeneficiary(
  vendorId: string,
  bank: BankDetails
): Promise<{ beneficiaryId: string; demo: boolean }> {
  const beneficiaryId = `presnag_${vendorId}`;
  if (!cashfreePayoutEnabled) {
    return { beneficiaryId, demo: true }; // simulated
  }
  await http(`${PAYOUT_BASE}/beneficiary`, {
    method: "POST",
    headers: payoutHeaders(),
    body: JSON.stringify({
      beneficiary_id: beneficiaryId,
      beneficiary_name: bank.accountHolderName,
      beneficiary_instrument_details: {
        bank_account_number: bank.accountNumber.replace(/\s+/g, ""),
        bank_ifsc: bank.ifsc.toUpperCase().trim(),
      },
    }),
  });
  return { beneficiaryId, demo: false };
}

/** Send a single payout transfer to a managed vendor's beneficiary. */
export async function createPayoutTransfer(args: {
  beneficiaryId: string;
  amount: number;
  transferId: string;
}): Promise<{ payoutId: string; status: string; demo: boolean }> {
  if (!cashfreePayoutEnabled) {
    return { payoutId: `demo_${args.transferId}`, status: "SUCCESS", demo: true };
  }
  const data = await http(`${PAYOUT_BASE}/transfers`, {
    method: "POST",
    headers: payoutHeaders(),
    body: JSON.stringify({
      transfer_id: args.transferId,
      transfer_amount: Number(args.amount.toFixed(2)),
      beneficiary_details: { beneficiary_id: args.beneficiaryId },
    }),
  });
  return { payoutId: data?.cf_transfer_id || args.transferId, status: data?.status || "RECEIVED", demo: false };
}

/* ------------------------ DIRECT: Easy Split vendor ----------------------- */
/** Create an Easy Split sub-merchant + return the hosted KYC onboarding link. */
export async function createEasySplitVendor(args: {
  vendorId: string;
  name: string;
  email: string;
  phone: string;
}): Promise<{ cashfreeVendorId: string; onboardingUrl: string; demo: boolean }> {
  const cashfreeVendorId = `presnag_${args.vendorId}`;
  if (!cashfreePgEnabled) {
    // Simulated hosted-onboarding URL for local dev.
    return {
      cashfreeVendorId,
      onboardingUrl: `${env.CLIENT_URL}/vendor/payments?demo_kyc=1`,
      demo: true,
    };
  }
  const data = await http(`${PG_BASE}/easy-split/vendors`, {
    method: "POST",
    headers: pgHeaders(),
    body: JSON.stringify({
      vendor_id: cashfreeVendorId,
      status: "ACTIVE",
      name: args.name,
      email: args.email,
      phone: args.phone,
      verify_account: true,
      dashboard_access: false,
    }),
  });
  // Hosted onboarding link (field name can vary by account/version).
  const onboardingUrl =
    data?.onboarding_link || data?.related_doc?.onboarding_link || `${env.CLIENT_URL}/vendor/payments`;
  return { cashfreeVendorId, onboardingUrl, demo: false };
}

/* ----------------------------- PG: create order --------------------------- */
export async function createPgOrder(args: {
  orderId: string;
  amount: number;
  customerName: string;
  customerPhone: string;
  returnUrl: string;
  /** For DIRECT mode: the Easy Split vendor id that should receive 100%. */
  splitVendorId?: string;
}): Promise<{ paymentSessionId: string; orderId: string; demo: boolean }> {
  if (!cashfreePgEnabled) {
    return { paymentSessionId: `demo_session_${args.orderId}`, orderId: args.orderId, demo: true };
  }
  const body: Record<string, unknown> = {
    order_id: args.orderId,
    order_amount: Number(args.amount.toFixed(2)),
    order_currency: "INR",
    customer_details: {
      customer_id: `cust_${Date.now()}`,
      customer_name: args.customerName,
      customer_phone: args.customerPhone,
    },
    order_meta: { return_url: args.returnUrl },
  };
  if (args.splitVendorId) {
    // DIRECT: 100% of the order routes to the vendor's Easy Split account.
    body.order_splits = [{ vendor_id: args.splitVendorId, percentage: 100 }];
  }
  const data = await http(`${PG_BASE}/orders`, {
    method: "POST",
    headers: pgHeaders(),
    body: JSON.stringify(body),
  });
  return { paymentSessionId: data?.payment_session_id, orderId: data?.order_id || args.orderId, demo: false };
}

/* ----------------------------- webhook verify ----------------------------- */
/** Verify a Cashfree webhook signature (PG). Returns true in demo mode. */
export function verifyWebhookSignature(rawBody: string, signature?: string, timestamp?: string): boolean {
  if (!env.CASHFREE_WEBHOOK_SECRET) return true; // demo / unset
  if (!signature || !timestamp) return false;
  const payload = timestamp + rawBody;
  const expected = crypto
    .createHmac("sha256", env.CASHFREE_WEBHOOK_SECRET)
    .update(payload)
    .digest("base64");
  return expected === signature;
}
