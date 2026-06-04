import { Schema, model, InferSchemaType } from "mongoose";

const vendorSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, default: "" },
    description: { type: String, default: "" },
    address: { type: String, default: "" },
    logo: { type: String, default: "" },
    banner: { type: String, default: "" },
    category: {
      type: String,
      enum: ["Tea Stall", "Café", "Bakery", "Juice Corner", "Fast Food", "Food Court"],
      default: "Fast Food",
    },
    openingHours: { type: String, default: "9:00 AM - 9:00 PM" },
    isOpen: { type: Boolean, default: true },
    rating: { type: Number, default: 4.5 },
    prepTime: { type: Number, default: 15 }, // minutes
    socialLinks: {
      instagram: { type: String, default: "" },
      facebook: { type: String, default: "" },
      website: { type: String, default: "" },
    },
    status: {
      type: String,
      enum: ["pending", "active", "suspended", "inactive"],
      default: "pending",
      index: true,
    },
    subscriptionPlan: {
      type: String,
      enum: ["starter", "growth", "enterprise"],
      default: "starter",
    },
    // Optional geo-coordinates for "Nearby" sorting on the homepage.
    lat: { type: Number },
    lng: { type: Number },
  },
  { timestamps: true }
);

export type VendorDoc = InferSchemaType<typeof vendorSchema>;
export const Vendor = model("Vendor", vendorSchema);
