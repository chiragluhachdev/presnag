import { Router } from "express";
import { asyncH, HttpError } from "../middleware/error";
import { Order } from "../models/Order";
import { Vendor } from "../models/Vendor";
import { getSettings } from "../models/Setting";
import { env, cashfreePgEnabled, razorpayEnabled } from "../config/env";
import { createPgOrder, getPgOrderStatus, verifyWebhookSignature } from "../services/cashfree";
import {
  createRazorpayOrder, verifyRazorpaySignature, getRazorpayOrderPaid, verifyRazorpayWebhook,
} from "../services/razorpay";
import { emitNewOrder, emitOrderStatus } from "../realtime/io";

const router = Router();

// Mark an order paid + notify the vendor (idempotent).
async function confirmPaid(order: any) {
  if (order.paymentStatus === "paid") return;
  order.paymentStatus = "paid";
  await order.save();
  emitNewOrder(String(order.vendorId), order);
  emitOrderStatus(String(order.vendorId), order.orderNumber, order);
}

/**
 * Unified: create a payment order with whichever gateway the admin has enabled
 * (Cashfree or Razorpay). Returns a provider-tagged response the frontend uses
 * to open the right checkout.
 */
router.post(
  "/order",
  asyncH(async (req, res) => {
    const { orderNumber } = req.body;
    if (!orderNumber) throw new HttpError(400, "orderNumber is required");
    const order = await Order.findOne({ orderNumber });
    if (!order) throw new HttpError(404, "Order not found");
    const vendor = await Vendor.findById(order.vendorId);
    if (!vendor) throw new HttpError(404, "Vendor not found");

    const settings = await getSettings();
    const provider = settings.paymentProvider === "RAZORPAY" ? "RAZORPAY" : "CASHFREE";

    // Both gateways collect into the PreSnag platform account (MANAGED). Cashfree
    // DIRECT (Easy Split) only applies when the vendor migrated + is verified.
    const direct =
      provider === "CASHFREE" && vendor.settlementMode === "DIRECT" && vendor.kycStatus === "active";
    order.settlementMode = direct ? "DIRECT" : "MANAGED";
    order.settlementStatus = direct ? "not_applicable" : "pending";

    if (provider === "RAZORPAY") {
      const r = await createRazorpayOrder({ amount: order.total, receipt: order.orderNumber });
      order.paymentMethod = "RAZORPAY";
      order.gatewayOrderId = r.razorpayOrderId;
      await order.save();
      return res.json({
        provider: "RAZORPAY",
        razorpayOrderId: r.razorpayOrderId,
        amount: r.amount,
        currency: r.currency,
        keyId: r.keyId,
        demo: r.demo,
        settlementMode: order.settlementMode,
      });
    }

    const cf = await createPgOrder({
      orderId: order.orderNumber,
      amount: order.total,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      returnUrl: `${env.CLIENT_URL}/order/${order.orderNumber}`,
      splitVendorId: direct ? vendor.cashfreeVendorId : undefined,
    });
    order.paymentMethod = "CASHFREE";
    order.gatewayOrderId = order.orderNumber;
    await order.save();
    res.json({ provider: "CASHFREE", paymentSessionId: cf.paymentSessionId, demo: cf.demo, settlementMode: order.settlementMode });
  })
);

/**
 * Unified payment verification (works for both gateways). For Razorpay, pass the
 * handler's signature; for Cashfree, status is fetched from the gateway.
 */
