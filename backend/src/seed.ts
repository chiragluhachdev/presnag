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
  fries: "photo-1573080496219-bb080dd4f877",
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
  // category-specific food images (Farmao + Diet Hub menus)
  imgWrap: "photo-1626700051175-6818013e1d4f",
  imgGarlicBread: "photo-1573140247632-f8fd74997d5c",
  imgPasta: "photo-1621996346565-e3dbc646d9a9",
  imgColdCoffee: "photo-1461023058943-07fcbe16d735",
  imgMilkshake: "photo-1572490122747-3968b75cc699",
  imgMocktail: "photo-1551024709-8f23befc6f87",
  imgNachos: "photo-1582169296194-e4d644c48063",
  imgSoda: "photo-1554866585-cd94860890b7",
  imgBrownie: "photo-1606313564200-e75d5e30476c",
  imgChickenSalad: "photo-1604908176997-125f25cc6f3d",
  imgChickenSandwich: "photo-1606755962773-d324e0a13086",
  imgSub: "photo-1509722747041-616f39b57569",
  imgOmelette: "photo-1525351484163-7529414344d8",
  imgChickenTikka: "photo-1599487488170-d11ec9c172f0",
  imgBowl: "photo-1546069901-ba9599a7e63c",
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
    logo: u(IMG.burger, 200),
    banner: u(IMG.farmaoBanner, 1200),
    lat: 28.4110,
    lng: 77.3200,
    menu: [
      {
        name: "Burgers",
        image: "https://loremflickr.com/600/400/burger?lock=1001",
        items: [
          { name: "Masala Crunch", description: "Crispy masala veg patty burger", price: 79, image: "https://loremflickr.com/600/400/burger?lock=1002" },
          { name: "Magical Mint", description: "Veg patty with refreshing mint", price: 99, image: "https://loremflickr.com/600/400/burger?lock=1003" },
          { name: "Mexican Crunch", description: "Spicy Mexican-style crunchy burger", price: 109, image: "https://loremflickr.com/600/400/burger?lock=1004" },
          { name: "Cheese Burst Veggie", description: "Veggie burger loaded with cheese", price: 119, image: "https://loremflickr.com/600/400/burger?lock=1005" },
          { name: "Double Decker", description: "Double patty, double the joy", price: 139, image: "https://loremflickr.com/600/400/burger?lock=1006" },
          { name: "Tandoori Paneer King", description: "Smoky tandoori paneer patty", price: 149, image: "https://loremflickr.com/600/400/burger?lock=1007" },
          { name: "Tex Mex Paneer Patty", description: "Tex-Mex spiced paneer patty", price: 159, image: "https://loremflickr.com/600/400/burger?lock=1008" },
          { name: "Maharaja Patty Burger", description: "Loaded king-size veg burger", price: 179, image: "https://loremflickr.com/600/400/burger?lock=1009" },
        ],
      },
      {
        name: "Wraps",
        image: "https://loremflickr.com/600/400/wrap?lock=1010",
        items: [
          { name: "Signature Herb Chilly", description: "Herby chilly veg wrap", price: 89, image: "https://loremflickr.com/600/400/wrap?lock=1011" },
          { name: "Masala Mexican", description: "Mexican masala veg wrap", price: 99, image: "https://loremflickr.com/600/400/wrap?lock=1012" },
          { name: "Farm Fresh", description: "Fresh garden veggies wrap", price: 99, image: "https://loremflickr.com/600/400/wrap?lock=1013" },
          { name: "Creamy Paneer Wrap", description: "Creamy paneer-filled wrap", price: 139, image: "https://loremflickr.com/600/400/wrap?lock=1014" },
          { name: "Crispy Tandoori Paneer Wrap", description: "Crispy tandoori paneer wrap", price: 149, image: "https://loremflickr.com/600/400/wrap?lock=1015" },
        ],
      },
      {
        name: "Fries",
        image: "https://loremflickr.com/600/400/fries?lock=1016",
        items: [
          { name: "Classic Golden Salted", description: "Golden salted French fries", price: 99, image: "https://loremflickr.com/600/400/fries?lock=1017" },
          { name: "Peri Peri Thunder", description: "Fiery peri peri fries", price: 119, image: "https://loremflickr.com/600/400/fries?lock=1018" },
          { name: "Cheese Loaded Fries", description: "Fries loaded with melty cheese", price: 139, image: "https://loremflickr.com/600/400/fries?lock=1019" },
          { name: "Peri Peri With Cheese", description: "Peri peri fries topped with cheese", price: 159, image: "https://loremflickr.com/600/400/fries?lock=1020" },
          { name: "Baked Cheesy Fries", description: "Oven-baked cheesy fries", price: 199, image: "https://loremflickr.com/600/400/fries?lock=1021" },
        ],
      },
      {
        name: "Momos",
        image: "https://loremflickr.com/600/400/momos?lock=1022",
        items: [
          { name: "Steamed Veg Momos", description: "Soft steamed veg dumplings", price: 89, image: "https://loremflickr.com/600/400/momos?lock=1023" },
          { name: "Fried Veg Momos", description: "Crispy fried veg momos", price: 99, image: "https://loremflickr.com/600/400/momos?lock=1024" },
          { name: "Steamed Paneer Momos", description: "Steamed paneer-stuffed momos", price: 109, image: "https://loremflickr.com/600/400/momos?lock=1025" },
          { name: "Fried Paneer Momos", description: "Crispy fried paneer momos", price: 119, image: "https://loremflickr.com/600/400/momos?lock=1026" },
          { name: "Kurkure Momo Veg", description: "Crunchy coated veg momos", price: 139, image: "https://loremflickr.com/600/400/momos?lock=1027" },
          { name: "Afghani Momo Veg", description: "Creamy afghani-style veg momos", price: 139, image: "https://loremflickr.com/600/400/momos?lock=1028" },
          { name: "Tandoori Momo Veg", description: "Smoky tandoori veg momos", price: 139, image: "https://loremflickr.com/600/400/momos?lock=1029" },
          { name: "Kurkure Momo Paneer", description: "Crunchy coated paneer momos", price: 179, image: "https://loremflickr.com/600/400/momos?lock=1030" },
          { name: "Afghani Momo Paneer", description: "Creamy afghani paneer momos", price: 179, image: "https://loremflickr.com/600/400/momos?lock=1031" },
          { name: "Tandoori Momo Paneer", description: "Smoky tandoori paneer momos", price: 179, image: "https://loremflickr.com/600/400/momos?lock=1032" },
          { name: "Kurkure Corn n Cheese", description: "Crunchy corn & cheese momos", price: 219, image: "https://loremflickr.com/600/400/momos?lock=1033" },
        ],
      },
      {
        name: "Spring Rolls",
        image: "https://loremflickr.com/600/400/springrolls?lock=1034",
        items: [
          { name: "Classic Spring Rolls", description: "Crispy veg spring rolls", price: 99, image: "https://loremflickr.com/600/400/springrolls?lock=1035" },
          { name: "Kurkure Spring Rolls", description: "Extra-crunchy spring rolls", price: 119, image: "https://loremflickr.com/600/400/springrolls?lock=1036" },
        ],
      },
      {
        name: "Pizza",
        image: "https://loremflickr.com/600/400/pizza?lock=1037",
        items: [
          { name: "Margherita", description: "Classic cheese pizza · 8\"/10\": ₹129/₹169", price: 129, image: "https://loremflickr.com/600/400/pizza?lock=1038" },
          { name: "Corn n Capsicum", description: "Corn & capsicum pizza · 8\"/10\": ₹139/₹179", price: 139, image: "https://loremflickr.com/600/400/pizza?lock=1039" },
          { name: "Garden Fresh Supreme", description: "Loaded veggie supreme · 8\"/10\": ₹169/₹209", price: 169, image: "https://loremflickr.com/600/400/pizza?lock=1040" },
          { name: "Paneer Overload", description: "Loaded paneer pizza · 8\"/10\": ₹189/₹239", price: 189, image: "https://loremflickr.com/600/400/pizza?lock=1041" },
          { name: "Farmao Special", description: "Chef's special pizza · 8\"/10\": ₹219/₹259", price: 219, image: "https://loremflickr.com/600/400/pizza?lock=1042" },
        ],
      },
      {
        name: "Garlic Bread",
        image: "https://loremflickr.com/600/400/bread?lock=1043",
        items: [
          { name: "Farmao Classic Garlic Bread", description: "Classic cheesy garlic bread", price: 109, image: "https://loremflickr.com/600/400/bread?lock=1044" },
          { name: "Corn n Cheese Garlic Bread", description: "Corn & cheese garlic bread", price: 139, image: "https://loremflickr.com/600/400/bread?lock=1045" },
          { name: "Tandoori Paneer Garlic Bread", description: "Tandoori paneer garlic bread", price: 169, image: "https://loremflickr.com/600/400/bread?lock=1046" },
          { name: "Farmao Special Garlic Bread", description: "Loaded special garlic bread", price: 199, image: "https://loremflickr.com/600/400/bread?lock=1047" },
        ],
      },
      {
        name: "Chinese",
        image: "https://loremflickr.com/600/400/noodles?lock=1048",
        items: [
          { name: "Garlic Chilli Potato", description: "Crispy garlic chilli potatoes", price: 129, image: "https://loremflickr.com/600/400/noodles?lock=1049" },
          { name: "Honey Chilli Potato", description: "Sweet & spicy honey chilli potato", price: 139, image: "https://loremflickr.com/600/400/noodles?lock=1050" },
          { name: "Manchurian Dry", description: "Crispy veg manchurian, dry", price: 159, image: "https://loremflickr.com/600/400/noodles?lock=1051" },
          { name: "Manchurian Gravy", description: "Veg manchurian in tangy gravy", price: 159, image: "https://loremflickr.com/600/400/noodles?lock=1052" },
          { name: "Chilli Mushroom (Seasonal)", description: "Spicy chilli mushroom", price: 219, image: "https://loremflickr.com/600/400/noodles?lock=1053" },
          { name: "Chilli Paneer Dry", description: "Spicy chilli paneer, dry", price: 219, image: "https://loremflickr.com/600/400/noodles?lock=1054" },
          { name: "Chilli Paneer Gravy", description: "Chilli paneer in spicy gravy", price: 219, image: "https://loremflickr.com/600/400/noodles?lock=1055" },
        ],
      },
      {
        name: "Noodles",
        image: "https://loremflickr.com/600/400/noodles?lock=1056",
        items: [
          { name: "Chilli Garlic Noodles", description: "Spicy chilli garlic noodles", price: 119, image: "https://loremflickr.com/600/400/noodles?lock=1057" },
          { name: "Hakka Noodles", description: "Wok-tossed hakka noodles", price: 129, image: "https://loremflickr.com/600/400/noodles?lock=1058" },
          { name: "Singapuri Noodles", description: "Tangy Singapuri-style noodles", price: 139, image: "https://loremflickr.com/600/400/noodles?lock=1059" },
          { name: "Farmao Special Noodles", description: "Chef's special noodles", price: 169, image: "https://loremflickr.com/600/400/noodles?lock=1060" },
        ],
      },
      {
        name: "Pasta",
        image: "https://loremflickr.com/600/400/pasta?lock=1061",
        items: [
          { name: "Red Arrabita", description: "Spicy red sauce pasta", price: 169, image: "https://loremflickr.com/600/400/pasta?lock=1062" },
          { name: "Makhani Magic", description: "Rich makhani-style pasta", price: 179, image: "https://loremflickr.com/600/400/pasta?lock=1063" },
          { name: "White Cloud Pasta", description: "Creamy white sauce pasta", price: 199, image: "https://loremflickr.com/600/400/pasta?lock=1064" },
          { name: "Pink Fusion", description: "Pink sauce fusion pasta", price: 209, image: "https://loremflickr.com/600/400/pasta?lock=1065" },
          { name: "Baked Cheesy Pasta", description: "Oven-baked cheesy pasta", price: 249, image: "https://loremflickr.com/600/400/pasta?lock=1066" },
        ],
      },
      {
        name: "Cold Coffee",
        image: "https://loremflickr.com/600/400/coffee?lock=1067",
        items: [
          { name: "Classic Cold Coffee", description: "Chilled classic cold coffee", price: 139, image: "https://loremflickr.com/600/400/coffee?lock=1068" },
          { name: "Caramel Cold Coffee", description: "Cold coffee with caramel", price: 159, image: "https://loremflickr.com/600/400/coffee?lock=1069" },
          { name: "Hazelnut Cold Coffee", description: "Hazelnut-flavoured cold coffee", price: 159, image: "https://loremflickr.com/600/400/coffee?lock=1070" },
          { name: "Brownie Crushed Coffee", description: "Cold coffee with crushed brownie", price: 189, image: "https://loremflickr.com/600/400/coffee?lock=1071" },
        ],
      },
      {
        name: "Shakes",
        image: "https://loremflickr.com/600/400/milkshake?lock=1072",
        items: [
          { name: "Vanilla Dream", description: "Creamy vanilla shake", price: 139, image: "https://loremflickr.com/600/400/milkshake?lock=1073" },
          { name: "Oreo Crush", description: "Cookies & cream oreo shake", price: 159, image: "https://loremflickr.com/600/400/milkshake?lock=1074" },
          { name: "Nutella Magic", description: "Rich nutella shake", price: 169, image: "https://loremflickr.com/600/400/milkshake?lock=1075" },
          { name: "Kit Kat", description: "Crunchy kit kat shake", price: 169, image: "https://loremflickr.com/600/400/milkshake?lock=1076" },
          { name: "Oreo Kit Kat", description: "Oreo & kit kat shake", price: 179, image: "https://loremflickr.com/600/400/milkshake?lock=1077" },
          { name: "Brownie Crush", description: "Brownie loaded shake", price: 199, image: "https://loremflickr.com/600/400/milkshake?lock=1078" },
          { name: "Brownie Oreo Crush", description: "Brownie & oreo crush shake", price: 209, image: "https://loremflickr.com/600/400/milkshake?lock=1079" },
        ],
      },
      {
        name: "Mocktails",
        image: "https://loremflickr.com/600/400/cocktail?lock=1080",
        items: [
          { name: "Iced Tea", description: "Refreshing iced tea", price: 99, image: "https://loremflickr.com/600/400/cocktail?lock=1081" },
          { name: "Mint Mojito", description: "Cooling mint mojito", price: 109, image: "https://loremflickr.com/600/400/cocktail?lock=1082" },
          { name: "Blue Curaco", description: "Vibrant blue curacao mocktail", price: 119, image: "https://loremflickr.com/600/400/cocktail?lock=1083" },
          { name: "Green Apple", description: "Tangy green apple cooler", price: 119, image: "https://loremflickr.com/600/400/cocktail?lock=1084" },
          { name: "Kala Khatta", description: "Classic kala khatta cooler", price: 119, image: "https://loremflickr.com/600/400/cocktail?lock=1085" },
          { name: "Orange Sunrise", description: "Zesty orange sunrise", price: 119, image: "https://loremflickr.com/600/400/cocktail?lock=1086" },
          { name: "Indian Paan", description: "Refreshing paan mocktail", price: 129, image: "https://loremflickr.com/600/400/cocktail?lock=1087" },
          { name: "Watermelon", description: "Juicy watermelon cooler", price: 129, image: "https://loremflickr.com/600/400/cocktail?lock=1088" },
          { name: "Mango Mint Refresher", description: "Mango & mint refresher", price: 129, image: "https://loremflickr.com/600/400/cocktail?lock=1089" },
          { name: "Chilli Guava", description: "Spicy chilli guava cooler", price: 129, image: "https://loremflickr.com/600/400/cocktail?lock=1090" },
          { name: "Passion Fruit", description: "Tropical passion fruit cooler", price: 129, image: "https://loremflickr.com/600/400/cocktail?lock=1091" },
        ],
      },
      {
        name: "Sides",
        image: "https://loremflickr.com/600/400/nachos?lock=1092",
        items: [
          { name: "Nachos With Cheese", description: "Crunchy nachos with cheese dip", price: 159, image: "https://loremflickr.com/600/400/nachos?lock=1093" },
          { name: "Crispy Corns", description: "Golden crispy corn kernels", price: 159, image: "https://loremflickr.com/600/400/nachos?lock=1094" },
        ],
      },
      {
        name: "Beverages",
        image: "https://loremflickr.com/600/400/soda?lock=1095",
        items: [
          { name: "Coke (250 ml)", description: "Chilled Coca-Cola", price: 40, image: "https://loremflickr.com/600/400/soda?lock=1096" },
          { name: "Sprite (250 ml)", description: "Chilled Sprite", price: 40, image: "https://loremflickr.com/600/400/soda?lock=1097" },
          { name: "Coke (750 ml)", description: "Chilled Coca-Cola, large", price: 50, image: "https://loremflickr.com/600/400/soda?lock=1098" },
          { name: "Sprite (750 ml)", description: "Chilled Sprite, large", price: 50, image: "https://loremflickr.com/600/400/soda?lock=1099" },
          { name: "Diet Coke", description: "Chilled Diet Coke", price: 40, image: "https://loremflickr.com/600/400/soda?lock=1100" },
        ],
      },
      {
        name: "Desserts",
        image: "https://loremflickr.com/600/400/dessert?lock=1101",
        items: [
          { name: "Choco Lava Cake", description: "Warm gooey choco lava cake", price: 79, image: "https://loremflickr.com/600/400/dessert?lock=1102" },
          { name: "Classic Walnut Brownie", description: "Rich walnut brownie", price: 99, image: "https://loremflickr.com/600/400/dessert?lock=1103" },
          { name: "Brownie With Icecream", description: "Brownie served with ice cream", price: 139, image: "https://loremflickr.com/600/400/dessert?lock=1104" },
        ],
      },
    ],
  },
  {
    name: "DIET HUB",
    email: "diethub@presnag.com",
    category: "Healthy Food",
    description: "Your daily dose of health with fresh salads, high-protein meals & juices.",
    address: "Shop No. 18, Tikona Park, NIT, Faridabad",
    logo: u(IMG.salad, 200),
    banner: u(IMG.dietBanner, 1200),
    lat: 28.3900,
    lng: 77.3050,
    menu: [
      {
        name: "Coolers",
        image: "https://loremflickr.com/600/400/milkshake?lock=1105",
        items: [
          { name: "Strawberry Shake", description: "Creamy strawberry shake", price: 80, image: "https://loremflickr.com/600/400/milkshake?lock=1106" },
          { name: "Blueberry Shake", description: "Creamy blueberry shake", price: 90, image: "https://loremflickr.com/600/400/milkshake?lock=1107" },
          { name: "Pineapple Shake", description: "Refreshing pineapple shake", price: 90, image: "https://loremflickr.com/600/400/milkshake?lock=1108" },
          { name: "Protein Shake", description: "High-protein shake", price: 100, image: "https://loremflickr.com/600/400/milkshake?lock=1109" },
          { name: "Gaining Shake", description: "Mass-gainer protein shake", price: 200, image: "https://loremflickr.com/600/400/milkshake?lock=1110" },
          { name: "Strawberry Protein Shake", description: "Strawberry shake with protein", price: 120, image: "https://loremflickr.com/600/400/milkshake?lock=1111" },
          { name: "Blueberry Protein Shake", description: "Blueberry shake with protein", price: 130, image: "https://loremflickr.com/600/400/milkshake?lock=1112" },
          { name: "Pineapple Protein Shake", description: "Pineapple shake with protein", price: 120, image: "https://loremflickr.com/600/400/milkshake?lock=1113" },
          { name: "Cold Coffee", description: "Chilled cold coffee", price: 80, image: "https://loremflickr.com/600/400/milkshake?lock=1114" },
          { name: "Lemon Mojito", description: "Zesty lemon mojito", price: 80, image: "https://loremflickr.com/600/400/milkshake?lock=1115" },
        ],
      },
      {
        name: "Smoothies",
        image: "https://loremflickr.com/600/400/smoothie?lock=1116",
        items: [
          { name: "Spinach Smoothie", description: "Fresh spinach detox smoothie", price: 120, image: "https://loremflickr.com/600/400/smoothie?lock=1117" },
          { name: "Mango Banana Smoothie", description: "Mango & banana blend", price: 140, image: "https://loremflickr.com/600/400/smoothie?lock=1118" },
          { name: "Blueberry Raspberry Smoothie", description: "Berry-packed smoothie", price: 200, image: "https://loremflickr.com/600/400/smoothie?lock=1119" },
        ],
      },
      {
        name: "Health Box (Veg Salads)",
        image: "https://loremflickr.com/600/400/salad?lock=1120",
        items: [
          { name: "Soya Salad", description: "Protein-rich soya salad", price: 160, image: "https://loremflickr.com/600/400/salad?lock=1121" },
          { name: "Saute Vegetable Salad", description: "Lightly sautéed veggie salad", price: 170, image: "https://loremflickr.com/600/400/salad?lock=1122" },
          { name: "Mushroom Salad", description: "Fresh mushroom salad", price: 190, image: "https://loremflickr.com/600/400/salad?lock=1123" },
          { name: "Soya Paneer Salad", description: "Soya & paneer salad", price: 190, image: "https://loremflickr.com/600/400/salad?lock=1124" },
          { name: "Soya Mushroom Salad", description: "Soya & mushroom salad", price: 190, image: "https://loremflickr.com/600/400/salad?lock=1125" },
          { name: "Paneer Salad", description: "Fresh paneer salad", price: 170, image: "https://loremflickr.com/600/400/salad?lock=1126" },
          { name: "Paneer Mushroom Salad", description: "Paneer & mushroom salad", price: 190, image: "https://loremflickr.com/600/400/salad?lock=1127" },
          { name: "Roasted Paneer Salad", description: "Roasted paneer salad", price: 190, image: "https://loremflickr.com/600/400/salad?lock=1128" },
          { name: "Soya Paneer Mushroom Salad", description: "Soya, paneer & mushroom salad", price: 250, image: "https://loremflickr.com/600/400/salad?lock=1129" },
        ],
      },
      {
        name: "Health Box (Non-Veg Salads)",
        image: "https://loremflickr.com/600/400/salad?lock=1130",
        items: [
          { name: "Salami Salad", description: "Salami loaded salad", price: 200, image: "https://loremflickr.com/600/400/salad?lock=1131" },
          { name: "Egg Salad", description: "Protein egg salad", price: 180, image: "https://loremflickr.com/600/400/salad?lock=1132" },
          { name: "Roasted Chicken Salad", description: "Roasted chicken salad", price: 230, image: "https://loremflickr.com/600/400/salad?lock=1133" },
          { name: "Grilled Chicken Salad", description: "Grilled chicken salad", price: 240, image: "https://loremflickr.com/600/400/salad?lock=1134" },
          { name: "Grilled Chicken Salad with Rice", description: "Grilled chicken salad with rice", price: 280, image: "https://loremflickr.com/600/400/salad?lock=1135" },
          { name: "Hulk Chicken Salad", description: "Loaded high-protein chicken salad", price: 300, image: "https://loremflickr.com/600/400/salad?lock=1136" },
        ],
      },
      {
        name: "Rolls",
        image: "https://loremflickr.com/600/400/wrap?lock=1137",
        items: [
          { name: "Paneer Roll", description: "Soft roll with paneer filling", price: 190, image: "https://loremflickr.com/600/400/wrap?lock=1138" },
          { name: "Classic Paneer Roll", description: "Classic paneer kathi roll", price: 200, image: "https://loremflickr.com/600/400/wrap?lock=1139" },
          { name: "Peri Peri Paneer Roll", description: "Spicy peri peri paneer roll", price: 200, image: "https://loremflickr.com/600/400/wrap?lock=1140" },
          { name: "Paneer Veggie Quesadilla", description: "Paneer & veggie quesadilla", price: 220, image: "https://loremflickr.com/600/400/wrap?lock=1141" },
          { name: "Chicken Roll", description: "Roll with chicken filling", price: 200, image: "https://loremflickr.com/600/400/wrap?lock=1142" },
          { name: "Classic Chicken Roll", description: "Classic chicken kathi roll", price: 240, image: "https://loremflickr.com/600/400/wrap?lock=1143" },
          { name: "Peri-Peri Chicken Roll", description: "Spicy peri peri chicken roll", price: 240, image: "https://loremflickr.com/600/400/wrap?lock=1144" },
          { name: "Chicken Quesadilla", description: "Cheesy chicken quesadilla", price: 240, image: "https://loremflickr.com/600/400/wrap?lock=1145" },
          { name: "Chilly Chicken Roll", description: "Chilli chicken roll", price: 240, image: "https://loremflickr.com/600/400/wrap?lock=1146" },
          { name: "Chilly Mushroom Roll", description: "Chilli mushroom roll", price: 200, image: "https://loremflickr.com/600/400/wrap?lock=1147" },
        ],
      },
      {
        name: "SUB (Multigrain)",
        image: "https://loremflickr.com/600/400/sandwich?lock=1148",
        items: [
          { name: "Tandoori Paneer Tikka SUB", description: "Multigrain sub with tandoori paneer", price: 200, image: "https://loremflickr.com/600/400/sandwich?lock=1149" },
          { name: "Mexican Paneer Tikka SUB", description: "Mexican paneer tikka sub", price: 240, image: "https://loremflickr.com/600/400/sandwich?lock=1150" },
          { name: "Mexican Chicken Tikka SUB", description: "Mexican chicken tikka sub", price: 260, image: "https://loremflickr.com/600/400/sandwich?lock=1151" },
          { name: "Smoked Chicken Tikka SUB", description: "Smoked chicken tikka sub", price: 240, image: "https://loremflickr.com/600/400/sandwich?lock=1152" },
          { name: "Chicken With Salami Sub", description: "Chicken & salami sub", price: 280, image: "https://loremflickr.com/600/400/sandwich?lock=1153" },
          { name: "Chicken With Kebab Sub", description: "Chicken & kebab sub", price: 280, image: "https://loremflickr.com/600/400/sandwich?lock=1154" },
        ],
      },
      {
        name: "Veg Meals",
        image: "https://loremflickr.com/600/400/thali?lock=1155",
        items: [
          { name: "Paneer with Veggie Meal", description: "Paneer & veggies meal", price: 180, image: "https://loremflickr.com/600/400/thali?lock=1156" },
          { name: "Soya Meal", description: "High-protein soya meal", price: 180, image: "https://loremflickr.com/600/400/thali?lock=1157" },
          { name: "Mushroom Meal", description: "Mushroom meal", price: 200, image: "https://loremflickr.com/600/400/thali?lock=1158" },
          { name: "Soya Paneer Meal", description: "Soya & paneer meal", price: 200, image: "https://loremflickr.com/600/400/thali?lock=1159" },
          { name: "Paneer Mushroom Meal", description: "Paneer & mushroom meal", price: 200, image: "https://loremflickr.com/600/400/thali?lock=1160" },
          { name: "Soya Mushroom Meal", description: "Soya & mushroom meal", price: 200, image: "https://loremflickr.com/600/400/thali?lock=1161" },
          { name: "Soya Paneer Mushroom Meal", description: "Soya, paneer & mushroom meal", price: 250, image: "https://loremflickr.com/600/400/thali?lock=1162" },
        ],
      },
      {
        name: "Non-Veg Meals",
        image: "https://loremflickr.com/600/400/chicken?lock=1163",
        items: [
          { name: "Egg Meal", description: "Protein egg meal", price: 180, image: "https://loremflickr.com/600/400/chicken?lock=1164" },
          { name: "Boiled Chicken (250g)", description: "Plain boiled chicken, 250g", price: 190, image: "https://loremflickr.com/600/400/chicken?lock=1165" },
          { name: "Air Fried Chicken (250g)", description: "Air-fried chicken, 250g", price: 240, image: "https://loremflickr.com/600/400/chicken?lock=1166" },
          { name: "Boiled Chicken Meal", description: "Boiled chicken meal", price: 210, image: "https://loremflickr.com/600/400/chicken?lock=1167" },
          { name: "Boiled Chicken With Veggies", description: "Boiled chicken with veggies", price: 210, image: "https://loremflickr.com/600/400/chicken?lock=1168" },
          { name: "Boiled Chicken Egg Meal", description: "Boiled chicken & egg meal", price: 230, image: "https://loremflickr.com/600/400/chicken?lock=1169" },
          { name: "Hulk Boiled Chicken Meal", description: "Loaded high-protein chicken meal", price: 290, image: "https://loremflickr.com/600/400/chicken?lock=1170" },
          { name: "Grilled Fish (200gm)", description: "Grilled fish fillet, 200g", price: 300, image: "https://loremflickr.com/600/400/chicken?lock=1171" },
          { name: "Surmai Fish Tikka", description: "Marinated surmai fish tikka", price: 550, image: "https://loremflickr.com/600/400/chicken?lock=1172" },
        ],
      },
      {
        name: "Veg Sandwiches",
        image: "https://loremflickr.com/600/400/sandwich?lock=1173",
        items: [
          { name: "Grilled Veggie Sandwich", description: "Grilled veggie sandwich", price: 150, image: "https://loremflickr.com/600/400/sandwich?lock=1174" },
          { name: "Grilled Paneer Sandwich", description: "Grilled paneer sandwich", price: 170, image: "https://loremflickr.com/600/400/sandwich?lock=1175" },
          { name: "Grilled Veggie Paneer Sandwich", description: "Grilled veggie & paneer sandwich", price: 190, image: "https://loremflickr.com/600/400/sandwich?lock=1176" },
          { name: "Grilled Garden Delight Sandwich", description: "Loaded garden veggie sandwich", price: 250, image: "https://loremflickr.com/600/400/sandwich?lock=1177" },
        ],
      },
      {
        name: "Non-Veg Sandwiches",
        image: "https://loremflickr.com/600/400/sandwich?lock=1178",
        items: [
          { name: "Grilled Chicken Sandwich", description: "Grilled chicken sandwich", price: 180, image: "https://loremflickr.com/600/400/sandwich?lock=1179" },
          { name: "Grilled Chicken Veggie Sandwich", description: "Chicken & veggie sandwich", price: 200, image: "https://loremflickr.com/600/400/sandwich?lock=1180" },
          { name: "Grilled Chicken Club Sandwich", description: "Triple-decker chicken club", price: 260, image: "https://loremflickr.com/600/400/sandwich?lock=1181" },
          { name: "Grilled Chicken Egg Sandwich", description: "Chicken & egg sandwich", price: 240, image: "https://loremflickr.com/600/400/sandwich?lock=1182" },
          { name: "Grilled Fish Sandwich", description: "Grilled fish sandwich", price: 340, image: "https://loremflickr.com/600/400/sandwich?lock=1183" },
        ],
      },
      {
        name: "Wraps (3 Eggs Base)",
        image: "https://loremflickr.com/600/400/wrap?lock=1184",
        items: [
          { name: "Egg Chicken Wrap", description: "Egg-based wrap with chicken", price: 200, image: "https://loremflickr.com/600/400/wrap?lock=1185" },
          { name: "Egg Paneer Wrap", description: "Egg-based wrap with paneer", price: 180, image: "https://loremflickr.com/600/400/wrap?lock=1186" },
        ],
      },
      {
        name: "Veg Pasta",
        image: "https://loremflickr.com/600/400/pasta?lock=1187",
        items: [
          { name: "White Sauce Pasta", description: "Creamy white sauce pasta", price: 150, image: "https://loremflickr.com/600/400/pasta?lock=1188" },
          { name: "Red Sauce Pasta", description: "Tangy red sauce pasta", price: 150, image: "https://loremflickr.com/600/400/pasta?lock=1189" },
          { name: "Pink Sauce Pasta", description: "Pink sauce pasta", price: 170, image: "https://loremflickr.com/600/400/pasta?lock=1190" },
        ],
      },
      {
        name: "Non-Veg Pasta",
        image: "https://loremflickr.com/600/400/pasta?lock=1191",
        items: [
          { name: "Chicken White Sauce Pasta", description: "Chicken in creamy white sauce", price: 220, image: "https://loremflickr.com/600/400/pasta?lock=1192" },
          { name: "Chicken Red Sauce Pasta", description: "Chicken in tangy red sauce", price: 220, image: "https://loremflickr.com/600/400/pasta?lock=1193" },
          { name: "Chicken Pink Sauce Pasta", description: "Chicken in pink sauce", price: 230, image: "https://loremflickr.com/600/400/pasta?lock=1194" },
        ],
      },
      {
        name: "Eggs & Omelettes",
        image: "https://loremflickr.com/600/400/omelette?lock=1195",
        items: [
          { name: "Half Fry (2 Eggs)", description: "Two sunny-side-up eggs", price: 70, image: "https://loremflickr.com/600/400/omelette?lock=1196" },
          { name: "Cheese Half Fry", description: "Half fry with cheese", price: 90, image: "https://loremflickr.com/600/400/omelette?lock=1197" },
          { name: "Kebab Omelette", description: "Omelette with kebab", price: 120, image: "https://loremflickr.com/600/400/omelette?lock=1198" },
          { name: "Cheese Kebab Omelette", description: "Kebab omelette with cheese", price: 150, image: "https://loremflickr.com/600/400/omelette?lock=1199" },
          { name: "Salami Omelette (2 Eggs)", description: "Omelette with salami", price: 120, image: "https://loremflickr.com/600/400/omelette?lock=1200" },
          { name: "Cheese Salami Omelette (2 Eggs)", description: "Salami omelette with cheese", price: 140, image: "https://loremflickr.com/600/400/omelette?lock=1201" },
          { name: "French Omelette", description: "Classic french omelette", price: 120, image: "https://loremflickr.com/600/400/omelette?lock=1202" },
          { name: "Cheese Chicken French Omelette", description: "Chicken french omelette with cheese", price: 180, image: "https://loremflickr.com/600/400/omelette?lock=1203" },
          { name: "Jalandhari Omelette", description: "Spicy Jalandhari-style omelette", price: 120, image: "https://loremflickr.com/600/400/omelette?lock=1204" },
        ],
      },
      {
        name: "SPL Chicken Tikka Salad (Thigh)",
        image: "https://loremflickr.com/600/400/tandoori?lock=1205",
        items: [
          { name: "Afghan Ka Shaitan", description: "Afghani-spiced chicken tikka salad", price: 330, image: "https://loremflickr.com/600/400/tandoori?lock=1206" },
          { name: "Paapi Pudhina", description: "Mint chicken tikka salad", price: 330, image: "https://loremflickr.com/600/400/tandoori?lock=1207" },
          { name: "Tandoori Blast", description: "Smoky tandoori chicken tikka salad", price: 330, image: "https://loremflickr.com/600/400/tandoori?lock=1208" },
          { name: "Saza E Kalimirch", description: "Black-pepper chicken tikka salad", price: 330, image: "https://loremflickr.com/600/400/tandoori?lock=1209" },
          { name: "Dhaniya Mirch", description: "Coriander-chilli chicken tikka salad", price: 330, image: "https://loremflickr.com/600/400/tandoori?lock=1210" },
          { name: "Gangs Of Awadh", description: "Awadhi-style chicken tikka salad", price: 330, image: "https://loremflickr.com/600/400/tandoori?lock=1211" },
          { name: "Lucknowi Tamancha", description: "Lucknowi chicken tikka salad", price: 330, image: "https://loremflickr.com/600/400/tandoori?lock=1212" },
          { name: "Shawrma Tikka", description: "Shawarma-spiced chicken tikka salad", price: 330, image: "https://loremflickr.com/600/400/tandoori?lock=1213" },
        ],
      },
      {
        name: "Diet Hub Exclusive Items",
        image: "https://loremflickr.com/600/400/salad?lock=1214",
        items: [
          { name: "Herb Chicken Salad (Thigh)", description: "Herbed thigh chicken salad", price: 300, image: "https://loremflickr.com/600/400/salad?lock=1215" },
          { name: "Diet Hub Special Veg Bowl", description: "Signature healthy veg bowl", price: 270, image: "https://loremflickr.com/600/400/salad?lock=1216" },
          { name: "Diet Hub Special Non-Veg Bowl", description: "Signature non-veg protein bowl", price: 300, image: "https://loremflickr.com/600/400/salad?lock=1217" },
          { name: "Amul Bowl", description: "Protein-packed Amul bowl", price: 300, image: "https://loremflickr.com/600/400/salad?lock=1218" },
          { name: "Tzatziki Chicken Bowl", description: "Chicken bowl with tzatziki", price: 300, image: "https://loremflickr.com/600/400/salad?lock=1219" },
          { name: "Tzatziki Paneer Bowl", description: "Paneer bowl with tzatziki", price: 270, image: "https://loremflickr.com/600/400/salad?lock=1220" },
          { name: "Fish Bowl", description: "Protein fish bowl", price: 390, image: "https://loremflickr.com/600/400/salad?lock=1221" },
          { name: "Fish Salad", description: "Fresh fish salad", price: 360, image: "https://loremflickr.com/600/400/salad?lock=1222" },
          { name: "Paneer Alferado Bowl", description: "Paneer alfredo bowl", price: 250, image: "https://loremflickr.com/600/400/salad?lock=1223" },
          { name: "Chicken Alferado Bowl", description: "Chicken alfredo bowl", price: 300, image: "https://loremflickr.com/600/400/salad?lock=1224" },
          { name: "Chilly Chicken Bowl", description: "Chilli chicken bowl", price: 280, image: "https://loremflickr.com/600/400/salad?lock=1225" },
          { name: "Chicken Taco", description: "Healthy chicken taco", price: 250, image: "https://loremflickr.com/600/400/salad?lock=1226" },
          { name: "Paneer Tikka Bowl", description: "Paneer tikka protein bowl", price: 270, image: "https://loremflickr.com/600/400/salad?lock=1227" },
          { name: "Chicken Tikka Bowl", description: "Chicken tikka protein bowl", price: 320, image: "https://loremflickr.com/600/400/salad?lock=1228" },
          { name: "Chicken Mushroom Sauce Bowl", description: "Chicken in mushroom sauce bowl", price: 330, image: "https://loremflickr.com/600/400/salad?lock=1229" },
          { name: "Healthy Veg Mushroom Sauce Bowl", description: "Veg in mushroom sauce bowl", price: 280, image: "https://loremflickr.com/600/400/salad?lock=1230" },
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

  // No sample orders — start with a clean order history.

  console.log("\n[seed] done ✅  (7 shops, 0 orders)");
  console.log("--------------------------------------------------");
  console.log("Admin login:   admin@presnag.com / admin123");
  console.log("Vendor logins: tadka@presnag.com / vendor123");
  console.log("               brew@presnag.com / vendor123");
  console.log("               chinahotpot@presnag.com / vendor123");
  console.log("               khalsa@presnag.com / vendor123");
  console.log("               wonderbites@presnag.com / vendor123");
  console.log("               farmao@presnag.com / vendor123");
  console.log("               diethub@presnag.com / vendor123");
  console.log("Sample coupon: WELCOME10 (10% off)");
  console.log("--------------------------------------------------");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
