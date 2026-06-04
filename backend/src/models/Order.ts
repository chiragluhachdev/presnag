import { Schema, model, InferSchemaType, Types } from "mongoose";

export const ORDER_STATUSES = [
  "received",
  "accepted",
  "preparing",
  "ready",
  "collected",
  "cancelled",
] as const;

const orderItemSchema = new Schema(
  {
    itemId: { type: Types.ObjectId, ref: "MenuItem" },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },
    instructions: { type: String, default: "" },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    vendorId: { type: Types.ObjectId, ref: "Vendor", required: true, index: true },
    orderNumber: { type: String, required: true, unique: true, index: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    note: { type: String, default: "" },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    couponCode: { type: String, default: "" },
    paymentMethod: { type: String, enum: ["COD", "RAZORPAY"], default: "COD" },
    paymentStatus: { type: String, enum: ["pending", "paid"], default: "pending" },
    status: { type: String, enum: ORDER_STATUSES, default: "received", index: true },
    pickupTime: { type: String, default: "" },
  },
  { timestamps: true }
);

export type OrderDoc = InferSchemaType<typeof orderSchema>;
export const Order = model("Order", orderSchema);
