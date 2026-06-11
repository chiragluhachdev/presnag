import cron from "node-cron";
import { Vendor } from "../models/Vendor";
import { Order } from "../models/Order";
import { createPayoutTransfer } from "../services/cashfree";
import { cashfreePayoutEnabled } from "../config/env";

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

export interface PayoutResult {
  vendorId: string;
  vendorName: string;
  amount: number;
  orders: number;
  status: "settled" | "failed" | "skipped";
  payoutId?: string;
  error?: string;
}

/**
 * Settle every MANAGED vendor's paid-but-unsettled orders with ONE payout each.
 * Idempotent per vendor per day (transfer id = payout_<vendorId>_<YYYYMMDD>).
 */
export async function runManagedSettlement(): Promise<PayoutResult[]> {
  const vendors = await Vendor.find({
    settlementMode: "MANAGED",
    cashfreeBeneficiaryId: { $nin: ["", null] },
  });

  const results: PayoutResult[] = [];
  const key = todayKey();

  for (const vendor of vendors) {
    const pending = await Order.find({
      vendorId: vendor.id,
      settlementMode: "MANAGED",
      paymentStatus: "paid",
      settlementStatus: "pending",
    });
    if (pending.length === 0) continue;

    const amount = pending.reduce((s, o) => s + o.total, 0);
    const transferId = `payout_${vendor.id}_${key}`;
    const orderIds = pending.map((o) => o._id);

    // Mark as processing so a retry/parallel run won't double-pay.
    await Order.updateMany({ _id: { $in: orderIds } }, { settlementStatus: "processing" });

    try {
      const { payoutId } = await createPayoutTransfer({
        beneficiaryId: vendor.cashfreeBeneficiaryId,
        amount,
        transferId,
      });
      await Order.updateMany(
        { _id: { $in: orderIds } },
        { settlementStatus: "settled", payoutId, settledAt: new Date() }
      );
      results.push({
        vendorId: vendor.id, vendorName: vendor.name, amount, orders: pending.length,
        status: "settled", payoutId,
      });
    } catch (err: any) {
      await Order.updateMany({ _id: { $in: orderIds } }, { settlementStatus: "failed" });
      results.push({
        vendorId: vendor.id, vendorName: vendor.name, amount, orders: pending.length,
        status: "failed", error: err?.message || "payout failed",
      });
    }
  }
  return results;
}

/** Schedule the once-daily AUTOMATED settlement (~10 PM server time).
 *  Only runs when Cashfree Payouts is configured. Otherwise settlement is
 *  manual (admin marks each vendor paid), so we must NOT auto-settle. */
export function scheduleDailyPayout() {
  if (!cashfreePayoutEnabled) {
    console.log("[payout] manual settlement mode — auto payout disabled (no Payouts keys)");
    return;
  }
  // minute hour day month weekday  →  22:00 every day
  cron.schedule("0 22 * * *", async () => {
    try {
      const results = await runManagedSettlement();
      const settled = results.filter((r) => r.status === "settled");
      console.log(`[payout] daily settlement: ${settled.length} vendor(s), ₹${settled.reduce((s, r) => s + r.amount, 0)}`);
    } catch (err) {
      console.error("[payout] daily settlement failed", err);
    }
  });
  console.log("[payout] automated daily settlement scheduled for 22:00");
}
