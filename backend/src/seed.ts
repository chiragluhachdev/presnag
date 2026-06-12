import mongoose from "mongoose";
import { connectDB } from "./config/db";
import { Vendor } from "./models/Vendor";
import { Admin } from "./models/Admin";
import { MenuCategory } from "./models/MenuCategory";
import { MenuItem } from "./models/MenuItem";
import { Order } from "./models/Order";
import { Coupon } from "./models/Coupon";
import { hashPassword } from "./utils/auth";
import { slugify } from "./utils/helpers";

// Helper: build an Unsplash image URL (all IDs below are verified to resolve).
const u = (id: string, w = 600) =>
  `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

const IMG = {
  // tea stall
  chai: "photo-1571934811356-5cc061b6821f",
  masalaChai: "photo-1561336313-0bd5e0b27ec8",
  gingerTea: "photo-1597318181409-cf64d0b5d8a2",
  blackCoffee: "photo-1517701550927-30cf4ba1dba5",
  samosa: "photo-1601050690597-df0568f70950",
  sandwich: "photo-1528735602780-2552fd46c7af",
  maggi: "photo-1612927601601-6638404737ce",
  teaBanner: "photo-1442512595331-e89e73853f31",
  // café
  latte: "photo-1509042239860-f550ce710b93",
  cappuccino: "photo-1572442388796-11668a67e53d",
  croissant: "photo-1555507036-ab1f4038808a",
  muffin: "photo-1607958996333-41aef7caefaa",
  oreoShake: "photo-1541658016709-82535e94bc69",
  mangoShake: "photo-1600271886742-f049cd451bba",
  cafeBanner: "photo-1559925393-8be0ec4767c8",
  // china hotpot
  hotpot: "photo-1563245372-f21724e3856d",
  hakkaNoodles: "photo-1585032226651-759b368d7246",
  friedRice: "photo-1603133872878-684f208fb84b",
  manchurian: "photo-1623341214825-9f4f963727da",
  momos: "photo-1496116218417-1a781b1c416c",
  springRolls: "photo-1544025162-d76694265947",
  hotSourSoup: "photo-1547592166-23ac45744acd",
  chinaPlatter: "photo-1569718212165-3a8278d5f624",
  chinaBanner: "photo-1552566626-52f8b828add9",
  // khalsa
  thali: "photo-1585937421612-70a008356fbe",
  dalMakhani: "photo-1546833999-b9f581a1996d",
  paneerTikka: "photo-1565557623262-b51c2513a641",
  khalsaBanner: "photo-1517248135467-4c7edcad34c4",
  // wonder bites
  burger: "photo-1568901346375-23c9450c58cd",
  pizza: "photo-1565299624946-b28f40a0ae38",
  fries: "photo-1576107232684-1279f3908594",
  wonderBanner: "photo-1550547660-d9450f859349",
  // farmao
  biryani: "photo-1563379091339-03b21ab4a4f8",
  tandoori: "photo-1610057099443-fde8c4d50f91",
  farmaoBanner: "photo-1514933651103-005eec06c04b",
  // diet hub
  salad: "photo-1512621776951-a57141f2eefd",
  grilledChicken: "photo-1598514982205-f36b96d1e8d4",
  smoothie: "photo-1505252585461-04db1eb84625",
  dietBanner: "photo-1490645935967-10de6ba17061",
  // dailydose (premium café)
  coldCoffee: "photo-1461023058943-07fcbe16d735",
  frappe: "photo-1572490122747-3968b75cc699",
  icedLatte: "photo-1517701550927-30cf4ba1dba5",
  dailydoseBanner: "photo-1521017432531-fbd92d768814",
};

interface SeedItem {
  name: string;
  description: string;
  price: number;
  image: string;
}
interface SeedCategory {
  name: string;
  image: string;
  items: SeedItem[];
}
interface SeedVendor {
  name: string;
  email: string;
  category: string;
  description: string;
  address: string;
  logo: string;
  banner: string;
  lat?: number;
  lng?: number;
  menu: SeedCategory[];
}

const vendorsData: SeedVendor[] = [
  {
    name: "Tadka Junction",
    email: "tadka@presnag.com",
    category: "Fast Food",
    description: "Hot snacks, street-food favourites and quick bites — freshly made all day.",
    address: "12 MG Road, Indore",
    logo: u(IMG.samosa, 200),
    banner: u(IMG.teaBanner, 1200),
    menu: [
      {
        name: "Snacks",
        image: u(IMG.samosa),
        items: [
          { name: "Samosa", description: "Crispy potato samosa with chutney", price: 15, image: u(IMG.samosa) },
          { name: "Grilled Veg Sandwich", description: "Veggies, cheese & mint chutney", price: 50, image: u(IMG.sandwich) },
          { name: "Masala Maggi", description: "Hot noodles tossed with spices", price: 40, image: u(IMG.maggi) },
        ],
      },
      {
        name: "Beverages",
        image: u(IMG.chai),
        items: [
          { name: "Masala Chai", description: "Slow-brewed spiced milk tea", price: 20, image: u(IMG.masalaChai) },
          { name: "Ginger Tea", description: "Fresh ginger & cardamom brew", price: 25, image: u(IMG.gingerTea) },
          { name: "Filter Coffee", description: "South-Indian style strong coffee", price: 30, image: u(IMG.blackCoffee) },
        ],
      },
    ],
  },
  {
    name: "Brew & Bean Café",
    email: "brew@presnag.com",
    category: "Café",
    description: "Artisan coffee, fresh bakes and thick shakes in a cosy corner café.",
    address: "5 Park Street, Indore",
    logo: u(IMG.latte, 200),
    banner: u(IMG.cafeBanner, 1200),
    menu: [
      {
        name: "Coffee",
        image: u(IMG.cappuccino),
        items: [
          { name: "Cappuccino", description: "Espresso with velvety milk foam", price: 120, image: u(IMG.cappuccino) },
          { name: "Caffè Latte", description: "Smooth espresso with steamed milk", price: 130, image: u(IMG.latte) },
          { name: "Cold Brew", description: "18-hour slow-steeped iced coffee", price: 150, image: u(IMG.blackCoffee) },
        ],
      },
      {
        name: "Bakes",
        image: u(IMG.croissant),
        items: [
          { name: "Butter Croissant", description: "Flaky, buttery & freshly baked", price: 110, image: u(IMG.croissant) },
          { name: "Chocolate Muffin", description: "Rich double-chocolate muffin", price: 90, image: u(IMG.muffin) },
        ],
      },
      {
        name: "Shakes",
        image: u(IMG.oreoShake),
        items: [
          { name: "Oreo Shake", description: "Creamy cookies & cream shake", price: 160, image: u(IMG.oreoShake) },
          { name: "Mango Shake", description: "Seasonal alphonso mango shake", price: 140, image: u(IMG.mangoShake) },
        ],
      },
    ],
  },
  {
    name: "China Hotpot",
    email: "chinahotpot@presnag.com",
    category: "Fast Food",
    description: "Sizzling hotpots, hakka noodles and Indo-Chinese starters made fresh.",
    address: "Sector-21 C, Faridabad",
    logo: u(IMG.chinaPlatter, 200),
    banner: u(IMG.chinaBanner, 1200),
    lat: 28.4089,
    lng: 77.3178,
    menu: [
      {
        name: "Hotpot",
        image: u(IMG.hotpot),
        items: [
          { name: "Spicy Veg Hotpot", description: "Veggies & noodles in fiery schezwan broth", price: 220, image: u(IMG.hotpot) },
          { name: "Manchow Hotpot", description: "Classic hotpot with crispy noodles", price: 240, image: u(IMG.hotSourSoup) },
        ],
      },
      {
        name: "Noodles & Rice",
        image: u(IMG.hakkaNoodles),
        items: [
          { name: "Veg Hakka Noodles", description: "Wok-tossed noodles with veggies", price: 130, image: u(IMG.hakkaNoodles) },
          { name: "Veg Fried Rice", description: "Stir-fried rice with garden veggies", price: 120, image: u(IMG.friedRice) },
        ],
      },
      {
        name: "Starters",
        image: u(IMG.manchurian),
        items: [
          { name: "Gobi Manchurian", description: "Crispy cauliflower in tangy sauce", price: 140, image: u(IMG.manchurian) },
          { name: "Veg Momos", description: "Steamed dumplings with spicy chutney", price: 90, image: u(IMG.momos) },
          { name: "Veg Spring Rolls", description: "Crunchy rolls stuffed with veggies", price: 110, image: u(IMG.springRolls) },
        ],
      },
    ],
  },
  {
    name: "Khalsa Food Junction",
    email: "khalsa@presnag.com",
    category: "North Indian",
    description: "Authentic Punjabi flavors, rich curries and tandoori specials.",
    address: "NIT-5, Faridabad",
    logo: u(IMG.thali, 200),
    banner: u(IMG.khalsaBanner, 1200),
    lat: 28.3840,
    lng: 77.3100,
    menu: [
      {
        name: "Main Course",
        image: u(IMG.dalMakhani),
        items: [
          { name: "Dal Makhani", description: "Creamy slow-cooked black lentils", price: 180, image: u(IMG.dalMakhani) },
          { name: "Paneer Tikka Masala", description: "Cottage cheese in rich tomato gravy", price: 240, image: u(IMG.paneerTikka) },
        ],
      },
      {
        name: "Breads & Thali",
        image: u(IMG.thali),
        items: [
          { name: "Special Punjabi Thali", description: "Assorted breads, 2 curries, dal, rice & sweet", price: 300, image: u(IMG.thali) },
          { name: "Butter Naan", description: "Soft bread from the tandoor", price: 40, image: u(IMG.samosa) },
        ],
      },
    ],
  },
  {
    name: "Wonder Bites",
    email: "wonderbites@presnag.com",
    category: "Fast Food",
    description: "Juicy burgers, loaded pizzas, and crispy fries for your cravings.",
    address: "Green Fields, Sector-43",
    logo: u(IMG.burger, 200),
    banner: u(IMG.wonderBanner, 1200),
    lat: 28.4350,
    lng: 77.3000,
    menu: [
      {
        name: "Burgers",
        image: u(IMG.burger),
        items: [
          { name: "Classic Veg Burger", description: "Crispy patty with fresh veggies & mayo", price: 90, image: u(IMG.burger) },
          { name: "Cheese Burst Burger", description: "Double cheese layered burger", price: 130, image: u(IMG.burger) },
        ],
      },
      {
        name: "Pizzas & Fries",
        image: u(IMG.pizza),
        items: [
          { name: "Farmhouse Pizza", description: "Loaded with fresh vegetables and mozzarella", price: 250, image: u(IMG.pizza) },
          { name: "Peri Peri Fries", description: "Crispy fries tossed in spicy peri peri", price: 110, image: u(IMG.fries) },
        ],
      },
    ],
  },
  {
    name: "Farmao",
    email: "farmao@presnag.com",
    category: "Multi-Cuisine",
    description: "Delicious multi-cuisine delicacies straight to your plate.",
    address: "Sector-17, Faridabad",
    logo: u(IMG.biryani, 200),
    banner: u(IMG.farmaoBanner, 1200),
    lat: 28.4110,
    lng: 77.3200,
    menu: [
      {
        name: "Pan-Asian Delights",
        image: u(IMG.hakkaNoodles),
        items: [
          { name: "Truffle Edamame Dumplings", description: "Hand-folded crystal dumplings infused with white truffle oil", price: 320, image: u(IMG.momos) },
          { name: "Kung Pao Lotus Stem", description: "Crispy lotus stem tossed in a savory, sweet, and spicy Sichuan sauce", price: 290, image: u(IMG.manchurian) },
          { name: "Wok-Tossed Soba Noodles", description: "Buckwheat noodles stir-fried with exotic Asian greens and sesame oil", price: 350, image: u(IMG.hakkaNoodles) },
        ],
      },
      {
        name: "Chef's Signature Premium",
        image: u(IMG.thali),
        items: [
          { name: "Saffron & Gold Leaf Biryani", description: "Our finest basmati rice with slow-cooked meat, edible gold leaf, and Iranian saffron", price: 850, image: u(IMG.biryani) },
          { name: "Smoked Dal Makhani Fondue", description: "24-hour slow-cooked black lentils served fondue-style with garlic naan bites", price: 420, image: u(IMG.dalMakhani) },
          { name: "Himalayan Trout Tikka", description: "Fresh river trout marinated in mustard oil and cooked in a traditional clay oven", price: 750, image: u(IMG.paneerTikka) },
        ],
      },
    ],
  },
  {
    name: "DIET HUB",
    email: "diethub@presnag.com",
    category: "Healthy Food",
    description: "Your daily dose of health with fresh salads, high-protein meals & juices.",
    address: "NIT-3, Faridabad",
    logo: u(IMG.salad, 200),
    banner: u(IMG.dietBanner, 1200),
    lat: 28.3900,
    lng: 77.3050,
    menu: [
      {
        name: "Gourmet Salads",
        image: u(IMG.salad),
        items: [
          { name: "Quinoa & Avocado Salad", description: "Organic quinoa, Hass avocado, cherry tomatoes, and microgreens with lemon vinaigrette", price: 280, image: u(IMG.salad) },
          { name: "Mediterranean Chickpea Bowl", description: "High-protein roasted chickpeas, feta, kalamata olives, and fresh parsley", price: 250, image: u(IMG.salad) },
        ],
      },
      {
        name: "Lean Protein Bowls",
        image: u(IMG.grilledChicken),
        items: [
          { name: "Herb-Crusted Grilled Chicken", description: "Sous-vide chicken breast with a crust of fresh herbs, served with steamed asparagus", price: 320, image: u(IMG.grilledChicken) },
          { name: "Teriyaki Tofu Steak", description: "Pan-seared silken tofu glazed in house-made teriyaki sauce with broccoli florets", price: 290, image: u(IMG.grilledChicken) },
        ],
      },
      {
        name: "Cold-Pressed & Smoothies",
        image: u(IMG.smoothie),
        items: [
          { name: "Acai Berry Blast", description: "Antioxidant-rich acai, wild berries, and chia seeds blended with almond milk", price: 220, image: u(IMG.smoothie) },
          { name: "Matcha Wellness Blend", description: "Ceremonial grade matcha, spinach, green apple, and agave nectar", price: 200, image: u(IMG.smoothie) },
        ],
      },
    ],
  },
  {
    name: "DailyDose",
    email: "dailydose@presnag.com",
    category: "Café",
    description: "A mid-range premium café — signature cold coffees, loaded fries and wok-tossed Indo-Chinese, all freshly made.",
    address: "Sector-15 Market, Faridabad",
    logo: u(IMG.coldCoffee, 200),
    banner: u(IMG.dailydoseBanner, 1200),
    lat: 28.4011,
    lng: 77.3120,
    menu: [
      {
        name: "Cold Coffees & Shakes",
        image: u(IMG.coldCoffee),
        items: [
          { name: "Classic Cold Coffee", description: "Chilled brewed coffee blended with milk & ice cream", price: 120, image: u(IMG.coldCoffee) },
          { name: "Hazelnut Frappe", description: "Iced hazelnut frappe topped with whipped cream", price: 160, image: u(IMG.frappe) },
          { name: "Caramel Iced Latte", description: "Double espresso over ice with caramel & cold milk", price: 150, image: u(IMG.icedLatte) },
          { name: "Oreo Cold Coffee", description: "Cookies & cream blended cold coffee", price: 170, image: u(IMG.oreoShake) },
        ],
      },
      {
        name: "Fries & Snacks",
        image: u(IMG.fries),
        items: [
          { name: "Peri Peri Fries", description: "Crispy fries tossed in spicy peri-peri seasoning", price: 110, image: u(IMG.fries) },
          { name: "Loaded Cheese Fries", description: "Fries loaded with melted cheese & herbs", price: 150, image: u(IMG.fries) },
          { name: "Grilled Veg Sandwich", description: "Toasted sandwich with veggies, cheese & mint chutney", price: 130, image: u(IMG.sandwich) },
        ],
      },
      {
        name: "Indo-Chinese",
        image: u(IMG.hakkaNoodles),
        items: [
          { name: "Veg Hakka Noodles", description: "Wok-tossed noodles with crunchy veggies", price: 150, image: u(IMG.hakkaNoodles) },
          { name: "Veg Fried Rice", description: "Stir-fried rice with garden vegetables", price: 140, image: u(IMG.friedRice) },
          { name: "Chilli Potato", description: "Crispy potato tossed in tangy schezwan sauce", price: 160, image: u(IMG.manchurian) },
          { name: "Veg Manchurian", description: "Fried veg dumplings in spicy Manchurian gravy", price: 170, image: u(IMG.manchurian) },
          { name: "Veg Spring Rolls", description: "Crunchy rolls stuffed with stir-fried veggies", price: 120, image: u(IMG.springRolls) },
          { name: "Veg Momos", description: "Steamed dumplings served with spicy chutney", price: 100, image: u(IMG.momos) },
        ],
      },
    ],
  },
];

async function seed() {
  await connectDB();
  console.log("[seed] clearing collections...");
  await Promise.all([
    Vendor.deleteMany({}),
    Admin.deleteMany({}),
    MenuCategory.deleteMany({}),
    MenuItem.deleteMany({}),
    Order.deleteMany({}),
    Coupon.deleteMany({}),
  ]);

  // ---- Admin ----
  await Admin.create({
    name: "Super Admin",
    email: "admin@presnag.com",
    passwordHash: await hashPassword("admin123"),
    role: "SUPER_ADMIN",
  });

  // ---- Vendors ----
  const BASE_LAT = 22.7196;
  const BASE_LNG = 75.8577;
  const createdVendors = [];

  for (const [i, v] of vendorsData.entries()) {
    const vendor = await Vendor.create({
      name: v.name,
      ownerName: v.name.split(" ")[0] + " Owner",
      email: v.email,
      passwordHash: await hashPassword("vendor123"),
      slug: slugify(v.name),
      phone: `90000000${String(i).padStart(2, "0")}`,
      fssaiLicense: `1000000000${String(i).padStart(2, "0")}`,
      category: v.category,
      description: v.description,
      address: v.address,
      logo: v.logo,
      banner: v.banner,
      status: "active",
      isOpen: true,
      prepTime: 10 + Math.floor(Math.random() * 10),
      lat: v.lat ?? BASE_LAT + (Math.random() - 0.5) * 0.06,
      lng: v.lng ?? BASE_LNG + (Math.random() - 0.5) * 0.06,
      // Demo vendors launch in PreSnag-Managed settlement with a (simulated) payout setup.
      settlementMode: "MANAGED",
      cashfreeBeneficiaryId: `presnag_demo_${slugify(v.name)}`,
      managedPayout: {
        accountHolderName: v.name,
        accountNumber: `9876543210${String(i).padStart(2, "0")}`,
        accountNumberLast4: "1234",
        ifsc: "HDFC0001234",
        pan: "ABCDE1234F",
        panMasked: "ABXXXX1F",
      },
    });
    createdVendors.push(vendor);
 
    let sort = 0;
    for (const cat of v.menu) {
      const category = await MenuCategory.create({
        vendorId: vendor.id,
        name: cat.name,
        image: cat.image,
        sortOrder: sort++,
      });
      for (const it of cat.items) {
        await MenuItem.create({
          vendorId: vendor.id,
          categoryId: category.id,
          name: it.name,
          description: it.description,
          price: it.price,
          image: it.image,
          isAvailable: true,
        });
      }
    }

    await Coupon.create({
      vendorId: vendor.id,
      code: "WELCOME10",
      type: "percent",
      value: 10,
      usageLimit: 0,
    });
  }

  // No sample orders — start with a clean order history.

  console.log("\n[seed] done ✅  (8 shops, 0 orders)");
  console.log("--------------------------------------------------");
  console.log("Admin login:   admin@presnag.com / admin123");
  console.log("Vendor logins: tadka@presnag.com / vendor123");
  console.log("               brew@presnag.com / vendor123");
  console.log("               chinahotpot@presnag.com / vendor123");
  console.log("               khalsa@presnag.com / vendor123");
  console.log("               wonderbites@presnag.com / vendor123");
  console.log("               farmao@presnag.com / vendor123");
  console.log("               diethub@presnag.com / vendor123");
  console.log("               dailydose@presnag.com / vendor123");
  console.log("Sample coupon: WELCOME10 (10% off)");
  console.log("--------------------------------------------------");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