router.post(
  "/verify",
  asyncH(async (req, res) => {
    const { orderNumber, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;
    const order = await Order.findOne({ orderNumber });
    if (!order) throw new HttpError(404, "Order not found");
    if (order.paymentStatus === "paid") return res.json({ paid: true });

    let paid = false;
    if (order.paymentMethod === "RAZORPAY") {
      if (razorpayPaymentId && razorpayOrderId && razorpaySignature) {
        paid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
      }
      if (!paid && order.gatewayOrderId) {
        paid = (await getRazorpayOrderPaid(order.gatewayOrderId)).paid;
      }
    } else {
      paid = (await getPgOrderStatus(order.orderNumber)).paid;
    }

    if (paid) await confirmPaid(order);
    res.json({ paid });
  })
);

/**
 * Create a Cashfree payment order for an existing PreSnag order.
 * - DIRECT vendor  → order carries a 100% split to the vendor's Easy Split id.
 * - MANAGED vendor → no split (funds land with PreSnag, settled in the daily payout).
 */
router.post(
  "/cashfree/order",
  asyncH(async (req, res) => {
    const { orderNumber } = req.body;
    if (!orderNumber) throw new HttpError(400, "orderNumber is required");

    const order = await Order.findOne({ orderNumber });
    if (!order) throw new HttpError(404, "Order not found");
    const vendor = await Vendor.findById(order.vendorId);
    if (!vendor) throw new HttpError(404, "Vendor not found");

    const direct = vendor.settlementMode === "DIRECT" && vendor.kycStatus === "active";

    const { paymentSessionId, orderId, demo } = await createPgOrder({
      orderId: order.orderNumber,
      amount: order.total,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      returnUrl: `${env.CLIENT_URL}/order/${order.orderNumber}`,
      splitVendorId: direct ? vendor.cashfreeVendorId : undefined,
    });

    // Snapshot how this order settles.
    order.settlementMode = direct ? "DIRECT" : "MANAGED";
    order.settlementStatus = direct ? "not_applicable" : "pending";
    await order.save();

    res.json({ paymentSessionId, orderId, demo, settlementMode: order.settlementMode });
  })
);

/**
 * Verify an order's payment status directly with Cashfree (used when the
 * customer returns from checkout). Works on localhost without a public webhook.
 * Marks the order paid + alerts the vendor if Cashfree reports it as PAID.
 */
router.post(
  "/cashfree/verify",
  asyncH(async (req, res) => {
    const { orderNumber } = req.body;
    const order = await Order.findOne({ orderNumber });
    if (!order) throw new HttpError(404, "Order not found");

    if (order.paymentStatus === "paid") {
      return res.json({ paid: true });
    }

    const { paid, status } = await getPgOrderStatus(order.orderNumber);
    if (paid) {
      order.paymentStatus = "paid";
      await order.save();
      emitNewOrder(String(order.vendorId), order);
      emitOrderStatus(String(order.vendorId), order.orderNumber, order);
    }
    res.json({ paid, status });
  })
);

/**
 * Demo-only: simulate a successful payment when Cashfree is not configured.
 * Marks the order paid and notifies the vendor — mirrors what the real webhook
 * does in production.
 */
router.post(
  "/cashfree/demo-confirm",
  asyncH(async (req, res) => {
    // SECURITY: only usable in demo mode (Cashfree not configured). When real
    // keys are set, payment is confirmed solely via Cashfree (verify/webhook),
    // so this endpoint can never be used to fake a payment in production.
    if (cashfreePgEnabled || razorpayEnabled) throw new HttpError(403, "Not available");
    const { orderNumber } = req.body;
    const order = await Order.findOne({ orderNumber });
    if (!order) throw new HttpError(404, "Order not found");
    if (order.paymentStatus !== "paid") {
      order.paymentStatus = "paid";
      await order.save();
      emitNewOrder(String(order.vendorId), order);
    }
    res.json({ ok: true });
  })
);

/**
 * Cashfree webhook — handles payment success and Easy Split vendor onboarding
 * status. Signature is verified when CASHFREE_WEBHOOK_SECRET is set.
 */
router.post(
  "/cashfree/webhook",
  asyncH(async (req, res) => {
    const raw = (req as any).rawBody || JSON.stringify(req.body);
    const signature = req.header("x-webhook-signature");
    const timestamp = req.header("x-webhook-timestamp");
    if (!verifyWebhookSignature(raw, signature, timestamp)) {
      throw new HttpError(401, "Invalid webhook signature");
    }

    const body = req.body || {};
    const type: string = body.type || body.event || "";
    const data = body.data || {};

    // --- Payment success → mark the order paid + alert the vendor ---
    const orderId = data?.order?.order_id || data?.order_id;
    if (type.includes("PAYMENT_SUCCESS") || data?.payment?.payment_status === "SUCCESS") {
      if (orderId) {
        const order = await Order.findOne({ orderNumber: orderId });
        if (order && order.paymentStatus !== "paid") {
          order.paymentStatus = "paid";
          await order.save();
          emitNewOrder(String(order.vendorId), order);
          emitOrderStatus(String(order.vendorId), order.orderNumber, order);
        }
      }
    }

    // --- Easy Split vendor onboarding status → flip KYC + settlement mode ---
    const cfVendorId = data?.vendor?.vendor_id || data?.vendor_id;
    const vendorStatus: string = data?.vendor?.status || data?.status || "";
    if (cfVendorId && (type.toUpperCase().includes("VENDOR") || vendorStatus)) {
      const vendor = await Vendor.findOne({ cashfreeVendorId: cfVendorId });
      if (vendor) {
        const s = vendorStatus.toUpperCase();
        if (s === "ACTIVE") {
          vendor.kycStatus = "active";
          vendor.settlementMode = "DIRECT"; // migration completes automatically
        } else if (s === "REJECTED" || s === "BLOCKED") {
          vendor.kycStatus = "rejected";
        } else {
          vendor.kycStatus = "in_progress";
        }
        await vendor.save();
      }
    }

    res.json({ ok: true });
  })
);

/** Razorpay webhook — confirms payment if the customer closes the tab mid-flow. */
router.post(
  "/razorpay/webhook",
  asyncH(async (req, res) => {
    const raw = (req as any).rawBody || JSON.stringify(req.body);
    const sig = req.header("x-razorpay-signature");
    if (!verifyRazorpayWebhook(raw, sig || undefined)) {
      throw new HttpError(401, "Invalid webhook signature");
    }
    const event: string = req.body?.event || "";
    if (event === "payment.captured" || event === "order.paid") {
      const payment = req.body?.payload?.payment?.entity;
      const ord = req.body?.payload?.order?.entity;
      const rzpOrderId = payment?.order_id || ord?.id;
      if (rzpOrderId) {
        const order = await Order.findOne({ gatewayOrderId: rzpOrderId });
        if (order) await confirmPaid(order);
      }
    }
    res.json({ ok: true });
  })
);

export default router;
