/**
 * Targeted menu seeder for ONE existing vendor (does NOT touch any other data).
 * Usage:  npm run seed:menu            (uses the default FARMAO id below)
 *         npm run seed:menu <vendorId> (override)
 *
 * It REPLACES that vendor's categories + items with the menu defined here.
 */
import mongoose from "mongoose";
import { connectDB } from "./config/db";
import { Vendor } from "./models/Vendor";
import { MenuCategory } from "./models/MenuCategory";
import { MenuItem } from "./models/MenuItem";

const VENDOR_ID = process.argv[2] || "6a2c43634b948eb6ffa4c961";

const u = (id: string, w = 600) =>
  `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

const IMG = {
  momos: "photo-1496116218417-1a781b1c416c",
  pizza: "photo-1565299624946-b28f40a0ae38",
  pasta: "photo-1473093295043-cdd812d0e601",
  garlicBread: "photo-1573140247632-f8fd74997d5c",
  burger: "photo-1568901346375-23c9450c58cd",
  fries: "photo-1576107232684-1279f3908594",
  chilli: "photo-1623341214825-9f4f963727da",
  springRoll: "photo-1544025162-d76694265947",
  coldCoffee: "photo-1461023058943-07fcbe16d735",
  shake: "photo-1541658016709-82535e94bc69",
  mocktail: "photo-1551538827-9c037cb4f32a",
  hotChoc: "photo-1542990253-0d0f5be5f0ed",
  nuggets: "photo-1562967914-608f82629710",
  dip: "photo-1576186726115-4d51596775d1",
};

type Opt = { label: string; price?: number };
type Custom = { name: string; type?: "single" | "multi"; required?: boolean; options: Opt[] };
type Item = { name: string; price: number; image: string; description?: string; customizations?: Custom[] };
type Cat = { name: string; image: string; items: Item[] };

// ---- reusable customization blocks ----
const PIZZA_SIZE: Custom = {
  name: "Size", type: "single", required: true,
  options: [{ label: '8" Regular', price: 0 }, { label: '10" Large', price: 100 }],
};
const PIZZA_ADDONS: Custom = {
  name: "Add-ons", type: "multi", required: false,
  options: [{ label: "Extra Cheese", price: 49 }, { label: "Jalapeños", price: 30 }, { label: "Extra Veggies", price: 40 }],
};
const BURGER_ADDONS: Custom = {
  name: "Add-ons", type: "multi", required: false,
  options: [{ label: "Extra Cheese Slice", price: 30 }, { label: "Extra Patty", price: 60 }],
};
const SHAKE_ADDONS: Custom = {
  name: "Add-ons", type: "multi", required: false,
  options: [{ label: "Extra Scoop Ice Cream", price: 40 }, { label: "Whipped Cream", price: 30 }],
};
const DIP_CHOICE: Custom = {
  name: "Choose a dip", type: "multi", required: false,
  options: [{ label: "Cheesy Dip", price: 20 }, { label: "Tandoori Dip", price: 20 }, { label: "Chipotle Dip", price: 20 }, { label: "Salsa Dip", price: 20 }],
};

const MENU: Cat[] = [
  {
    name: "Momos", image: u(IMG.momos),
    items: [
      { name: "Steamed Veg Momos (4 pcs)", price: 69, image: u(IMG.momos), description: "Soft steamed dumplings with spicy chutney" },
      { name: "Steamed Veg Momos (8 pcs)", price: 129, image: u(IMG.momos), description: "Soft steamed dumplings with spicy chutney" },
      { name: "Paneer Steamed Momos (4 pcs)", price: 75, image: u(IMG.momos), description: "Steamed momos stuffed with spiced paneer" },
      { name: "Paneer Steamed Momos (8 pcs)", price: 149, image: u(IMG.momos), description: "Steamed momos stuffed with spiced paneer" },
      { name: "Fried Crunchy Veg Momos (8 pcs)", price: 139, image: u(IMG.momos), description: "Golden-fried crunchy veg momos" },
      { name: "Fried Crunchy Paneer Momos (4 pcs)", price: 80, image: u(IMG.momos), description: "Golden-fried crunchy paneer momos" },
      { name: "Fried Crunchy Paneer Momos (8 pcs)", price: 159, image: u(IMG.momos), description: "Golden-fried crunchy paneer momos" },
    ],
  },
  {
    name: "Pizza", image: u(IMG.pizza),
    items: [
      { name: "Margherita Pizza", price: 199, image: u(IMG.pizza), description: "Classic cheese & tomato", customizations: [PIZZA_SIZE, PIZZA_ADDONS] },
      { name: "Golden Fresh Supreme Pizza", price: 249, image: u(IMG.pizza), description: "Loaded veggies & cheese", customizations: [PIZZA_SIZE, PIZZA_ADDONS] },
      { name: "Corn & Capsicum Carnival Pizza", price: 249, image: u(IMG.pizza), description: "Sweet corn & crisp capsicum", customizations: [PIZZA_SIZE, PIZZA_ADDONS] },
      { name: "Paneer Overload Delight Pizza", price: 299, image: u(IMG.pizza), description: "Double paneer, double cheese", customizations: [PIZZA_SIZE, PIZZA_ADDONS] },
      { name: "Farmao Special Pizza", price: 299, image: u(IMG.pizza), description: "Chef's signature loaded pizza", customizations: [PIZZA_SIZE, PIZZA_ADDONS] },
    ],
  },
  {
    name: "Pasta & Continental", image: u(IMG.pasta),
    items: [
      { name: "Red Arrabiata Pasta", price: 249, image: u(IMG.pasta), description: "Spicy tomato-garlic pasta", customizations: [{ name: "Add-ons", type: "multi", options: [{ label: "Garlic Bread", price: 60 }, { label: "Extra Cheese", price: 40 }] }] },
      { name: "Creamy White Cloud Pasta", price: 299, image: u(IMG.pasta), description: "Rich white sauce pasta", customizations: [{ name: "Add-ons", type: "multi", options: [{ label: "Garlic Bread", price: 60 }, { label: "Extra Cheese", price: 40 }] }] },
      { name: "Pink Fusion Pasta", price: 299, image: u(IMG.pasta), description: "Creamy tomato fusion pasta", customizations: [{ name: "Add-ons", type: "multi", options: [{ label: "Garlic Bread", price: 60 }, { label: "Extra Cheese", price: 40 }] }] },
    ],
  },
  {
    name: "Garlic Breads", image: u(IMG.garlicBread),
    items: [
      { name: "Farmao Classic Garlic Bread", price: 199, image: u(IMG.garlicBread), description: "Buttery garlic bread", customizations: [{ name: "Add-ons", type: "multi", options: [{ label: "Extra Cheese", price: 40 }] }] },
      { name: "Corn & Cheese Garlic Bread", price: 199, image: u(IMG.garlicBread), description: "Corn & molten cheese", customizations: [{ name: "Add-ons", type: "multi", options: [{ label: "Extra Cheese", price: 40 }] }] },
      { name: "Tandoori Paneer Stuffed Garlic Bread", price: 249, image: u(IMG.garlicBread), description: "Stuffed with tandoori paneer" },
    ],
  },
  {
    name: "Burgers", image: u(IMG.burger),
    items: [
      { name: "Cheese Burst Veggie Burger", price: 149, image: u(IMG.burger), description: "Veg patty with molten cheese", customizations: [BURGER_ADDONS] },
      { name: "Masala Crunch Burger", price: 139, image: u(IMG.burger), description: "Crunchy masala patty", customizations: [BURGER_ADDONS] },
      { name: "Tandoori Paneer King Burger", price: 199, image: u(IMG.burger), description: "Tandoori paneer patty", customizations: [BURGER_ADDONS] },
      { name: "Double Decker Veg Classic Burger", price: 199, image: u(IMG.burger), description: "Double patty classic", customizations: [BURGER_ADDONS] },
    ],
  },
  {
    name: "Fries", image: u(IMG.fries),
    items: [
      { name: "Classic Golden Salted Fries", price: 129, image: u(IMG.fries), description: "Crispy salted fries", customizations: [DIP_CHOICE] },
      { name: "Peri Peri Thunder Fries", price: 159, image: u(IMG.fries), description: "Spicy peri-peri fries", customizations: [DIP_CHOICE] },
      { name: "Cheese Loaded Fries", price: 199, image: u(IMG.fries), description: "Fries loaded with cheese" },
      { name: "Peri Peri with Cheese Fries", price: 199, image: u(IMG.fries), description: "Peri-peri fries with cheese" },
    ],
  },
  {
    name: "Chinese Mainland", image: u(IMG.chilli),
    items: [
      { name: "Garlic Chilli Potato", price: 199, image: u(IMG.chilli), description: "Crispy potato in garlic chilli sauce" },
      { name: "Honey Chilli Potato", price: 249, image: u(IMG.chilli), description: "Sweet & spicy honey chilli potato" },
      { name: "Smoky Tossed Chilli Mushrooms", price: 299, image: u(IMG.chilli), description: "Smoky wok-tossed mushrooms" },
      { name: "Schezwan Tossed Chilli Paneer", price: 299, image: u(IMG.chilli), description: "Paneer in fiery schezwan sauce" },
    ],
  },
  {
    name: "Spring Rolls", image: u(IMG.springRoll),
    items: [
      { name: "Farmao Classic Veg Spring Rolls", price: 149, image: u(IMG.springRoll), description: "Crunchy veg spring rolls" },
    ],
  },
  {
    name: "Cold Coffee & Shakes", image: u(IMG.coldCoffee),
    items: [
      { name: "Classic Cold Coffee", price: 199, image: u(IMG.coldCoffee), description: "Chilled blended cold coffee", customizations: [SHAKE_ADDONS] },
      { name: "Vanilla Dream Shake", price: 199, image: u(IMG.shake), description: "Creamy vanilla shake", customizations: [SHAKE_ADDONS] },
      { name: "Nutella Magic Shake", price: 249, image: u(IMG.shake), description: "Rich Nutella shake", customizations: [SHAKE_ADDONS] },
      { name: "KitKat Blast Shake", price: 249, image: u(IMG.shake), description: "KitKat crunch shake", customizations: [SHAKE_ADDONS] },
      { name: "Oreo Crush Shake", price: 249, image: u(IMG.shake), description: "Cookies & cream shake", customizations: [SHAKE_ADDONS] },
    ],
  },
  {
    name: "Mocktails", image: u(IMG.mocktail),
    items: [
      { name: "Virgin Mojito Sparkle", price: 149, image: u(IMG.mocktail), description: "Minty lime sparkler" },
      { name: "Blue Lagoon Wave Mocktail", price: 149, image: u(IMG.mocktail), description: "Blue curaçao cooler" },
      { name: "Mango Mint Refresher", price: 149, image: u(IMG.mocktail), description: "Mango & mint cooler" },
      { name: "Green Apple Fizz Mocktail", price: 149, image: u(IMG.mocktail), description: "Green apple fizz" },
      { name: "Kiwi Cooler Pop Mocktail", price: 149, image: u(IMG.mocktail), description: "Tangy kiwi cooler" },
      { name: "Orange Sunrise Twist Mocktail", price: 149, image: u(IMG.mocktail), description: "Citrus sunrise twist" },
    ],
  },
  {
    name: "Hot Beverages", image: u(IMG.hotChoc),
    items: [
      { name: "Farmao Special Hot Chocolate", price: 149, image: u(IMG.hotChoc), description: "Rich molten hot chocolate" },
    ],
  },
  {
    name: "Chef's Picks", image: u(IMG.pizza),
    items: [
      { name: "Creamy White Cloud Pasta (Chef's Pick)", price: 299, image: u(IMG.pasta), description: "Signature white sauce pasta" },
      { name: "Farmao Special Pizza (Chef's Pick)", price: 299, image: u(IMG.pizza), description: "Chef's signature pizza", customizations: [PIZZA_SIZE, PIZZA_ADDONS] },
      { name: "Masala Crunch Burger (Chef's Pick)", price: 139, image: u(IMG.burger), description: "Crunchy masala burger", customizations: [BURGER_ADDONS] },
      { name: "Corn & Cheese Garlic Bread (Chef's Pick)", price: 199, image: u(IMG.garlicBread), description: "Corn & cheese garlic bread" },
      { name: "Oreo Crush Shake (Chef's Pick)", price: 249, image: u(IMG.shake), description: "Cookies & cream shake", customizations: [SHAKE_ADDONS] },
    ],
  },
  {
    name: "Extras",
    image: u(IMG.dip),
    items: [
      { name: "Cheesy Dip", price: 20, image: u(IMG.dip), description: "Creamy cheese dip" },
      { name: "Tandoori Dip", price: 20, image: u(IMG.dip), description: "Smoky tandoori dip" },
      { name: "Chipotle Dip", price: 20, image: u(IMG.dip), description: "Spicy chipotle dip" },
      { name: "Salsa Dip", price: 20, image: u(IMG.dip), description: "Tangy salsa dip" },
    ],
  },
  {
    name: "Non-Veg", image: u(IMG.nuggets),
    items: [
      {
        name: "Chicken Nuggets", price: 249, image: u(IMG.nuggets), description: "Crispy chicken nuggets",
        customizations: [
          { name: "Portion", type: "single", required: true, options: [{ label: "6 pcs", price: 0 }, { label: "10 pcs", price: 120 }] },
          DIP_CHOICE,
        ],
      },
    ],
  },
];

async function run() {
  await connectDB();
  const vendor = await Vendor.findById(VENDOR_ID);
  if (!vendor) {
    console.error(`[seed:menu] ❌ Vendor ${VENDOR_ID} not found. Nothing changed.`);
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(`[seed:menu] target: ${vendor.name} (${VENDOR_ID})`);
  // Replace mode — clear this vendor's existing menu only.
  await MenuItem.deleteMany({ vendorId: vendor.id });
  await MenuCategory.deleteMany({ vendorId: vendor.id });

  let sort = 0;
  let itemCount = 0;
  for (const cat of MENU) {
    const category = await MenuCategory.create({
      vendorId: vendor.id, name: cat.name, image: cat.image, sortOrder: sort++,
    });
    for (const it of cat.items) {
      await MenuItem.create({
        vendorId: vendor.id,
        categoryId: category.id,
        name: it.name,
        description: it.description || "",
        price: it.price,
        image: it.image,
        isAvailable: true,
        customizations: it.customizations || [],
      });
      itemCount++;
    }
  }

  console.log(`[seed:menu] ✅ Seeded ${MENU.length} categories, ${itemCount} items for ${vendor.name}.`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((e) => { console.error("[seed:menu] failed:", e); process.exit(1); });
