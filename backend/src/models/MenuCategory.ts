import { Schema, model, InferSchemaType, Types } from "mongoose";

const menuCategorySchema = new Schema(
  {
    vendorId: { type: Types.ObjectId, ref: "Vendor", required: true, index: true },
    name: { type: String, required: true },
    image: { type: String, default: "" },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export type MenuCategoryDoc = InferSchemaType<typeof menuCategorySchema>;
export const MenuCategory = model("MenuCategory", menuCategorySchema);
