const u = (id: string, w = 600) =>
  `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

const createHalfFullSizes = (h: number, f: number) => [
  {
    id: "grp_size",
    name: "Size",
    type: "single",
    required: true,
    isActive: true,
    options: [
      { id: "opt_h", label: "Half", price: 0, priceType: "fixed", isAvailable: true },
      { id: "opt_f", label: "Full", price: f - h, priceType: "fixed", isAvailable: true },
    ],
  }
];

const createPcsSizes = (p2: number, p4: number) => [
  {
    id: "grp_size",
    name: "Quantity",
    type: "single",
    required: true,
    isActive: true,
    options: [
      { id: "opt_2", label: "2 pcs", price: 0, priceType: "fixed", isAvailable: true },
      { id: "opt_4", label: "4 pcs", price: p4 - p2, priceType: "fixed", isAvailable: true },
    ],
  }
];

export const menuData = [
  {
    name: "🍛 Thali",
    image: u("photo-1626776876729-bab4369a5a5a"),
    items: [
      { name: "Chaska Thali", description: "Includes Dal Makhani, Shahi Paneer, Plain Rice, Raita, 2 Butter Roti / 1 Butter Naan", price: 180, isVeg: true, image: u("photo-1626776876729-bab4369a5a5a"), customizations: [] },
      { name: "Chaska Special Thali", description: "Includes Dal Makhani, Paneer Dish, Veg Biryani, Tawa Tikka Masala, 1 Butter Naan, 1 Laccha Paratha", price: 250, isVeg: true, image: u("photo-1626776876729-bab4369a5a5a"), customizations: [] },
      { name: "Chaska Special Platter", description: "Includes Malai Tikka (4 pcs), Paneer Tikka (4 pcs), Haryali Tikka (4 pcs), Soya Tikka (4 pcs)", price: 350, isVeg: true, image: u("photo-1626776876729-bab4369a5a5a"), customizations: [] },
    ]
  },
  {
    name: "🍚 Rice",
    image: u("photo-1512058564366-18510be2db19"),
    items: [
      { name: "Plain Rice", description: "", price: 60, isVeg: true, image: u("photo-1512058564366-18510be2db19"), customizations: createHalfFullSizes(60, 100) },
      { name: "Jeera Rice", description: "", price: 70, isVeg: true, image: u("photo-1512058564366-18510be2db19"), customizations: createHalfFullSizes(70, 120) },
      { name: "Fried Rice", description: "", price: 70, isVeg: true, image: u("photo-1512058564366-18510be2db19"), customizations: createHalfFullSizes(70, 130) },
      { name: "Paneer Fried Rice", description: "", price: 80, isVeg: true, image: u("photo-1512058564366-18510be2db19"), customizations: createHalfFullSizes(80, 140) },
      { name: "Special Veg Biryani", description: "", price: 110, isVeg: true, image: u("photo-1512058564366-18510be2db19"), customizations: createHalfFullSizes(110, 180) },
    ]
  },
  {
    name: "🥗 Raita & Salad",
    image: u("photo-1512621776951-a57141f2eefd"),
    items: [
      { name: "Boondi Raita", description: "", price: 70, isVeg: true, image: u("photo-1512621776951-a57141f2eefd"), customizations: [] },
      { name: "Onion Raita", description: "", price: 80, isVeg: true, image: u("photo-1512621776951-a57141f2eefd"), customizations: [] },
      { name: "Mix Raita", description: "", price: 90, isVeg: true, image: u("photo-1512621776951-a57141f2eefd"), customizations: [] },
      { name: "Khira Raita", description: "", price: 90, isVeg: true, image: u("photo-1512621776951-a57141f2eefd"), customizations: [] },
      { name: "Green Salad", description: "", price: 80, isVeg: true, image: u("photo-1512621776951-a57141f2eefd"), customizations: [] },
    ]
  },
  {
    name: "🔥 Tandoori Starters",
    image: u("photo-1599487488170-d11ec9c172f0"),
    items: [
      { name: "Dahi Ke Sholey", description: "", price: 140, isVeg: true, image: u("photo-1599487488170-d11ec9c172f0"), customizations: createHalfFullSizes(140, 240) },
      { name: "KFC Malai Chaap", description: "", price: 140, isVeg: true, image: u("photo-1599487488170-d11ec9c172f0"), customizations: createHalfFullSizes(140, 240) },
      { name: "KFC Masala Chaap", description: "", price: 140, isVeg: true, image: u("photo-1599487488170-d11ec9c172f0"), customizations: createHalfFullSizes(140, 240) },
      { name: "Afghani Chaap", description: "", price: 140, isVeg: true, image: u("photo-1599487488170-d11ec9c172f0"), customizations: createHalfFullSizes(140, 240) },
      { name: "Achari Chaap", description: "", price: 140, isVeg: true, image: u("photo-1599487488170-d11ec9c172f0"), customizations: createHalfFullSizes(140, 240) },
      { name: "Soya Bean Tikka", description: "", price: 140, isVeg: true, image: u("photo-1599487488170-d11ec9c172f0"), customizations: createHalfFullSizes(140, 240) },
      { name: "Malai Soya Chaap", description: "", price: 140, isVeg: true, image: u("photo-1599487488170-d11ec9c172f0"), customizations: createHalfFullSizes(140, 240) },
      { name: "Haryali Chaap", description: "", price: 140, isVeg: true, image: u("photo-1599487488170-d11ec9c172f0"), customizations: createHalfFullSizes(140, 240) },
      { name: "Masala Chaap", description: "", price: 140, isVeg: true, image: u("photo-1599487488170-d11ec9c172f0"), customizations: createHalfFullSizes(140, 240) },
      { name: "Stuffed Afghani Chaap", description: "", price: 140, isVeg: true, image: u("photo-1599487488170-d11ec9c172f0"), customizations: createHalfFullSizes(140, 240) },
      { name: "Paneer Tikka", description: "", price: 150, isVeg: true, image: u("photo-1599487488170-d11ec9c172f0"), customizations: createHalfFullSizes(150, 270) },
      { name: "Mushroom Tikka", description: "", price: 160, isVeg: true, image: u("photo-1599487488170-d11ec9c172f0"), customizations: createHalfFullSizes(160, 270) },
      { name: "Kurkuri Fried Chaap", description: "", price: 140, isVeg: true, image: u("photo-1599487488170-d11ec9c172f0"), customizations: createHalfFullSizes(140, 240) },
      { name: "Soya Seekh Kabab", description: "", price: 140, isVeg: true, image: u("photo-1599487488170-d11ec9c172f0"), customizations: createHalfFullSizes(140, 240) },
      { name: "Veg Drumstick (2pcs/4pcs)", description: "", price: 130, isVeg: true, image: u("photo-1599487488170-d11ec9c172f0"), customizations: createPcsSizes(130, 240) },
      { name: "Crispy Paneer Finger", description: "", price: 140, isVeg: true, image: u("photo-1599487488170-d11ec9c172f0"), customizations: createHalfFullSizes(140, 240) },
    ]
  },
  {
    name: "🍽️ Combos",
    image: u("photo-1544025162-831e5fdf56fc"),
    items: [
      { name: "Veg Noodles/Fried Rice + Veg Manchurian", description: "", price: 150, isVeg: true, image: u("photo-1544025162-831e5fdf56fc"), customizations: [] },
      { name: "Veg Noodles/Fried Rice + Chilli Paneer", description: "", price: 160, isVeg: true, image: u("photo-1544025162-831e5fdf56fc"), customizations: [] },
      { name: "Spring Roll (1) + Dahi Ke Sholey (1) + Kurkure Paneer Momos (2)", description: "", price: 160, isVeg: true, image: u("photo-1544025162-831e5fdf56fc"), customizations: [] },
      { name: "Tawa Chaap + 2 Rumali", description: "", price: 130, isVeg: true, image: u("photo-1544025162-831e5fdf56fc"), customizations: [] },
      { name: "Shahi Paneer + Dal Makhni + 1 Butter Naan", description: "", price: 160, isVeg: true, image: u("photo-1544025162-831e5fdf56fc"), customizations: [] },
      { name: "Kadhai Chaap + Dal Makhni + 2 Butter Roti", description: "", price: 170, isVeg: true, image: u("photo-1544025162-831e5fdf56fc"), customizations: [] },
      { name: "Tawa Mushroom + 1 Laccha Paratha", description: "", price: 140, isVeg: true, image: u("photo-1544025162-831e5fdf56fc"), customizations: [] },
    ]
  },
  {
    name: "🍲 Tadke Se",
    image: u("photo-1585937421612-70a008356fbe"),
    items: [
      { name: "Special Dal Makhani", description: "", price: 130, isVeg: true, image: u("photo-1585937421612-70a008356fbe"), customizations: createHalfFullSizes(130, 200) },
      { name: "Special Dal Tadka (Yellow)", description: "", price: 100, isVeg: true, image: u("photo-1585937421612-70a008356fbe"), customizations: createHalfFullSizes(100, 170) },
      { name: "Dhaba Dal Fry", description: "", price: 100, isVeg: true, image: u("photo-1585937421612-70a008356fbe"), customizations: createHalfFullSizes(100, 180) },
      { name: "Mixed Vegetables", description: "", price: 130, isVeg: true, image: u("photo-1585937421612-70a008356fbe"), customizations: createHalfFullSizes(130, 230) },
      { name: "Jeera Aloo", description: "", price: 100, isVeg: true, image: u("photo-1585937421612-70a008356fbe"), customizations: createHalfFullSizes(100, 150) },
    ]
  },
  {
    name: "🍛 Handi Se",
    image: u("photo-1565557623262-b51c2513a641"),
    items: [
      { name: "Shahi Paneer", description: "", price: 130, isVeg: true, image: u("photo-1565557623262-b51c2513a641"), customizations: createHalfFullSizes(130, 230) },
      { name: "Kadhai Paneer", description: "", price: 130, isVeg: true, image: u("photo-1565557623262-b51c2513a641"), customizations: createHalfFullSizes(130, 230) },
      { name: "Palak Paneer", description: "", price: 130, isVeg: true, image: u("photo-1565557623262-b51c2513a641"), customizations: createHalfFullSizes(130, 230) },
      { name: "Matar Paneer", description: "", price: 130, isVeg: true, image: u("photo-1565557623262-b51c2513a641"), customizations: createHalfFullSizes(130, 230) },
      { name: "Paneer Do Pyaza", description: "", price: 130, isVeg: true, image: u("photo-1565557623262-b51c2513a641"), customizations: createHalfFullSizes(130, 230) },
      { name: "Paneer Lababdar", description: "", price: 130, isVeg: true, image: u("photo-1565557623262-b51c2513a641"), customizations: createHalfFullSizes(130, 230) },
      { name: "Paneer Dhaniya Adraki", description: "", price: 130, isVeg: true, image: u("photo-1565557623262-b51c2513a641"), customizations: createHalfFullSizes(130, 240) },
      { name: "Tawa Paneer Masala", description: "", price: 140, isVeg: true, image: u("photo-1565557623262-b51c2513a641"), customizations: createHalfFullSizes(140, 230) },
      { name: "Paneer Butter Masala", description: "", price: 130, isVeg: true, image: u("photo-1565557623262-b51c2513a641"), customizations: createHalfFullSizes(130, 240) },
      { name: "Rara Paneer", description: "", price: 130, isVeg: true, image: u("photo-1565557623262-b51c2513a641"), customizations: createHalfFullSizes(130, 230) },
      { name: "Paneer Bhurji", description: "", price: 160, isVeg: true, image: u("photo-1565557623262-b51c2513a641"), customizations: createHalfFullSizes(160, 260) },
      { name: "Paneer Rogan Josh", description: "", price: 130, isVeg: true, image: u("photo-1565557623262-b51c2513a641"), customizations: createHalfFullSizes(130, 230) },
      { name: "Paneer Tikka Butter Masala", description: "", price: 140, isVeg: true, image: u("photo-1565557623262-b51c2513a641"), customizations: createHalfFullSizes(140, 240) },
    ]
  },
  {
    name: "🍛 Shahi Tadka",
    image: u("photo-1585937421612-70a008356fbe"),
    items: [
      { name: "Soya Tawa Chaap", description: "", price: 160, isVeg: true, image: u("photo-1585937421612-70a008356fbe"), customizations: createHalfFullSizes(160, 270) },
      { name: "Shahi Chaap", description: "", price: 130, isVeg: true, image: u("photo-1585937421612-70a008356fbe"), customizations: createHalfFullSizes(130, 230) },
      { name: "Kadhai Chaap", description: "", price: 130, isVeg: true, image: u("photo-1585937421612-70a008356fbe"), customizations: createHalfFullSizes(130, 230) },
      { name: "Chaap Lababdar", description: "", price: 130, isVeg: true, image: u("photo-1585937421612-70a008356fbe"), customizations: createHalfFullSizes(130, 230) },
      { name: "Chaap Dhaniya Adraki", description: "", price: 130, isVeg: true, image: u("photo-1585937421612-70a008356fbe"), customizations: createHalfFullSizes(130, 230) },
      { name: "Keema Chaap Masala", description: "", price: 140, isVeg: true, image: u("photo-1585937421612-70a008356fbe"), customizations: createHalfFullSizes(140, 230) },
      { name: "Rara Chaap", description: "", price: 130, isVeg: true, image: u("photo-1585937421612-70a008356fbe"), customizations: createHalfFullSizes(130, 230) },
      { name: "Special Rogan Josh", description: "", price: 130, isVeg: true, image: u("photo-1585937421612-70a008356fbe"), customizations: createHalfFullSizes(130, 230) },
      { name: "Tawa Mix Masala", description: "", price: 140, isVeg: true, image: u("photo-1585937421612-70a008356fbe"), customizations: createHalfFullSizes(140, 240) },
      { name: "Malai Kofta", description: "", price: 130, isVeg: true, image: u("photo-1585937421612-70a008356fbe"), customizations: createHalfFullSizes(130, 240) },
      { name: "Khum Palak", description: "", price: 130, isVeg: true, image: u("photo-1585937421612-70a008356fbe"), customizations: createHalfFullSizes(130, 230) },
      { name: "Kadhai Mushroom", description: "", price: 130, isVeg: true, image: u("photo-1585937421612-70a008356fbe"), customizations: createHalfFullSizes(130, 240) },
      { name: "Matar Mushroom", description: "", price: 130, isVeg: true, image: u("photo-1585937421612-70a008356fbe"), customizations: createHalfFullSizes(130, 240) },
      { name: "Tawa Mushroom", description: "", price: 140, isVeg: true, image: u("photo-1585937421612-70a008356fbe"), customizations: createHalfFullSizes(140, 240) },
      { name: "Mushroom Dhaniya Adraki", description: "", price: 130, isVeg: true, image: u("photo-1585937421612-70a008356fbe"), customizations: createHalfFullSizes(130, 240) },
    ]
  },
  {
    name: "🍜 Noodles",
    image: u("photo-1585032226651-759b368d7246"),
    items: [
      { name: "Veg Chowmein", description: "", price: 70, isVeg: true, image: u("photo-1585032226651-759b368d7246"), customizations: createHalfFullSizes(70, 110) },
      { name: "Singapuri Chowmein", description: "", price: 80, isVeg: true, image: u("photo-1585032226651-759b368d7246"), customizations: createHalfFullSizes(80, 130) },
      { name: "Paneer Chowmein", description: "", price: 80, isVeg: true, image: u("photo-1585032226651-759b368d7246"), customizations: createHalfFullSizes(80, 120) },
      { name: "Hakka Noodles", description: "", price: 85, isVeg: true, image: u("photo-1585032226651-759b368d7246"), customizations: createHalfFullSizes(85, 130) },
      { name: "Chilli Garlic Noodles", description: "", price: 80, isVeg: true, image: u("photo-1585032226651-759b368d7246"), customizations: createHalfFullSizes(80, 130) },
      { name: "Soya Noodles", description: "", price: 90, isVeg: true, image: u("photo-1585032226651-759b368d7246"), customizations: createHalfFullSizes(90, 160) },
    ]
  },
  {
    name: "🥡 Chinese",
    image: u("photo-1525755662778-989d0524087e"),
    items: [
      { name: "Spring Roll", description: "", price: 60, isVeg: true, image: u("photo-1525755662778-989d0524087e"), customizations: createHalfFullSizes(60, 110) },
      { name: "Chilli Potato", description: "", price: 80, isVeg: true, image: u("photo-1525755662778-989d0524087e"), customizations: createHalfFullSizes(80, 140) },
      { name: "French Fries", description: "", price: 60, isVeg: true, image: u("photo-1525755662778-989d0524087e"), customizations: createHalfFullSizes(60, 100) },
      { name: "Honey Chilli Potato", description: "", price: 90, isVeg: true, image: u("photo-1525755662778-989d0524087e"), customizations: createHalfFullSizes(90, 150) },
      { name: "Veg Manchurian (Dry/Gravy)", description: "", price: 130, isVeg: true, image: u("photo-1525755662778-989d0524087e"), customizations: createHalfFullSizes(130, 200) },
      { name: "Chilli Paneer (Dry/Gravy)", description: "", price: 130, isVeg: true, image: u("photo-1525755662778-989d0524087e"), customizations: createHalfFullSizes(130, 210) },
      { name: "Chilli Soyabean (Dry/Gravy)", description: "", price: 130, isVeg: true, image: u("photo-1525755662778-989d0524087e"), customizations: createHalfFullSizes(130, 210) },
      { name: "Chilli Mushroom (Dry/Gravy)", description: "", price: 140, isVeg: true, image: u("photo-1525755662778-989d0524087e"), customizations: createHalfFullSizes(140, 220) },
      { name: "Kurkure Spring Roll", description: "", price: 80, isVeg: true, image: u("photo-1525755662778-989d0524087e"), customizations: createHalfFullSizes(80, 140) },
    ]
  },
  {
    name: "🌯 Rolls",
    image: u("photo-1626700051175-6818013e1d4f"),
    items: [
      { name: "Afghani Roll", description: "", price: 130, isVeg: true, image: u("photo-1626700051175-6818013e1d4f"), customizations: createPcsSizes(130, 240) },
      { name: "Soya Tikka Roll", description: "", price: 130, isVeg: true, image: u("photo-1626700051175-6818013e1d4f"), customizations: createPcsSizes(130, 240) },
      { name: "Paneer Tikka Roll", description: "", price: 130, isVeg: true, image: u("photo-1626700051175-6818013e1d4f"), customizations: createPcsSizes(130, 240) },
      { name: "Haryali Tikka Roll", description: "", price: 130, isVeg: true, image: u("photo-1626700051175-6818013e1d4f"), customizations: createPcsSizes(130, 240) },
      { name: "Achari Roll", description: "", price: 130, isVeg: true, image: u("photo-1626700051175-6818013e1d4f"), customizations: createPcsSizes(130, 240) },
      { name: "Malai Tikka Roll", description: "", price: 130, isVeg: true, image: u("photo-1626700051175-6818013e1d4f"), customizations: createPcsSizes(130, 240) },
      { name: "Boti Kabab Roll", description: "", price: 130, isVeg: true, image: u("photo-1626700051175-6818013e1d4f"), customizations: createPcsSizes(130, 240) },
      { name: "Stuffed Chaap Roll", description: "", price: 130, isVeg: true, image: u("photo-1626700051175-6818013e1d4f"), customizations: createPcsSizes(130, 240) },
    ]
  },
  {
    name: "🍞 Breads",
    image: u("photo-1509722747041-616f39b57569"),
    items: [
      { name: "Tandoori Roti", description: "", price: 12, isVeg: true, image: u("photo-1509722747041-616f39b57569"), customizations: [] },
      { name: "Butter Roti", description: "", price: 15, isVeg: true, image: u("photo-1509722747041-616f39b57569"), customizations: [] },
      { name: "Garlic Butter Roti", description: "", price: 25, isVeg: true, image: u("photo-1509722747041-616f39b57569"), customizations: [] },
      { name: "Rumali Roti", description: "", price: 13, isVeg: true, image: u("photo-1509722747041-616f39b57569"), customizations: [] },
      { name: "Onion Roti", description: "", price: 20, isVeg: true, image: u("photo-1509722747041-616f39b57569"), customizations: [] },
      { name: "Missi Roti", description: "", price: 35, isVeg: true, image: u("photo-1509722747041-616f39b57569"), customizations: [] },
      { name: "Onion Missi Roti", description: "", price: 40, isVeg: true, image: u("photo-1509722747041-616f39b57569"), customizations: [] },
      { name: "Plain Naan", description: "", price: 40, isVeg: true, image: u("photo-1509722747041-616f39b57569"), customizations: [] },
      { name: "Butter Naan", description: "", price: 45, isVeg: true, image: u("photo-1509722747041-616f39b57569"), customizations: [] },
      { name: "Garlic Naan", description: "", price: 55, isVeg: true, image: u("photo-1509722747041-616f39b57569"), customizations: [] },
      { name: "Laccha Paratha", description: "", price: 45, isVeg: true, image: u("photo-1509722747041-616f39b57569"), customizations: [] },
      { name: "Green Chilli Paratha", description: "", price: 50, isVeg: true, image: u("photo-1509722747041-616f39b57569"), customizations: [] },
      { name: "Aloo Naan / Paratha", description: "", price: 50, isVeg: true, image: u("photo-1509722747041-616f39b57569"), customizations: [] },
      { name: "Onion Naan / Paratha", description: "", price: 55, isVeg: true, image: u("photo-1509722747041-616f39b57569"), customizations: [] },
      { name: "Aloo Pyaz Naan / Paratha", description: "", price: 60, isVeg: true, image: u("photo-1509722747041-616f39b57569"), customizations: [] },
      { name: "Paneer Kulcha / Paratha", description: "", price: 70, isVeg: true, image: u("photo-1509722747041-616f39b57569"), customizations: [] },
      { name: "Onion Kulcha", description: "", price: 55, isVeg: true, image: u("photo-1509722747041-616f39b57569"), customizations: [] },
      { name: "Punjabi Keema Kulcha", description: "", price: 60, isVeg: true, image: u("photo-1509722747041-616f39b57569"), customizations: [] },
      { name: "Mix Paratha", description: "", price: 80, isVeg: true, image: u("photo-1509722747041-616f39b57569"), customizations: [] },
    ]
  },
  {
    name: "🥟 Momos (8 Pieces)",
    image: u("photo-1625220194771-7ebdea0b70b9"),
    items: [
      { name: "Veg Fried Momos", description: "8 Pieces", price: 100, isVeg: true, image: u("photo-1625220194771-7ebdea0b70b9"), customizations: [] },
      { name: "Paneer Fried Momos", description: "8 Pieces", price: 110, isVeg: true, image: u("photo-1625220194771-7ebdea0b70b9"), customizations: [] },
      { name: "Veg Tandoori Momos", description: "8 Pieces", price: 130, isVeg: true, image: u("photo-1625220194771-7ebdea0b70b9"), customizations: [] },
      { name: "Paneer Tandoori Momos", description: "8 Pieces", price: 140, isVeg: true, image: u("photo-1625220194771-7ebdea0b70b9"), customizations: [] },
      { name: "Veg Kurkure Momos", description: "8 Pieces", price: 140, isVeg: true, image: u("photo-1625220194771-7ebdea0b70b9"), customizations: [] },
      { name: "Paneer Kurkure Momos", description: "8 Pieces", price: 150, isVeg: true, image: u("photo-1625220194771-7ebdea0b70b9"), customizations: [] },
    ]
  }
];
