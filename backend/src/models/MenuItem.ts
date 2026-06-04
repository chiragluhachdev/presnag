import { Schema, model, InferSchemaType, Types } from "mongoose";

const menuItemSchema = new Schema(
  {
    vendorId: { type: Types.ObjectId, ref: "Vendor", required: true, index: true },
    categoryId: { type: Types.ObjectId, ref: "MenuCategory", required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: "" },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type MenuItemDoc = InferSchemaType<typeof menuItemSchema>;
export const MenuItem = model("MenuItem", menuItemSchema);
