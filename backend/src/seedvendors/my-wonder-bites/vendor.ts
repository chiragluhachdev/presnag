import { slugify } from "../../utils/helpers";

const u = (id: string, w = 600) =>
  `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

export const vendor = {
  name: "My Wonder Bites",
  ownerName: "My Wonder Bites Owner",
  email: "mywonder@presnag.com",
  password: "vendor123", // The seed script will hash this
  slug: slugify("My Wonder Bites"),
  phone: "9123456799",
  fssaiLicense: "20825004003802",
  category: "Healthy Food",
  description: "Welcome to My Wonder Bites, Natural | Healthier | Tastier! Enjoy our fresh salads, jumbo sandwiches, and nutritious smoothies.",
  address: "Sector-18, Faridabad",
  logo: u("photo-1550547660-d9450f859349", 200), // Tasty burger logo
  banner: u("photo-1504674900247-0877df9cc836", 1200), // Awesome food spread banner
  status: "active",
  openingHours: "11:00 - 22:00",
  openTime: "11:00",
  closeTime: "22:00",
  isOpen: true,
  rating: 4.8,
  prepTime: 20,
  lat: 28.4120,
  lng: 77.3210,
  subscriptionPlan: "starter",
  settlementMode: "MANAGED",
  eligibleForDirectMigration: true,
  cashfreeBeneficiaryId: `presnag_demo_${slugify("My Wonder Bites")}`,
  managedPayout: {
    accountHolderName: "My Wonder Bites",
    accountNumber: "987654321098",
    accountNumberLast4: "1098",
    ifsc: "ICIC0001234",
    pan: "VWXYZ9876Q",
    panMasked: "VWXXXX6Q",
  },
};

export const coupons = [];
