import { Schema, model, InferSchemaType, Types } from "mongoose";

// A single selectable option within a customization group (e.g. "10 inch" +₹80).
const customOptionSchema = new Schema(
  { label: { type: String, required: true }, price: { type: Number, default: 0 } },
  { _id: false }
);

// A group of options shown in the customize modal (e.g. "Size", "Add-ons").
const customizationSchema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["single", "multi"], default: "single" }, // radio vs checkbox
    required: { type: Boolean, default: false },
    options: { type: [customOptionSchema], default: [] },
  },
  { _id: false }
);

const menuItemSchema = new Schema(
  {
    vendorId: { type: Types.ObjectId, ref: "Vendor", required: true, index: true },
    categoryId: { type: Types.ObjectId, ref: "MenuCategory", required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 }, // base price (per unit)
    image: { type: String, default: "" },
    isAvailable: { type: Boolean, default: true },
    // Optional add-on / size groups. An empty array means "no customization".
    customizations: { type: [customizationSchema], default: [] },
  },
  { timestamps: true }
);

export type MenuItemDoc = InferSchemaType<typeof menuItemSchema>;
export const MenuItem = model("MenuItem", menuItemSchema);
