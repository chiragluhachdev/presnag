import { Schema, model, InferSchemaType, Types } from "mongoose";

const subscriptionSchema = new Schema(
  {
    vendorId: { type: Types.ObjectId, ref: "Vendor", required: true, index: true },
    plan: { type: String, enum: ["starter", "growth", "enterprise"], default: "starter" },
    amount: { type: Number, default: 0 },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    status: { type: String, enum: ["active", "expired", "cancelled"], default: "active" },
  },
  { timestamps: true }
);

export type SubscriptionDoc = InferSchemaType<typeof subscriptionSchema>;
export const Subscription = model("Subscription", subscriptionSchema);
