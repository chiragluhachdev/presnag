import { slugify } from "../../utils/helpers";

const u = (id: string, w = 600) =>
  `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

export const vendor = {
  name: "Khadak Singh Da Dhaba",
  ownerName: "Khadak Singh",
  email: "khadaksingh@presnag.com",
  password: "vendor123", // The seed script will hash this
  slug: slugify("Khadak Singh Da Dhaba"),
  phone: "9876543211",
  fssaiLicense: "20825004003839",
  category: "North Indian",
  description: "Authentic North Indian Dhaba style food with a modern touch.",
  address: "Sector 37, Faridabad",
  logo: u("photo-1514326640560-7d063ef2aed5", 200), // Some food/spices logo placeholder
  banner: u("photo-1585937421612-70a008356fbe", 1200), // Indian food banner
  status: "active",
  openingHours: "11:00 AM - 11:00 PM",
  openTime: "11:00",
  closeTime: "23:00",
  isOpen: true,
  rating: 4.5,
  prepTime: 25,
  socialLinks: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    website: "https://example.com",
  },
  subscriptionPlan: "growth",
  settlementMode: "MANAGED",
  eligibleForDirectMigration: true,
  cashfreeBeneficiaryId: `presnag_demo_${slugify("Khadak Singh Da Dhaba")}`,
  managedPayout: {
    accountHolderName: "Khadak Singh Da Dhaba",
    accountNumber: "987654323739",
    accountNumberLast4: "3739",
    ifsc: "HDFC0003739",
    pan: "ABCD1234G",
    panMasked: "••••1234G",
  },
};

export const coupons = [];
