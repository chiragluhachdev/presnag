import { Schema, model, InferSchemaType, Types } from "mongoose";

const couponSchema = new Schema(
  {
    vendorId: { type: Types.ObjectId, ref: "Vendor", required: true, index: true },
    code: { type: String, required: true, uppercase: true },
    type: { type: String, enum: ["percent", "fixed"], required: true },
    value: { type: Number, required: true, min: 0 },
    expiry: { type: Date },
    usageLimit: { type: Number, default: 0 }, // 0 = unlimited
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

couponSchema.index({ vendorId: 1, code: 1 }, { unique: true });

export type CouponDoc = InferSchemaType<typeof couponSchema>;
export const Coupon = model("Coupon", couponSchema);
