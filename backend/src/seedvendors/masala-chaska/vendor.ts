import { slugify } from "../../utils/helpers";

const u = (id: string, w = 600) =>
  `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

export const vendor = {
  name: "Masala Chaska",
  ownerName: "Masala Owner",
  email: "masala@presnag.com",
  password: "vendor123", // The seed script will hash this
  slug: slugify("Masala Chaska"),
  phone: "9123456000",
  fssaiLicense: "300000000003",
  category: "North Indian",
  description: "Experience the authentic, fiery flavors of India! Masala Chaska brings you traditional curries, sizzling tandoori starters, and rich, aromatic biryanis. A true treat for spice lovers.",
  address: "Sector-15, Faridabad",
  logo: u("photo-1617692855027-33b14f061079", 200), // Spicy/Indian food logo
  banner: u("photo-1585937421612-70a008356fbe", 1200), // Indian feast banner
  status: "active",
  openingHours: "12:00 - 23:30",
  openTime: "12:00",
  closeTime: "23:30",
  isOpen: true,
  rating: 4.6,
  prepTime: 25,
  lat: 28.4020,
  lng: 77.3110,
  subscriptionPlan: "starter",
  settlementMode: "MANAGED",
  eligibleForDirectMigration: true,
  cashfreeBeneficiaryId: `presnag_demo_${slugify("Masala Chaska")}`,
  managedPayout: {
    accountHolderName: "Masala Chaska",
    accountNumber: "987654321011",
    accountNumberLast4: "1011",
    ifsc: "HDFC0004321",
    pan: "MASALA999Q",
    panMasked: "MASAXXX9Q",
  },
};

export const coupons = [];
