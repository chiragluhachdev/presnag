import { slugify } from "../../utils/helpers";

const u = (id: string, w = 600) =>
  `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

export const vendor = {
  name: "ADDA 37",
  ownerName: "Adda Owner",
  email: "adda37@presnag.com",
  password: "vendor123", // The seed script will hash this
  slug: slugify("ADDA 37"),
  phone: "9123456337",
  fssaiLicense: "20825004003837",
  category: "Café",
  description: "Your ultimate hangout spot! ADDA 37 serves up the best pizzas, burgers, pasta, and premium shakes in town.",
  address: "Sector-37, Faridabad",
  logo: u("photo-1555939594-58d7cb561ad1", 200), // generic food/cafe logo
  banner: u("photo-1554118811-1e0d58224f24", 1200), // cafe/fast food banner
  status: "active",
  openingHours: "11:00 AM - 11:00 PM",
  openTime: "11:00",
  closeTime: "23:00",
  isOpen: true,
  rating: 4.6,
  prepTime: 20,
  socialLinks: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    website: "https://example.com",
  },
  subscriptionPlan: "growth",
  settlementMode: "MANAGED",
  eligibleForDirectMigration: true,
  cashfreeBeneficiaryId: `presnag_demo_${slugify("ADDA 37")}`,
  managedPayout: {
    accountHolderName: "ADDA 37",
    accountNumber: "987654323737",
    accountNumberLast4: "3737",
    ifsc: "HDFC0003737",
    pan: "ABCD1234E",
    panMasked: "••••1234E",
  },
};

export const coupons = [];
