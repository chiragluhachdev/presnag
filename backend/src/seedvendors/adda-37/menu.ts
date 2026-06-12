const u = (id: string, w = 600) =>
  `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

const createPizzaSizes = (s: number, m: number, l: number) => [
  {
    id: "grp_size",
    name: "Size",
    type: "single",
    required: true,
    isActive: true,
    options: [
      { id: "opt_s", label: "Small", price: 0, priceType: "fixed", isAvailable: true },
      { id: "opt_m", label: "Medium", price: m - s, priceType: "fixed", isAvailable: true },
      { id: "opt_l", label: "Large", price: l - s, priceType: "fixed", isAvailable: true },
    ],
  },
  {
    id: "grp_cheese",
    name: "Extra Cheese",
    type: "multi",
    required: false,
    isActive: true,
    options: [
      { id: "ch_s", label: "For Small", price: 50, priceType: "fixed", isAvailable: true },
      { id: "ch_m", label: "For Medium", price: 75, priceType: "fixed", isAvailable: true },
      { id: "ch_l", label: "For Large", price: 120, priceType: "fixed", isAvailable: true },
    ],
  },
  {
    id: "grp_top",
    name: "Extra Toppings",
    type: "multi",
    required: false,
    isActive: true,
    options: [
      { id: "top_s", label: "For Small", price: 30, priceType: "fixed", isAvailable: true },
      { id: "top_m", label: "For Medium", price: 50, priceType: "fixed", isAvailable: true },
      { id: "top_l", label: "For Large", price: 80, priceType: "fixed", isAvailable: true },
    ],
  }
];

const createSizeSizes = (s: number, l: number) => [
  {
    id: "grp_size",
    name: "Size",
    type: "single",
    required: true,
    isActive: true,
    options: [
      { id: "opt_s", label: "Small", price: 0, priceType: "fixed", isAvailable: true },
      { id: "opt_l", label: "Large", price: l - s, priceType: "fixed", isAvailable: true },
    ],
  }
];

export const menuData = [
  {
    name: "🍕 Pizzas",
    image: u("photo-1513104890138-7c749659a591"),
    items: [
      // Single Pizzas
      { name: "Adda Cheese Onion", description: "Adda37 Single Pizza", price: 80, isVeg: true, image: u("photo-1565299624946-b28f40a0ae38"), customizations: createPizzaSizes(80, 150, 270) },
      { name: "Adda Cheese Capsicum", description: "Adda37 Single Pizza", price: 80, isVeg: true, image: u("photo-1565299624946-b28f40a0ae38"), customizations: createPizzaSizes(80, 150, 270) },
      { name: "Adda Cheese Corn", description: "Adda37 Single Pizza", price: 90, isVeg: true, image: u("photo-1565299624946-b28f40a0ae38"), customizations: createPizzaSizes(90, 170, 300) },
      { name: "Lady Adda Cheese (Margherita)", description: "Adda37 Single Pizza", price: 100, isVeg: true, image: u("photo-1574071318508-1cdbab80d002"), customizations: createPizzaSizes(100, 190, 340) },
      // Special Pizzas
      { name: "Old School", description: "Adda37 Special Pizza", price: 120, isVeg: true, image: u("photo-1513104890138-7c749659a591"), customizations: createPizzaSizes(120, 230, 360) },
      { name: "4 In 1", description: "Adda37 Special Pizza", price: 135, isVeg: true, image: u("photo-1513104890138-7c749659a591"), customizations: createPizzaSizes(135, 270, 405) },
      { name: "Adda Signature", description: "Adda37 Special Pizza", price: 145, isVeg: true, image: u("photo-1513104890138-7c749659a591"), customizations: createPizzaSizes(145, 290, 435) },
      { name: "Paneer Makhani", description: "Adda37 Special Pizza", price: 150, isVeg: true, image: u("photo-1513104890138-7c749659a591"), customizations: createPizzaSizes(150, 300, 450) },
      // Premium Pizzas
      { name: "White Delight Pizza", description: "Adda37 Premium Pizza", price: 170, isVeg: true, image: u("photo-1565299624946-b28f40a0ae38"), customizations: createPizzaSizes(170, 330, 495) },
      { name: "Four Seasons Pizza", description: "Adda37 Premium Pizza", price: 180, isVeg: true, image: u("photo-1565299624946-b28f40a0ae38"), customizations: createPizzaSizes(180, 350, 525) },
      { name: "Garden Royal Pizza", description: "Adda37 Premium Pizza", price: 190, isVeg: true, image: u("photo-1565299624946-b28f40a0ae38"), customizations: createPizzaSizes(190, 380, 550) },
      { name: "Exotic Paneer Tikka Pizza", description: "Adda37 Premium Pizza", price: 200, isVeg: true, image: u("photo-1565299624946-b28f40a0ae38"), customizations: createPizzaSizes(200, 390, 585) },
    ]
  },
  {
    name: "🍝 Pasta",
    image: u("photo-1555949258-eb67b1ef0ceb"),
    items: [
      { name: "Classica Italiano Pasta", description: "", price: 150, isVeg: true, image: u("photo-1555949258-eb67b1ef0ceb"), customizations: [{ id: "c_pasta", name: "Addon", type: "multi", required: false, isActive: true, options: [{ id: "o_cream", label: "Extra Creamy", price: 50, priceType: "fixed", isAvailable: true }] }] },
      { name: "Creamy Cloud White Pasta", description: "", price: 180, isVeg: true, image: u("photo-1473093295043-cdd812d0e601"), customizations: [{ id: "c_pasta", name: "Addon", type: "multi", required: false, isActive: true, options: [{ id: "o_cream", label: "Extra Creamy", price: 50, priceType: "fixed", isAvailable: true }] }] },
      { name: "Pink Velvet Pasta", description: "", price: 200, isVeg: true, image: u("photo-1551183053-bf91a1d81141"), customizations: [{ id: "c_pasta", name: "Addon", type: "multi", required: false, isActive: true, options: [{ id: "o_cream", label: "Extra Creamy", price: 50, priceType: "fixed", isAvailable: true }] }] },
      { name: "Mac & Cheese Pasta", description: "", price: 250, isVeg: true, image: u("photo-1543340713-17637cc9f086"), customizations: [{ id: "c_pasta", name: "Addon", type: "multi", required: false, isActive: true, options: [{ id: "o_cream", label: "Extra Creamy", price: 50, priceType: "fixed", isAvailable: true }] }] },
    ]
  },
  {
    name: "🧄 Garlic Bread",
    image: u("photo-1573140247632-f8fd74997d5c"),
    items: [
      { name: "Cheese Garlic Bread", description: "", price: 120, isVeg: true, image: u("photo-1573140247632-f8fd74997d5c"), customizations: [] },
      { name: "Garden Melt Veg Garlic Bread", description: "", price: 150, isVeg: true, image: u("photo-1573140247632-f8fd74997d5c"), customizations: [] },
      { name: "Golden Cheese Corn Crunch", description: "", price: 160, isVeg: true, image: u("photo-1573140247632-f8fd74997d5c"), customizations: [] },
      { name: "Tandoori Fire Garlic Bread", description: "", price: 170, isVeg: true, image: u("photo-1573140247632-f8fd74997d5c"), customizations: [] },
      { name: "Tandoori Paneer Blaze Garlic Bread", description: "", price: 190, isVeg: true, image: u("photo-1573140247632-f8fd74997d5c"), customizations: [] },
    ]
  },
  {
    name: "🥖 Subs & Combos",
    image: u("photo-1509722747041-616f39b57569"),
    items: [
      { name: "Aloo Patty Sub", description: "", price: 120, isVeg: true, image: u("photo-1509722747041-616f39b57569"), customizations: [] },
      { name: "Veggy Sub", description: "", price: 130, isVeg: true, image: u("photo-1509722747041-616f39b57569"), customizations: [] },
      { name: "Herb Patty Sub", description: "", price: 150, isVeg: true, image: u("photo-1509722747041-616f39b57569"), customizations: [] },
      { name: "Mexican Sub", description: "", price: 160, isVeg: true, image: u("photo-1509722747041-616f39b57569"), customizations: [] },
      { name: "Paneer Patty Sub", description: "", price: 180, isVeg: true, image: u("photo-1509722747041-616f39b57569"), customizations: [] },
      { name: "Paneer Tikka Sub", description: "", price: 199, isVeg: true, image: u("photo-1509722747041-616f39b57569"), customizations: [] },
      { name: "Mexican Sub + Any Mocktail", description: "Combo", price: 190, isVeg: true, image: u("photo-1509722747041-616f39b57569"), customizations: [] },
    ]
  },
  {
    name: "🍔 Burger Mania & Combos",
    image: u("photo-1568901346375-23c9450c58cd"),
    items: [
      { name: "Adda Classic Burger", description: "", price: 49, isVeg: true, image: u("photo-1568901346375-23c9450c58cd"), customizations: [{ id: "c_b", name: "Addon", type: "multi", required: false, isActive: true, options: [{ id: "o_b", label: "Extra Cheese Slice", price: 20, priceType: "fixed", isAvailable: true }] }] },
      { name: "Magic Burger", description: "", price: 80, isVeg: true, image: u("photo-1568901346375-23c9450c58cd"), customizations: [{ id: "c_b", name: "Addon", type: "multi", required: false, isActive: true, options: [{ id: "o_b", label: "Extra Cheese Slice", price: 20, priceType: "fixed", isAvailable: true }] }] },
      { name: "Adda Greenway Burger", description: "", price: 90, isVeg: true, image: u("photo-1568901346375-23c9450c58cd"), customizations: [{ id: "c_b", name: "Addon", type: "multi", required: false, isActive: true, options: [{ id: "o_b", label: "Extra Cheese Slice", price: 20, priceType: "fixed", isAvailable: true }] }] },
      { name: "Adda Tandoori Burger", description: "", price: 100, isVeg: true, image: u("photo-1568901346375-23c9450c58cd"), customizations: [{ id: "c_b", name: "Addon", type: "multi", required: false, isActive: true, options: [{ id: "o_b", label: "Extra Cheese Slice", price: 20, priceType: "fixed", isAvailable: true }] }] },
      { name: "Adda Cheese Melt Burger", description: "", price: 125, isVeg: true, image: u("photo-1568901346375-23c9450c58cd"), customizations: [{ id: "c_b", name: "Addon", type: "multi", required: false, isActive: true, options: [{ id: "o_b", label: "Extra Cheese Slice", price: 20, priceType: "fixed", isAvailable: true }] }] },
      { name: "Adda Paneer Burger", description: "", price: 140, isVeg: true, image: u("photo-1568901346375-23c9450c58cd"), customizations: [{ id: "c_b", name: "Addon", type: "multi", required: false, isActive: true, options: [{ id: "o_b", label: "Extra Cheese Slice", price: 20, priceType: "fixed", isAvailable: true }] }] },
      { name: "Cheese Sandwich + Classic Burger + Mocktail", description: "Combo", price: 170, isVeg: true, image: u("photo-1568901346375-23c9450c58cd"), customizations: [] },
      { name: "Classic Burger + Mocktail", description: "Combo", price: 100, isVeg: true, image: u("photo-1568901346375-23c9450c58cd"), customizations: [] },
      { name: "Classic Burger + Fries + Mocktail", description: "Combo", price: 150, isVeg: true, image: u("photo-1568901346375-23c9450c58cd"), customizations: [] },
      { name: "Greenway Burger + Fries + Mocktail", description: "Combo", price: 200, isVeg: true, image: u("photo-1568901346375-23c9450c58cd"), customizations: [] },
    ]
  },
  {
    name: "🍟 Fancy Fries",
    image: u("photo-1576107232684-1279f390859f"),
    items: [
      { name: "Salty Fries", description: "", price: 60, isVeg: true, image: u("photo-1576107232684-1279f390859f"), customizations: createSizeSizes(60, 90) },
      { name: "Peri Peri Fries", description: "", price: 70, isVeg: true, image: u("photo-1576107232684-1279f390859f"), customizations: createSizeSizes(70, 100) },
      { name: "Cheesy Fries", description: "", price: 80, isVeg: true, image: u("photo-1576107232684-1279f390859f"), customizations: createSizeSizes(80, 100) },
      { name: "Adda37 Mexican Fries", description: "", price: 149, isVeg: true, image: u("photo-1576107232684-1279f390859f"), customizations: [] },
      { name: "Adda Farm Fries", description: "", price: 149, isVeg: true, image: u("photo-1576107232684-1279f390859f"), customizations: [] },
    ]
  },
  {
    name: "🥪 Sandwiches",
    image: u("photo-1528735602780-2552fd46c7af"),
    items: [
      { name: "Adda Veg Cheese Sandwich", description: "", price: 80, isVeg: true, image: u("photo-1528735602780-2552fd46c7af"), customizations: [] },
      { name: "Adda Mexican Sandwich", description: "", price: 100, isVeg: true, image: u("photo-1528735602780-2552fd46c7af"), customizations: [] },
      { name: "Paneer Tikka Sandwich", description: "", price: 160, isVeg: true, image: u("photo-1528735602780-2552fd46c7af"), customizations: [] },
      { name: "Signature Adda Sandwich", description: "", price: 180, isVeg: true, image: u("photo-1528735602780-2552fd46c7af"), customizations: [] },
    ]
  },
  {
    name: "🥟 Momo Masti",
    image: u("photo-1625220194771-7ebdea0b70b9"),
    items: [
      { name: "Fried Veg Momos", description: "", price: 60, isVeg: true, image: u("photo-1625220194771-7ebdea0b70b9"), customizations: createSizeSizes(60, 100) },
      { name: "Fried Paneer Momos", description: "", price: 80, isVeg: true, image: u("photo-1625220194771-7ebdea0b70b9"), customizations: createSizeSizes(80, 140) },
      { name: "Fried Cheese Corn Momos", description: "", price: 100, isVeg: true, image: u("photo-1625220194771-7ebdea0b70b9"), customizations: createSizeSizes(100, 160) },
      { name: "Kurkure Veg Momos", description: "", price: 70, isVeg: true, image: u("photo-1625220194771-7ebdea0b70b9"), customizations: createSizeSizes(70, 120) },
      { name: "Kurkure Paneer Momos", description: "", price: 80, isVeg: true, image: u("photo-1625220194771-7ebdea0b70b9"), customizations: createSizeSizes(80, 140) },
      { name: "Kurkure Cheese Corn Momos", description: "", price: 100, isVeg: true, image: u("photo-1625220194771-7ebdea0b70b9"), customizations: createSizeSizes(100, 160) },
    ]
  },
  {
    name: "🌯 Wraps",
    image: u("photo-1626700051175-6818013e1d4f"),
    items: [
      { name: "Veg Patty Wrap", description: "", price: 120, isVeg: true, image: u("photo-1626700051175-6818013e1d4f"), customizations: [] },
      { name: "Paneer Wrap", description: "", price: 150, isVeg: true, image: u("photo-1626700051175-6818013e1d4f"), customizations: [] },
      { name: "Veg Wrap", description: "", price: 160, isVeg: true, image: u("photo-1626700051175-6818013e1d4f"), customizations: [] },
      { name: "Mexican Wrap", description: "", price: 170, isVeg: true, image: u("photo-1626700051175-6818013e1d4f"), customizations: [] },
      { name: "Paneer Tikka Wrap", description: "", price: 170, isVeg: true, image: u("photo-1626700051175-6818013e1d4f"), customizations: [] },
    ]
  },
  {
    name: "🌮 Sides & Nachos",
    image: u("photo-1513456852971-30c0b8199d4d"),
    items: [
      { name: "Potato Twisters", description: "Available Sauces: Peri Peri, Thousand Island, Chipotle, BBQ, Tandoori", price: 80, isVeg: true, image: u("photo-1513456852971-30c0b8199d4d"), customizations: [] },
      { name: "Cheese Loaded Nachos", description: "", price: 120, isVeg: true, image: u("photo-1513456852971-30c0b8199d4d"), customizations: [] },
      { name: "Mexican Nachos", description: "", price: 150, isVeg: true, image: u("photo-1513456852971-30c0b8199d4d"), customizations: [] },
      { name: "Adda Special Nachos", description: "", price: 170, isVeg: true, image: u("photo-1513456852971-30c0b8199d4d"), customizations: [] },
      { name: "Spring Roll", description: "", price: 99, isVeg: true, image: u("photo-1513456852971-30c0b8199d4d"), customizations: [] },
      { name: "Cheese Nuggets", description: "", price: 99, isVeg: true, image: u("photo-1513456852971-30c0b8199d4d"), customizations: [] },
      { name: "Potato Twister + Spring Roll + Lime Soda", description: "Combo", price: 199, isVeg: true, image: u("photo-1513456852971-30c0b8199d4d"), customizations: [] },
    ]
  },
  {
    name: "☕ Drinks & Cold Coffee",
    image: u("photo-1461023058943-07cb14c4a522"),
    items: [
      { name: "Classic Coffee", description: "", price: 60, isVeg: true, image: u("photo-1461023058943-07cb14c4a522"), customizations: [{ id: "c_c", name: "Addons", type: "multi", required: false, isActive: true, options: [{ id: "o_lg", label: "Large Glass", price: 20, priceType: "fixed", isAvailable: true }, { id: "o_ic", label: "Ice Cream Scoop", price: 20, priceType: "fixed", isAvailable: true }] }] },
      { name: "Caramel Coffee", description: "", price: 70, isVeg: true, image: u("photo-1461023058943-07cb14c4a522"), customizations: [{ id: "c_c", name: "Addons", type: "multi", required: false, isActive: true, options: [{ id: "o_lg", label: "Large Glass", price: 20, priceType: "fixed", isAvailable: true }, { id: "o_ic", label: "Ice Cream Scoop", price: 20, priceType: "fixed", isAvailable: true }] }] },
      { name: "Vanilla Coffee", description: "", price: 70, isVeg: true, image: u("photo-1461023058943-07cb14c4a522"), customizations: [{ id: "c_c", name: "Addons", type: "multi", required: false, isActive: true, options: [{ id: "o_lg", label: "Large Glass", price: 20, priceType: "fixed", isAvailable: true }, { id: "o_ic", label: "Ice Cream Scoop", price: 20, priceType: "fixed", isAvailable: true }] }] },
      { name: "Butterscotch Coffee", description: "", price: 70, isVeg: true, image: u("photo-1461023058943-07cb14c4a522"), customizations: [{ id: "c_c", name: "Addons", type: "multi", required: false, isActive: true, options: [{ id: "o_lg", label: "Large Glass", price: 20, priceType: "fixed", isAvailable: true }, { id: "o_ic", label: "Ice Cream Scoop", price: 20, priceType: "fixed", isAvailable: true }] }] },
      { name: "Irish Coffee", description: "", price: 70, isVeg: true, image: u("photo-1461023058943-07cb14c4a522"), customizations: [{ id: "c_c", name: "Addons", type: "multi", required: false, isActive: true, options: [{ id: "o_lg", label: "Large Glass", price: 20, priceType: "fixed", isAvailable: true }, { id: "o_ic", label: "Ice Cream Scoop", price: 20, priceType: "fixed", isAvailable: true }] }] },
      { name: "Hazelnut Coffee", description: "", price: 70, isVeg: true, image: u("photo-1461023058943-07cb14c4a522"), customizations: [{ id: "c_c", name: "Addons", type: "multi", required: false, isActive: true, options: [{ id: "o_lg", label: "Large Glass", price: 20, priceType: "fixed", isAvailable: true }, { id: "o_ic", label: "Ice Cream Scoop", price: 20, priceType: "fixed", isAvailable: true }] }] },
      { name: "Mocha Coffee", description: "", price: 70, isVeg: true, image: u("photo-1461023058943-07cb14c4a522"), customizations: [{ id: "c_c", name: "Addons", type: "multi", required: false, isActive: true, options: [{ id: "o_lg", label: "Large Glass", price: 20, priceType: "fixed", isAvailable: true }, { id: "o_ic", label: "Ice Cream Scoop", price: 20, priceType: "fixed", isAvailable: true }] }] },
    ]
  },
  {
    name: "🍹 Mocktails, Shakes & Crushers",
    image: u("photo-1513558161293-cdaf765ed2fd"),
    items: [
      // Premium Shakes
      { name: "Butterscotch Classic Shake", description: "Premium Shake", price: 119, isVeg: true, image: u("photo-1572490122747-3968b75cc699"), customizations: [] },
      { name: "Vanilla Decadent Shake", description: "Premium Shake", price: 119, isVeg: true, image: u("photo-1572490122747-3968b75cc699"), customizations: [] },
      { name: "Chocolate Shake", description: "Premium Shake", price: 119, isVeg: true, image: u("photo-1572490122747-3968b75cc699"), customizations: [] },
      { name: "Strawberry Fields Shake", description: "Premium Shake", price: 119, isVeg: true, image: u("photo-1572490122747-3968b75cc699"), customizations: [] },
      { name: "Blueberry KitKat Shake", description: "Premium Shake", price: 119, isVeg: true, image: u("photo-1572490122747-3968b75cc699"), customizations: [] },
      { name: "Oreo Shake", description: "Premium Shake", price: 119, isVeg: true, image: u("photo-1572490122747-3968b75cc699"), customizations: [] },
      // Mocktails
      { name: "Watermelon Cooler", description: "Mocktail", price: 70, isVeg: true, image: u("photo-1513558161293-cdaf765ed2fd"), customizations: [{ id: "c_m", name: "Addons", type: "multi", required: false, isActive: true, options: [{ id: "o_lg", label: "Large Glass", price: 20, priceType: "fixed", isAvailable: true }] }] },
      { name: "Orange Mint", description: "Mocktail", price: 70, isVeg: true, image: u("photo-1513558161293-cdaf765ed2fd"), customizations: [{ id: "c_m", name: "Addons", type: "multi", required: false, isActive: true, options: [{ id: "o_lg", label: "Large Glass", price: 20, priceType: "fixed", isAvailable: true }] }] },
      { name: "Virgin Mojito", description: "Mocktail", price: 70, isVeg: true, image: u("photo-1513558161293-cdaf765ed2fd"), customizations: [{ id: "c_m", name: "Addons", type: "multi", required: false, isActive: true, options: [{ id: "o_lg", label: "Large Glass", price: 20, priceType: "fixed", isAvailable: true }] }] },
      { name: "Blue Lagoon", description: "Mocktail", price: 70, isVeg: true, image: u("photo-1513558161293-cdaf765ed2fd"), customizations: [{ id: "c_m", name: "Addons", type: "multi", required: false, isActive: true, options: [{ id: "o_lg", label: "Large Glass", price: 20, priceType: "fixed", isAvailable: true }] }] },
      { name: "Green Apple", description: "Mocktail", price: 70, isVeg: true, image: u("photo-1513558161293-cdaf765ed2fd"), customizations: [{ id: "c_m", name: "Addons", type: "multi", required: false, isActive: true, options: [{ id: "o_lg", label: "Large Glass", price: 20, priceType: "fixed", isAvailable: true }] }] },
      { name: "Classic Lemon Tea", description: "Ice Tea", price: 70, isVeg: true, image: u("photo-1513558161293-cdaf765ed2fd"), customizations: [{ id: "c_m", name: "Addons", type: "multi", required: false, isActive: true, options: [{ id: "o_lg", label: "Large Glass", price: 20, priceType: "fixed", isAvailable: true }] }] },
      { name: "Mint Ice Tea", description: "Ice Tea", price: 80, isVeg: true, image: u("photo-1513558161293-cdaf765ed2fd"), customizations: [{ id: "c_m", name: "Addons", type: "multi", required: false, isActive: true, options: [{ id: "o_lg", label: "Large Glass", price: 20, priceType: "fixed", isAvailable: true }] }] },
      { name: "Peach Ice Tea", description: "Ice Tea", price: 80, isVeg: true, image: u("photo-1513558161293-cdaf765ed2fd"), customizations: [{ id: "c_m", name: "Addons", type: "multi", required: false, isActive: true, options: [{ id: "o_lg", label: "Large Glass", price: 20, priceType: "fixed", isAvailable: true }] }] },
      // Crushers
      { name: "Kiwi Mint Smash", description: "Crusher", price: 119, isVeg: true, image: u("photo-1513558161293-cdaf765ed2fd"), customizations: [] },
      { name: "Mango Lime Smash", description: "Crusher", price: 119, isVeg: true, image: u("photo-1513558161293-cdaf765ed2fd"), customizations: [] },
      { name: "Spicy Guava", description: "Crusher", price: 119, isVeg: true, image: u("photo-1513558161293-cdaf765ed2fd"), customizations: [] },
      { name: "Tamarind Crusher", description: "Crusher", price: 119, isVeg: true, image: u("photo-1513558161293-cdaf765ed2fd"), customizations: [] },
      { name: "Kokum Crush", description: "Crusher", price: 119, isVeg: true, image: u("photo-1513558161293-cdaf765ed2fd"), customizations: [] },
      { name: "Pineapple Jalapeno Fizz", description: "Crusher", price: 119, isVeg: true, image: u("photo-1513558161293-cdaf765ed2fd"), customizations: [] },
      // Signature Shakes
      { name: "Cafe Chill Frappe", description: "Signature Shake", price: 99, isVeg: true, image: u("photo-1572490122747-3968b75cc699"), customizations: [] },
      { name: "Cafe Mocha Frappe", description: "Signature Shake", price: 129, isVeg: true, image: u("photo-1572490122747-3968b75cc699"), customizations: [] },
      { name: "Nutella Shake", description: "Signature Shake", price: 159, isVeg: true, image: u("photo-1572490122747-3968b75cc699"), customizations: [] },
      { name: "Brownie Cake Shake", description: "Signature Shake", price: 159, isVeg: true, image: u("photo-1572490122747-3968b75cc699"), customizations: [] },
      { name: "Biscoff Cake Shake", description: "Signature Shake", price: 159, isVeg: true, image: u("photo-1572490122747-3968b75cc699"), customizations: [] },
    ]
  },
  {
    name: "🍫 Brownies",
    image: u("photo-1606313564200-e75d5e30476c"),
    items: [
      { name: "Double Choco Dip Brownie", description: "", price: 90, isVeg: true, image: u("photo-1606313564200-e75d5e30476c"), customizations: [] },
      { name: "Walnut Brownie", description: "", price: 90, isVeg: true, image: u("photo-1606313564200-e75d5e30476c"), customizations: [] },
      { name: "Hazelnut Brownie", description: "", price: 100, isVeg: true, image: u("photo-1606313564200-e75d5e30476c"), customizations: [] },
      { name: "Molten Choco Lava", description: "", price: 110, isVeg: true, image: u("photo-1606313564200-e75d5e30476c"), customizations: [] },
      { name: "Red Velvet Brownie", description: "", price: 120, isVeg: true, image: u("photo-1606313564200-e75d5e30476c"), customizations: [] },
    ]
  }
];
