import { slugify } from "../../utils/helpers";

const u = (id: string, w = 600) =>
  `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

export const vendor = {
  name: "DIET HUB",
  ownerName: "Diet Hub Owner",
  email: "diethub@presnag.com",
  password: "vendor123", // The seed script will hash this
  slug: slugify("DIET HUB"),
  phone: "9123456341",
  fssaiLicense: "20825004003841",
  category: "Healthy Food",
  description: "Your daily dose of nutrition, salads, and healthy meals to keep you fit and energetic.",
  address: "NIT-3, Faridabad",
  logo: u("photo-1490645935967-10de6ba88061", 200), // Healthy bowl
  banner: u("photo-1498837167922-41c53b4f0f92", 1200), // Healthy spread
  status: "active",
  openingHours: "07:00 AM - 10:00 PM",
  openTime: "07:00",
  closeTime: "22:00",
  isOpen: true,
  rating: 4.7,
  prepTime: 15,
  socialLinks: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    website: "https://example.com",
  },
  subscriptionPlan: "growth",
  settlementMode: "MANAGED",
  eligibleForDirectMigration: true,
  cashfreeBeneficiaryId: `presnag_demo_${slugify("DIET HUB")}`,
  managedPayout: {
    accountHolderName: "DIET HUB",
    accountNumber: "987654323741",
    accountNumberLast4: "3741",
    ifsc: "HDFC0003741",
    pan: "ABCD1234I",
    panMasked: "••••1234I",
  },
};

export const coupons = [];
