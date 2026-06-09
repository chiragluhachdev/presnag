import mongoose from "mongoose";
import { connectDB } from "./config/db";
import { Vendor } from "./models/Vendor";
import { Admin } from "./models/Admin";
import { MenuCategory } from "./models/MenuCategory";
import { MenuItem } from "./models/MenuItem";
import { Order } from "./models/Order";
import { Coupon } from "./models/Coupon";
import { hashPassword } from "./utils/auth";
import { slugify, genOrderNumber } from "./utils/helpers";

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

  for (const v of vendorsData) {
    const vendor = await Vendor.create({
      name: v.name,
      email: v.email,
      passwordHash: await hashPassword("vendor123"),
      slug: slugify(v.name),
      phone: "9876543210",
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
        accountNumberLast4: "1234",
        ifsc: "HDFC0001234",
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

  // ---- A few sample orders for the first vendor (dashboard demo) ----
  const firstVendor = createdVendors[0];
  const someItems = await MenuItem.find({ vendorId: firstVendor.id }).limit(2);
  const customers = ["Aman", "Priya", "Ravi", "Sneha"];
  const statuses = ["received", "preparing", "ready", "collected"];
  for (let i = 0; i < 4; i++) {
    const items = someItems.map((it) => ({
      itemId: it.id,
      name: it.name,
      price: it.price,
      qty: 1 + (i % 2),
      instructions: "",
    }));
    const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
    const tax = Math.round(subtotal * 0.05);
    await Order.create({
      vendorId: firstVendor.id,
      orderNumber: genOrderNumber(),
      customerName: customers[i],
      customerPhone: "98765000" + i,
      items,
      subtotal,
      tax,
      total: subtotal + tax,
      paymentMethod: i % 2 === 0 ? "COD" : "RAZORPAY",
      paymentStatus: i < 1 ? "paid" : "pending",
      status: statuses[i],
      pickupTime: `${firstVendor.prepTime} min`,
    });
  }

  console.log("\n[seed] done ✅  (3 shops)");
  console.log("--------------------------------------------------");
  console.log("Admin login:   admin@presnag.com / admin123");
  console.log("Vendor logins: tadka@presnag.com / vendor123");
  console.log("               brew@presnag.com / vendor123");
  console.log("               chinahotpot@presnag.com / vendor123");
  console.log("Sample coupon: WELCOME10 (10% off)");
  console.log("--------------------------------------------------");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
