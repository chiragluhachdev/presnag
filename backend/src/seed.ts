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

const u = (id: string, w = 600) =>
  `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

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

  // ---- Vendor: Farmao Cafe ----
  const vendor = await Vendor.create({
    name: "Farmao Cafe",
    ownerName: "Farmao Owner",
    email: "farmao@presnag.com",
    passwordHash: await hashPassword("vendor123"),
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
  });

  const menuData = [
    {
      name: "🥟 Momos",
      image: u("photo-1496116218417-1a781b1c416c"),
      items: [
        {
          name: "Steamed Veg Momos",
          description: "Classic steamed dumplings stuffed with fresh veggies.",
          price: 69,
          isVeg: true,
          image: u("photo-1496116218417-1a781b1c416c"),
          customizations: [
            {
              name: "Size",
              type: "single",
              required: true,
              options: [
                { label: "4 pcs", price: 0 },
                { label: "8 pcs", price: 60 },
              ],
            },
          ],
        },
        {
          name: "Paneer Steamed Momos",
          description: "Steamed momos filled with soft paneer and spices.",
          price: 75,
          isVeg: true,
          image: u("photo-1534422298391-e4f8c172dddb"),
          customizations: [
            {
              name: "Size",
              type: "single",
              required: true,
              options: [
                { label: "4 pcs", price: 0 },
                { label: "8 pcs", price: 74 },
              ],
            },
          ],
        },
        {
          name: "Fried Crunchy Veg Momos (8 pcs)",
          description: "Crispy fried veggie momos served with spicy dip.",
          price: 139,
          isVeg: true,
          image: u("photo-1623341214825-9f4f963727da"),
          customizations: [],
        },
        {
          name: "Fried Crunchy Paneer Momos",
          description: "Golden fried crunchy paneer momos.",
          price: 80,
          isVeg: true,
          image: u("photo-1544025162-d76694265947"),
          customizations: [
            {
              name: "Size",
              type: "single",
              required: true,
              options: [
                { label: "4 pcs", price: 0 },
                { label: "8 pcs", price: 79 },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "🍕 Pizza (8\" & 10\")",
      image: u("photo-1565299624946-b28f40a0ae38"),
      items: [
        { name: "Margherita Pizza", description: "Classic cheese and tomato base pizza.", price: 199, isVeg: true, image: u("photo-1574071318508-1cdbab80d002") },
        { name: "Golden Fresh Supreme Pizza", description: "Loaded with golden corn and fresh veggies.", price: 249, isVeg: true, image: u("photo-1513104890138-7c749659a591") },
        { name: "Corn & Capsicum Carnival Pizza", description: "Sweet corn and crunchy capsicum.", price: 249, isVeg: true, image: u("photo-1590947132387-155cc02f3212") },
        { name: "Paneer Overload Delight Pizza", description: "A treat for paneer lovers with overloaded toppings.", price: 299, isVeg: true, image: u("photo-1604382354936-07c5d9983bd3") },
        { name: "Farmao Special Pizza", description: "Our chef's signature loaded special pizza.", price: 299, isVeg: true, image: u("photo-1565299624946-b28f40a0ae38") },
      ],
    },
    {
      name: "🍝 Pasta & Continental",
      image: u("photo-1473093295043-cdd812d0e601"),
      items: [
        { name: "Red Arrabiata Pasta", description: "Tangy and spicy red tomato sauce pasta.", price: 249, isVeg: true, image: u("photo-1621996346565-e3dbc646d9a9") },
        { name: "Creamy White Cloud Pasta", description: "Rich and creamy white sauce pasta.", price: 299, isVeg: true, image: u("photo-1645112411341-6c4fd023714a") },
        { name: "Pink Fusion Pasta", description: "The perfect blend of red and white sauces.", price: 299, isVeg: true, image: u("photo-1563379926898-05f4575a45d8") },
      ],
    },
    {
      name: "🥖 Garlic Breads",
      image: u("photo-1573140247632-f8fd74997d5c"),
      items: [
        { name: "Farmao Classic Garlic Bread", description: "Freshly baked garlic bread with herbs.", price: 199, isVeg: true, image: u("photo-1573140247632-f8fd74997d5c") },
        { name: "Corn & Cheese Garlic Bread", description: "Garlic bread topped with sweet corn and melted cheese.", price: 199, isVeg: true, image: u("photo-1619535860434-ba1d8fa12536") },
        { name: "Tandoori Paneer Stuffed Garlic Bread", description: "Stuffed with spicy tandoori paneer.", price: 249, isVeg: true, image: u("photo-1587245937293-b0510ee4c2bf") },
      ],
    },
    {
      name: "🍔 Burgers",
      image: u("photo-1568901346375-23c9450c58cd"),
      items: [
        { name: "Cheese Burst Veggie Burger", description: "Veggie patty overflowing with melted cheese.", price: 149, isVeg: true, image: u("photo-1586190848861-99aa4a171e90") },
        { name: "Masala Crunch Burger", description: "Spicy and crunchy masala patty burger.", price: 139, isVeg: true, image: u("photo-1550547660-d9450f859349") },
        { name: "Tandoori Paneer King Burger", description: "King-sized burger with a large tandoori paneer slab.", price: 199, isVeg: true, image: u("photo-1603064752734-4c48eff53d05") },
        { name: "Double Decker Veg Classic Burger", description: "Two patties, double the fun.", price: 199, isVeg: true, image: u("photo-1568901346375-23c9450c58cd") },
      ],
    },
    {
      name: "🍟 Fries",
      image: u("photo-1576107232684-1279f3908594"),
      items: [
        { name: "Classic Golden Salted Fries", description: "Crispy salted french fries.", price: 129, isVeg: true, image: u("photo-1576107232684-1279f3908594") },
        { name: "Peri Peri Thunder Fries", description: "Fries tossed in spicy peri peri seasoning.", price: 159, isVeg: true, image: u("photo-1534080564583-6be75777b70a") },
        { name: "Cheese Loaded Fries", description: "Fries smothered in liquid cheese.", price: 199, isVeg: true, image: u("photo-1541592106381-b31e9677c0e5") },
        { name: "Peri Peri with Cheese Fries", description: "The perfect combo of spicy peri peri and creamy cheese.", price: 199, isVeg: true, image: u("photo-1518013431117-eb1462faa477") },
      ],
    },
    {
      name: "🥔 Chinese Mainland",
      image: u("photo-1585032226651-759b368d7246"),
      items: [
        { name: "Garlic Chilli Potato", description: "Crispy potatoes tossed in garlic chilli sauce.", price: 199, isVeg: true, image: u("photo-1585032226651-759b368d7246") },
        { name: "Honey Chilli Potato", description: "Sweet and spicy honey glazed crispy potatoes.", price: 249, isVeg: true, image: u("photo-1534422298391-e4f8c172dddb") },
        { name: "Smoky Tossed Chilli Mushrooms", description: "Mushrooms wok-tossed with smoky flavors.", price: 299, isVeg: true, image: u("photo-1504674900247-0877df9cc836") },
        { name: "Schezwan Tossed Chilli Paneer", description: "Spicy paneer chunks in schezwan sauce.", price: 299, isVeg: true, image: u("photo-1598514982205-f36b96d1e8d4") },
      ],
    },
    {
      name: "🌯 Spring Rolls",
      image: u("photo-1544025162-d76694265947"),
      items: [
        { name: "Farmao Classic Veg Spring Rolls", description: "Crispy rolls stuffed with fresh veggies.", price: 149, isVeg: true, image: u("photo-1544025162-d76694265947") },
      ],
    },
    {
      name: "☕ Cold Coffee & Shakes",
      image: u("photo-1461023058943-07fcbe16d735"),
      items: [
        { name: "Classic Cold Coffee", description: "Refreshing classic cold brewed coffee.", price: 199, isVeg: true, image: u("photo-1461023058943-07fcbe16d735") },
        { name: "Vanilla Dream Shake", description: "Creamy vanilla milkshake.", price: 199, isVeg: true, image: u("photo-1572490122747-3968b75cc699") },
        { name: "Nutella Magic Shake", description: "Thick shake blended with real Nutella.", price: 249, isVeg: true, image: u("photo-1541658016709-82535e94bc69") },
        { name: "KitKat Blast Shake", description: "Crunchy KitKat pieces in a chocolate shake.", price: 249, isVeg: true, image: u("photo-1556881286-fc6915169721") },
        { name: "Oreo Crush Shake", description: "Classic Oreo cookie shake.", price: 249, isVeg: true, image: u("photo-1572490122747-3968b75cc699") },
      ],
    },
    {
      name: "🍹 Mocktails",
      image: u("photo-1514362545857-3bc16c4c7d1b"),
      items: [
        { name: "Virgin Mojito Sparkle", description: "Classic mint and lime refreshing drink.", price: 149, isVeg: true, image: u("photo-1514362545857-3bc16c4c7d1b") },
        { name: "Blue Lagoon Wave Mocktail", description: "Tropical blue curacao cooler.", price: 149, isVeg: true, image: u("photo-1556881286-fc6915169721") },
        { name: "Mango Mint Refresher", description: "Sweet mango with a hint of fresh mint.", price: 149, isVeg: true, image: u("photo-1600271886742-f049cd451bba") },
        { name: "Green Apple Fizz Mocktail", description: "Crisp and bubbly green apple drink.", price: 149, isVeg: true, image: u("photo-1514362545857-3bc16c4c7d1b") },
        { name: "Kiwi Cooler Pop Mocktail", description: "Tangy and sweet kiwi cooler.", price: 149, isVeg: true, image: u("photo-1556881286-fc6915169721") },
        { name: "Orange Sunrise Twist Mocktail", description: "Citrusy orange mocktail to start your day.", price: 149, isVeg: true, image: u("photo-1514362545857-3bc16c4c7d1b") },
      ],
    },
    {
      name: "☕ Hot Beverages",
      image: u("photo-1542990253-0d0f5be5f0ed"),
      items: [
        { name: "Farmao Special Hot Chocolate", description: "Rich, creamy, and decadent hot chocolate.", price: 149, isVeg: true, image: u("photo-1542990253-0d0f5be5f0ed") },
      ],
    },
    {
      name: "⭐ Chef's Picks",
      image: u("photo-1565299624946-b28f40a0ae38"),
      items: [
        { name: "Creamy White Cloud Pasta", description: "Rich and creamy white sauce pasta.", price: 299, isVeg: true, image: u("photo-1645112411341-6c4fd023714a") },
        { name: "Farmao Special Pizza", description: "Our chef's signature loaded special pizza.", price: 299, isVeg: true, image: u("photo-1565299624946-b28f40a0ae38") },
        { name: "Masala Crunch Burger", description: "Spicy and crunchy masala patty burger.", price: 139, isVeg: true, image: u("photo-1550547660-d9450f859349") },
        { name: "Corn & Cheese Garlic Bread", description: "Garlic bread topped with sweet corn and melted cheese.", price: 199, isVeg: true, image: u("photo-1619535860434-ba1d8fa12536") },
        { name: "Oreo Crush Shake", description: "Classic Oreo cookie shake.", price: 249, isVeg: true, image: u("photo-1572490122747-3968b75cc699") },
      ],
    },
    {
      name: "🥣 Extras",
      image: u("photo-1585011175654-c3619b0222f2"),
      items: [
        { name: "Cheesy Dip", description: "Extra side of cheesy dip.", price: 20, isVeg: true, image: u("photo-1585011175654-c3619b0222f2") },
        { name: "Tandoori Dip", description: "Spicy tandoori flavored dip.", price: 20, isVeg: true, image: u("photo-1585011175654-c3619b0222f2") },
        { name: "Chipotle Dip", description: "Smoky chipotle mayo dip.", price: 20, isVeg: true, image: u("photo-1585011175654-c3619b0222f2") },
        { name: "Salsa Dip", description: "Tangy tomato salsa dip.", price: 20, isVeg: true, image: u("photo-1585011175654-c3619b0222f2") },
      ],
    },
    {
      name: "🍗 Non-Veg",
      image: u("photo-1562967914-608f82629710"),
      items: [
        { name: "Chicken Nuggets", description: "Crispy bite-sized chicken nuggets.", price: 249, isVeg: false, image: u("photo-1562967914-608f82629710") },
      ],
    },
  ];

  let sort = 0;
  for (const cat of menuData) {
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
        isVeg: it.isVeg,
        isAvailable: true,
        customizations: (it as any).customizations || [],
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

  console.log("\n[seed] done ✅  (1 shop, 0 orders)");
  console.log("--------------------------------------------------");
  console.log("Admin login:   admin@presnag.com / admin123");
  console.log("Vendor logins: farmao@presnag.com / vendor123");
  console.log("Sample coupon: WELCOME10 (10% off)");
  console.log("--------------------------------------------------");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
