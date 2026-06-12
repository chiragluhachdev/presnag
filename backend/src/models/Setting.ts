import { Schema, model, InferSchemaType } from "mongoose";

// Platform-wide settings — stored as a single document (a singleton).
const settingSchema = new Schema(
  {
    // A fixed key so there is only ever one settings document.
    key: { type: String, default: "platform", unique: true },
    maintenanceMode: { type: Boolean, default: false },
    // Which payment gateway is active for customer checkout.
    paymentProvider: { type: String, enum: ["CASHFREE", "RAZORPAY"], default: "CASHFREE" },
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
