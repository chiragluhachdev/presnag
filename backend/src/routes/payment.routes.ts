import { Router } from "express";
import { asyncH } from "../middleware/error";
import { env } from "../config/env";

const router = Router();

/**
 * PLACEHOLDER Razorpay order creation.
 * In MVP this does NOT create a real Razorpay order or charge anything.
 * It returns a stub so the frontend "Pay Online" button has something to call.
 * Replace with the real Razorpay SDK flow before going live.
 */
router.post(
  "/razorpay/order",
  asyncH(async (req, res) => {
    const { amount } = req.body;
    res.json({
      placeholder: true,
      keyId: env.RAZORPAY_KEY_ID,
      orderId: `order_stub_${Date.now()}`,
      amount: Math.round(Number(amount) * 100), // paise
      currency: "INR",
      message:
        "Razorpay is a placeholder in this MVP. No payment is processed. Use Cash On Pickup for a working order.",
    });
  })
);

export default router;
