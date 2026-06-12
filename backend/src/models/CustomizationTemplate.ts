import { Schema, model, InferSchemaType, Types } from "mongoose";

// A single selectable option within a customization group
const customOptionSchema = new Schema(
  {
    id: { type: String, default: () => new Types.ObjectId().toString() },
    label: { type: String, required: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    priceType: { type: String, enum: ["fixed", "free"], default: "fixed" },
    price: { type: Number, default: 0, min: 0 },
    isAvailable: { type: Boolean, default: true },
    isDefault: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
    inStock: { type: Boolean, default: true },
    isHidden: { type: Boolean, default: false },
    availableHours: { type: [{ start: String, end: String }], default: [] },
    availableDays: { type: [Number], default: [] }, // 0=Sun, 1=Mon...
  },
  { _id: false }
);

// A group of options shown in the customize modal
const customizationSchema = new Schema(
  {
    id: { type: String, default: () => new Types.ObjectId().toString() },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    type: { type: String, enum: ["single", "multi"], default: "single" }, // single=radio, multi=checkbox
    required: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
    minSelections: { type: Number, default: 0 },
    maxSelections: { type: Number },
    dependency: {
      groupId: { type: String },
      optionId: { type: String },
    },
    options: { type: [customOptionSchema], default: [] },
  },
  { _id: false }
);

const templateSchema = new Schema(
  {
    vendorId: { type: Types.ObjectId, ref: "Vendor", required: true, index: true },
    name: { type: String, required: true },
    customizations: { type: [customizationSchema], default: [] },
  },
  { timestamps: true }
);

export type CustomizationTemplateDoc = InferSchemaType<typeof templateSchema>;
export const CustomizationTemplate = model("CustomizationTemplate", templateSchema);
