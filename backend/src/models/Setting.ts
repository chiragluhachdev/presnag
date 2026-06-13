import { Schema, model, InferSchemaType } from "mongoose";

// Platform-wide settings — stored as a single document (a singleton).
const settingSchema = new Schema(
  {
    // A fixed key so there is only ever one settings document.
    key: { type: String, default: "platform", unique: true },
    maintenanceMode: { type: Boolean, default: false },
    // When ON, customer checkout is paused — no payment orders are created and
    // the pay button is disabled. Vendors/admin are unaffected.
    paymentsDisabled: { type: Boolean, default: false },
    // Which payment gateway is active for customer checkout.
    paymentProvider: { type: String, enum: ["CASHFREE", "RAZORPAY"], default: "CASHFREE" },
    // Admin-controlled demo/notice banner.
    demoBanner: {
      enabled: { type: Boolean, default: false },
      message: {
        type: String,
        default: "Heads up — payments are live. Please explore the checkout flow only and don't place a real order.",
      },
      showOnHome: { type: Boolean, default: true },
      showOnCheckout: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export type SettingDoc = InferSchemaType<typeof settingSchema>;
export const Setting = model("Setting", settingSchema);

// Fetch the singleton settings doc, creating it on first access.
export async function getSettings() {
  let doc = await Setting.findOne({ key: "platform" });
  if (!doc) doc = await Setting.create({ key: "platform" });
  return doc;
}
