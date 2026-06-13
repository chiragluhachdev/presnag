import { slugify } from "../../utils/helpers";

const u = (id: string, w = 600) =>
  `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

export const vendor = {
  name: "Tadka Junction",
  ownerName: "Tadka Junction Owner",
  email: "tadkajunction@presnag.com",
  password: "vendor123", // The seed script will hash this
  slug: slugify("Tadka Junction"),
  phone: "9123456340",
  fssaiLicense: "20825004003840",
  category: "North Indian",
  description: "The ultimate stop for mouth-watering North Indian delicacies and tadka-infused dishes.",
  address: "NIT-3, Faridabad",
  logo: u("photo-1606491956689-2ea866880c84", 200), // Spices/Indian food logo
  banner: u("photo-1517248135467-4c7edcad34c4", 1200), // Restaurant
  status: "active",
  openingHours: "10:00 AM - 11:30 PM",
  openTime: "10:00",
  closeTime: "23:30",
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
  cashfreeBeneficiaryId: `presnag_demo_${slugify("Tadka Junction")}`,
  managedPayout: {
    accountHolderName: "Tadka Junction",
    accountNumber: "987654323740",
    accountNumberLast4: "3740",
    ifsc: "HDFC0003740",
    pan: "ABCD1234H",
    panMasked: "••••1234H",
  },
};

export const coupons = [];
