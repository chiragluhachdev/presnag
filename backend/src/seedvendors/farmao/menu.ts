const u = (id: string, w = 600) =>
  `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

export const menuData = [
  {
    name: "🥟 Momos",
    image: u("photo-1496116218417-1a781b1c416c"),
    items: [
      {
        name: "Steamed Veg Momos",
        description: "Soft steamed veg momos.",
        price: 69,
        isVeg: true,
        image: u("photo-1496116218417-1a781b1c416c"),
        customizations: [
          {
            id: "grp_size",
            name: "Size",
            type: "single",
            required: true,
            isActive: true,
            options: [
              { id: "opt_4", label: "4 pcs", price: 0, priceType: "fixed", isAvailable: true },
              { id: "opt_8", label: "8 pcs", price: 60, priceType: "fixed", isAvailable: true },
            ],
          },
        ],
      },
      {
        name: "Paneer Steamed Momos",
        description: "Steamed momos filled with soft paneer.",
        price: 75,
        isVeg: true,
        image: u("photo-1496116218417-1a781b1c416c"),
        customizations: [
          {
            id: "grp_size2",
            name: "Size",
            type: "single",
            required: true,
            isActive: true,
            options: [
              { id: "opt_4_2", label: "4 pcs", price: 0, priceType: "fixed", isAvailable: true },
              { id: "opt_8_2", label: "8 pcs", price: 74, priceType: "fixed", isAvailable: true },
            ],
          },
        ],
      },
      {
        name: "Fried Crunchy Veg Momos (8 pcs)",
        description: "Crispy fried veggie momos.",
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
        image: u("photo-1623341214825-9f4f963727da"),
        customizations: [
          {
            id: "grp_size3",
            name: "Size",
            type: "single",
            required: true,
            isActive: true,
            options: [
              { id: "opt_4_3", label: "4 pcs", price: 0, priceType: "fixed", isAvailable: true },
              { id: "opt_8_3", label: "8 pcs", price: 79, priceType: "fixed", isAvailable: true },
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
      { name: "Margherita Pizza", description: "Classic cheese and tomato base pizza.", price: 199, isVeg: true, image: u("photo-1565299624946-b28f40a0ae38") },
      { name: "Golden Fresh Supreme Pizza", description: "Loaded with golden corn and fresh veggies.", price: 249, isVeg: true, image: u("photo-1565299624946-b28f40a0ae38") },
      { name: "Corn & Capsicum Carnival Pizza", description: "Sweet corn and crunchy capsicum pizza.", price: 249, isVeg: true, image: u("photo-1565299624946-b28f40a0ae38") },
      { name: "Paneer Overload Delight Pizza", description: "Overloaded paneer special pizza.", price: 299, isVeg: true, image: u("photo-1565299624946-b28f40a0ae38") },
      { name: "Farmao Special Pizza", description: "Our chef's signature loaded pizza.", price: 299, isVeg: true, image: u("photo-1565299624946-b28f40a0ae38") },
    ],
  },
  {
    name: "🍝 Pasta & Continental",
    image: u("photo-1528735602780-2552fd46c7af"),
    items: [
      { name: "Red Arrabiata Pasta", description: "Tangy and spicy red tomato sauce pasta.", price: 249, isVeg: true, image: u("photo-1563245372-f21724e3856d") },
      { name: "Creamy White Cloud Pasta", description: "Rich and creamy white sauce pasta.", price: 299, isVeg: true, image: u("photo-1563245372-f21724e3856d") },
      { name: "Pink Fusion Pasta", description: "Perfect blend of red and white sauces.", price: 299, isVeg: true, image: u("photo-1563245372-f21724e3856d") },
    ],
  },
  {
    name: "🥖 Garlic Breads",
    image: u("photo-1528735602780-2552fd46c7af"),
    items: [
      { name: "Farmao Classic Garlic Bread", description: "Freshly baked garlic bread.", price: 199, isVeg: true, image: u("photo-1528735602780-2552fd46c7af") },
      { name: "Corn & Cheese Garlic Bread", description: "Garlic bread with sweet corn and cheese.", price: 199, isVeg: true, image: u("photo-1528735602780-2552fd46c7af") },
      { name: "Tandoori Paneer Stuffed Garlic Bread", description: "Stuffed with spicy tandoori paneer.", price: 249, isVeg: true, image: u("photo-1528735602780-2552fd46c7af") },
    ],
  },
  {
    name: "🍔 Burgers",
    image: u("photo-1568901346375-23c9450c58cd"),
    items: [
      { name: "Cheese Burst Veggie Burger", description: "Veggie patty overflowing with cheese.", price: 149, isVeg: true, image: u("photo-1568901346375-23c9450c58cd") },
      { name: "Masala Crunch Burger", description: "Spicy and crunchy masala patty burger.", price: 139, isVeg: true, image: u("photo-1568901346375-23c9450c58cd") },
      { name: "Tandoori Paneer King Burger", description: "Burger with a large tandoori paneer slab.", price: 199, isVeg: true, image: u("photo-1568901346375-23c9450c58cd") },
      { name: "Double Decker Veg Classic Burger", description: "Two veg patties, double the fun.", price: 199, isVeg: true, image: u("photo-1568901346375-23c9450c58cd") },
    ],
  },
  {
    name: "🍟 Fries",
    image: u("photo-1576107232684-1279f3908594"),
    items: [
      { name: "Classic Golden Salted Fries", description: "Crispy salted french fries.", price: 129, isVeg: true, image: u("photo-1576107232684-1279f3908594") },
      { name: "Peri Peri Thunder Fries", description: "Fries tossed in spicy peri peri.", price: 159, isVeg: true, image: u("photo-1576107232684-1279f3908594") },
      { name: "Cheese Loaded Fries", description: "Fries smothered in liquid cheese.", price: 199, isVeg: true, image: u("photo-1576107232684-1279f3908594") },
      { name: "Peri Peri with Cheese Fries", description: "Spicy peri peri and creamy cheese fries.", price: 199, isVeg: true, image: u("photo-1576107232684-1279f3908594") },
    ],
  },
  {
    name: "🥔 Chinese Mainland",
    image: u("photo-1585032226651-759b368d7246"),
    items: [
      { name: "Garlic Chilli Potato", description: "Potatoes tossed in garlic chilli sauce.", price: 199, isVeg: true, image: u("photo-1585032226651-759b368d7246") },
      { name: "Honey Chilli Potato", description: "Sweet and spicy honey glazed potatoes.", price: 249, isVeg: true, image: u("photo-1585032226651-759b368d7246") },
      { name: "Smoky Tossed Chilli Mushrooms", description: "Mushrooms wok-tossed with smoky flavors.", price: 299, isVeg: true, image: u("photo-1585032226651-759b368d7246") },
      { name: "Schezwan Tossed Chilli Paneer", description: "Spicy paneer chunks in schezwan sauce.", price: 299, isVeg: true, image: u("photo-1623341214825-9f4f963727da") },
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
    image: u("photo-1541658016709-82535e94bc69"),
    items: [
      { name: "Classic Cold Coffee", description: "Refreshing classic cold brewed coffee.", price: 199, isVeg: true, image: u("photo-1509042239860-f550ce710b93") },
      { name: "Vanilla Dream Shake", description: "Creamy vanilla milkshake.", price: 199, isVeg: true, image: u("photo-1541658016709-82535e94bc69") },
      { name: "Nutella Magic Shake", description: "Thick shake blended with real Nutella.", price: 249, isVeg: true, image: u("photo-1541658016709-82535e94bc69") },
      { name: "KitKat Blast Shake", description: "Crunchy KitKat pieces in chocolate shake.", price: 249, isVeg: true, image: u("photo-1541658016709-82535e94bc69") },
      { name: "Oreo Crush Shake", description: "Classic Oreo cookie shake.", price: 249, isVeg: true, image: u("photo-1541658016709-82535e94bc69") },
    ],
  },
  {
    name: "🍹 Mocktails",
    image: u("photo-1600271886742-f049cd451bba"),
    items: [
      { name: "Virgin Mojito Sparkle", description: "Classic mint and lime refreshing drink.", price: 149, isVeg: true, image: u("photo-1600271886742-f049cd451bba") },
      { name: "Blue Lagoon Wave Mocktail", description: "Tropical blue curacao cooler.", price: 149, isVeg: true, image: u("photo-1600271886742-f049cd451bba") },
      { name: "Mango Mint Refresher", description: "Sweet mango with a hint of fresh mint.", price: 149, isVeg: true, image: u("photo-1600271886742-f049cd451bba") },
      { name: "Green Apple Fizz Mocktail", description: "Crisp and bubbly green apple drink.", price: 149, isVeg: true, image: u("photo-1600271886742-f049cd451bba") },
      { name: "Kiwi Cooler Pop Mocktail", description: "Tangy and sweet kiwi cooler.", price: 149, isVeg: true, image: u("photo-1600271886742-f049cd451bba") },
      { name: "Orange Sunrise Twist Mocktail", description: "Citrusy orange mocktail.", price: 149, isVeg: true, image: u("photo-1600271886742-f049cd451bba") },
    ],
  },
  {
    name: "☕ Hot Beverages",
    image: u("photo-1571934811356-5cc061b6821f"),
    items: [
      { name: "Farmao Special Hot Chocolate", description: "Rich, creamy, and decadent hot chocolate.", price: 149, isVeg: true, image: u("photo-1571934811356-5cc061b6821f") },
    ],
  },
  {
    name: "⭐ Chef's Picks",
    image: u("photo-1565299624946-b28f40a0ae38"),
    items: [
      { name: "Creamy White Cloud Pasta", description: "Rich and creamy white sauce pasta.", price: 299, isVeg: true, image: u("photo-1563245372-f21724e3856d") },
      { name: "Farmao Special Pizza", description: "Our chef's signature loaded pizza.", price: 299, isVeg: true, image: u("photo-1565299624946-b28f40a0ae38") },
      { name: "Masala Crunch Burger", description: "Spicy and crunchy masala patty burger.", price: 139, isVeg: true, image: u("photo-1568901346375-23c9450c58cd") },
      { name: "Corn & Cheese Garlic Bread", description: "Garlic bread with sweet corn and cheese.", price: 199, isVeg: true, image: u("photo-1528735602780-2552fd46c7af") },
      { name: "Oreo Crush Shake", description: "Classic Oreo cookie shake.", price: 249, isVeg: true, image: u("photo-1541658016709-82535e94bc69") },
    ],
  },
  {
    name: "🥣 Extras",
    image: u("photo-1601050690597-df0568f70950"),
    items: [
      { name: "Cheesy Dip", description: "Extra side of cheesy dip.", price: 20, isVeg: true, image: u("photo-1601050690597-df0568f70950") },
      { name: "Tandoori Dip", description: "Spicy tandoori flavored dip.", price: 20, isVeg: true, image: u("photo-1601050690597-df0568f70950") },
      { name: "Chipotle Dip", description: "Smoky chipotle mayo dip.", price: 20, isVeg: true, image: u("photo-1601050690597-df0568f70950") },
      { name: "Salsa Dip", description: "Tangy tomato salsa dip.", price: 20, isVeg: true, image: u("photo-1601050690597-df0568f70950") },
    ],
  },
  {
    name: "🍗 Non-Veg",
    image: u("photo-1623341214825-9f4f963727da"),
    items: [
      { name: "Chicken Nuggets", description: "Crispy bite-sized chicken nuggets.", price: 249, isVeg: false, image: u("photo-1623341214825-9f4f963727da") },
    ],
  },
];
