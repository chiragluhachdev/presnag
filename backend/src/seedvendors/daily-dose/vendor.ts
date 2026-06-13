import { slugify } from "../../utils/helpers";

const u = (id: string, w = 600) =>
  `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

export const vendor = {
  name: "DailyDose",
  ownerName: "DailyDose Owner",
  email: "dailydose@presnag.com",
  password: "vendor123", // The seed script will hash this
  slug: slugify("DailyDose"),
  phone: "9123456338",
  fssaiLicense: "20825004003838",
  category: "Café",
  description: "Your daily dose of fresh coffee, amazing snacks, and great vibes!",
  address: "Charmwood Village, Faridabad",
  logo: u("photo-1509042239860-f550ce710b93", 200), // coffee shop logo
  banner: u("photo-1497935586351-b67a49e012bf", 1200), // coffee shop banner
  status: "active",
  openingHours: "08:00 AM - 10:00 PM",
  openTime: "08:00",
  closeTime: "22:00",
  isOpen: true,
  rating: 4.8,
  prepTime: 15,
  socialLinks: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    website: "https://example.com",
  },
  subscriptionPlan: "growth",
  settlementMode: "MANAGED",
  eligibleForDirectMigration: true,
  cashfreeBeneficiaryId: `presnag_demo_${slugify("DailyDose")}`,
  managedPayout: {
    accountHolderName: "DailyDose",
    accountNumber: "987654323738",
    accountNumberLast4: "3738",
    ifsc: "HDFC0003738",
    pan: "ABCD1234F",
    panMasked: "••••1234F",
  },
};

export const coupons = [];
