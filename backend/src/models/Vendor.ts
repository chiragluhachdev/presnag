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
      enum: ["Tea Stall", "Café", "Bakery", "Juice Corner", "Fast Food", "Food Court", "North Indian", "Multi-Cuisine", "Healthy Food"],
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

    // ---- Settlement / payments ----
    // MANAGED  = PreSnag collects payments, pays the vendor out once daily (Cashfree Payouts).
    // DIRECT   = Cashfree Easy Split sends 100% straight to the vendor's bank per order.
    settlementMode: {
      type: String,
      enum: ["MANAGED", "DIRECT"],
      default: "MANAGED",
      index: true,
    },
    // Lets us show the "Switch to Direct Settlement" banner to managed vendors.
    eligibleForDirectMigration: { type: Boolean, default: true },
    // Display-only payout details (full bank/PAN live only inside Cashfree).
    managedPayout: {
      accountHolderName: { type: String, default: "" },
      accountNumberLast4: { type: String, default: "" },
      ifsc: { type: String, default: "" },
      panMasked: { type: String, default: "" },
    },
    // Cashfree Payouts beneficiary id (MANAGED mode).
    cashfreeBeneficiaryId: { type: String, default: "" },
    // Cashfree Easy Split sub-merchant id (DIRECT mode).
    cashfreeVendorId: { type: String, default: "" },
    // Mirrors Cashfree Easy Split onboarding/KYC status (DIRECT mode).
    kycStatus: {
      type: String,
      enum: ["not_started", "in_progress", "active", "rejected"],
      default: "not_started",
    },
    // Optional geo-coordinates for "Nearby" sorting on the homepage.
    lat: { type: Number },
    lng: { type: Number },
  },
  { timestamps: true }
);

export type VendorDoc = InferSchemaType<typeof vendorSchema>;
export const Vendor = model("Vendor", vendorSchema);
