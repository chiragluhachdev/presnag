import { slugify } from "../../utils/helpers";

const u = (id: string, w = 600) =>
  `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

export const vendor = {
  name: "Farmao Cafe",
  ownerName: "Farmao Owner",
  email: "farmao@presnag.com",
  password: "vendor123", // The seed script will hash this
  slug: slugify("Farmao Cafe"),
  phone: "9876543210",
  fssaiLicense: "100000000001",
  category: "Café",
  description: "Welcome to Farmao Cafe, the ultimate destination in Faridabad for a delightful culinary experience. Indulge in our exquisite selection of gourmet momos, artisan pizzas, rich pastas, and juicy burgers, perfectly paired with refreshing mocktails and thick shakes. Every dish is crafted with fresh ingredients and bold flavors to satisfy your cravings. Order now for a premium taste!",
  address: "Sector-17, Faridabad",
  logo: u("photo-1555396273-367ea4eb4db5", 200), // generic cafe logo/food
  banner: u("photo-1559925393-8be0ec4767c8", 1200), // cafe banner
  status: "active",
  openingHours: "10:00 - 23:00",
  openTime: "10:00",
  closeTime: "23:00",
  isOpen: true,
  rating: 4.5,
  prepTime: 15,
  lat: 28.4110,
  lng: 77.3200,
  subscriptionPlan: "starter",
  settlementMode: "MANAGED",
  eligibleForDirectMigration: true,
  cashfreeBeneficiaryId: `presnag_demo_${slugify("Farmao Cafe")}`,
  managedPayout: {
    accountHolderName: "Farmao Cafe",
    accountNumber: "123456789012",
    accountNumberLast4: "9012",
    ifsc: "HDFC0001234",
    pan: "ABCDE1234F",
    panMasked: "ABXXXX1F",
  },
};

export const coupons = [
  { code: "WELCOME10", type: "percent", value: 10, usageLimit: 0 }
];
