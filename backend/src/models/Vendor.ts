import { Schema, model, InferSchemaType } from "mongoose";

const vendorSchema = new Schema(
  {
    name: { type: String, required: true }, // shop name
    ownerName: { type: String, default: "" },
    slug: { type: String, required: true, unique: true, index: true },
    // Email is optional; phone is the primary (required, unique) login id.
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    description: { type: String, default: "" },
    address: { type: String, default: "" },
    logo: { type: String, default: "" },
    banner: { type: String, default: "" },
    fssaiLicense: { type: String, default: "" },
    category: {
      type: String,
      enum: ["Tea Stall", "Café", "Bakery", "Juice Corner", "Fast Food", "Food Court", "North Indian", "Multi-Cuisine", "Healthy Food"],
      default: "Fast Food",
    },
    openingHours: { type: String, default: "9:00 AM - 9:00 PM" },
    openTime: { type: String, default: "09:00" },
    closeTime: { type: String, default: "21:00" },
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
    // Payout bank details. Full account/PAN are stored so the admin can make
    // manual settlements; masked copies are used for vendor-facing display.
    // NEVER expose this object on public endpoints.
    managedPayout: {
      accountHolderName: { type: String, default: "" },
      accountNumber: { type: String, default: "" },        // full (admin only)
      accountNumberLast4: { type: String, default: "" },   // masked (vendor display)
      ifsc: { type: String, default: "" },
      pan: { type: String, default: "" },                  // full (admin only)
      panMasked: { type: String, default: "" },            // masked (vendor display)
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

// Email is unique only when present (optional field).
vendorSchema.index({ email: 1 }, { unique: true, sparse: true });

export type VendorDoc = InferSchemaType<typeof vendorSchema>;
export const Vendor = model("Vendor", vendorSchema);
