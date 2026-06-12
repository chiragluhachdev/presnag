import mongoose from "mongoose";
import { connectDB } from "./config/db";
import { Vendor } from "./models/Vendor";
import { Admin } from "./models/Admin";
import { MenuCategory } from "./models/MenuCategory";
import { MenuItem } from "./models/MenuItem";
import { Order } from "./models/Order";
import { Coupon } from "./models/Coupon";
import { hashPassword } from "./utils/auth";
import { vendorsToSeed } from "./seedvendors";

async function seed() {
  await connectDB();
  const targetSlug = process.argv[2];
  const mode = process.argv[3]; // e.g., "menu"
  
  let vendors = vendorsToSeed;
  
  if (targetSlug) {
    vendors = vendorsToSeed.filter((v) => v.vendor.slug === targetSlug);
    if (vendors.length === 0) {
      console.error(`\n[seed] ❌ Vendor with slug "${targetSlug}" not found in seed data.`);
      console.log(`[seed] ℹ️  Available vendor slugs are:`);
      vendorsToSeed.forEach(v => console.log(`       👉 ${v.vendor.slug} (${v.vendor.name})`));
      console.log("");
      process.exit(1);
    }
    console.log(`[seed] Specific vendor mode: ${targetSlug} (Mode: ${mode || 'full'})`);
    
    // Find existing vendor to delete their associated data
    const existingVendor = await Vendor.findOne({ slug: targetSlug });
    if (existingVendor) {
      if (mode === "menu") {
        console.log(`[seed] Clearing ONLY menu data for ${targetSlug}...`);
        await Promise.all([
          MenuCategory.deleteMany({ vendorId: existingVendor._id }),
          MenuItem.deleteMany({ vendorId: existingVendor._id }),
        ]);
      } else {
        console.log(`[seed] Clearing ALL existing data for ${targetSlug}...`);
        await Promise.all([
          Vendor.deleteOne({ _id: existingVendor._id }),
          MenuCategory.deleteMany({ vendorId: existingVendor._id }),
          MenuItem.deleteMany({ vendorId: existingVendor._id }),
          Coupon.deleteMany({ vendorId: existingVendor._id }),
        ]);
      }
    }
  } else {
    console.log("[seed] clearing all collections...");
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
  }

  for (const vData of vendors) {
    let vendor;
    
    if (mode === "menu") {
      vendor = await Vendor.findOne({ slug: vData.vendor.slug });
      if (!vendor) {
        console.error(`\n[seed] ❌ Cannot seed menu only: Vendor ${vData.vendor.slug} not found in DB.`);
        continue;
      }
    } else {
      const passwordHash = await hashPassword(vData.vendor.password);
      const { password, ...vendorInfo } = vData.vendor;
      
      vendor = await Vendor.create({
        ...vendorInfo,
        passwordHash,
      });
    }

    let sort = 0;
    for (const cat of vData.menuData) {
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

    if (mode !== "menu" && vData.coupons) {
      for (const coupon of vData.coupons) {
        await Coupon.create({
          ...coupon,
          vendorId: vendor.id,
        });
      }
    }
  }

  console.log(`\n[seed] done ✅  (${vendors.length} shop(s), 0 orders)`);
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
