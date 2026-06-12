import { Router } from "express";
import { Vendor } from "../models/Vendor";
import { MenuCategory } from "../models/MenuCategory";
import { MenuItem } from "../models/MenuItem";
import { Order } from "../models/Order";
import { Coupon } from "../models/Coupon";
import { getSettings } from "../models/Setting";
import { asyncH, HttpError } from "../middleware/error";
import { genOrderNumber, isStoreOpen } from "../utils/helpers";
import { emitNewOrder } from "../realtime/io";

const router = Router();

// Public platform settings (e.g. maintenance-mode flag for the storefront).
router.get(
  "/settings",
  asyncH(async (_req, res) => {
    const settings = await getSettings();
    res.json({
      maintenanceMode: settings.maintenanceMode,
      paymentProvider: settings.paymentProvider,
      demoBanner: settings.demoBanner,
    });
  })
);

// List active vendors with optional search + category filter.
router.get(
  "/vendors",
  asyncH(async (req, res) => {
    const { q, category } = req.query;
    const filter: Record<string, unknown> = { status: "active" };
    if (category && category !== "All") filter.category = category;

    if (q) {
      const rx = { $regex: String(q), $options: "i" };
      // Match by vendor name, category, OR by having a menu item that matches.
      const itemVendorIds = await MenuItem.find({ name: rx }).distinct("vendorId");
      filter.$or = [{ name: rx }, { category: rx }, { _id: { $in: itemVendorIds } }];
    }

    const vendors = await Vendor.find(filter)
      .select("name slug logo banner category isOpen openTime closeTime prepTime address description lat lng createdAt isFeatured featuredOrder")
      .lean()
      .sort({ isFeatured: -1, featuredOrder: 1, createdAt: -1 });

    const mappedVendors = vendors.map((v) => ({
      ...v,
      isOpen: isStoreOpen(v.isOpen as boolean, v.openTime as string, v.closeTime as string),
    }));

    res.json(mappedVendors);
  })
);

// Vendor detail + menu (grouped by category).
router.get(
  "/vendors/:slug",
  asyncH(async (req, res) => {
    // Never expose payout/KYC/PII on the public storefront.
    const vendor = await Vendor.findOne({ slug: req.params.slug, status: "active" })
      .select("-passwordHash -managedPayout -cashfreeBeneficiaryId -cashfreeVendorId -kycStatus -fssaiLicense -ownerName -email")
      .lean();
    if (!vendor) throw new HttpError(404, "Vendor not found");

    vendor.isOpen = isStoreOpen(vendor.isOpen as boolean, vendor.openTime as string, vendor.closeTime as string);
    const categories = await MenuCategory.find({ vendorId: vendor._id }).sort({ sortOrder: 1 });
    const items = await MenuItem.find({ vendorId: vendor._id });
    res.json({ vendor, categories, items });
  })
);

// Validate a coupon for a vendor.
router.post(
  "/vendors/:slug/coupon",
  asyncH(async (req, res) => {
    const { code, subtotal } = req.body;
    const vendor = await Vendor.findOne({ slug: req.params.slug });
    if (!vendor) throw new HttpError(404, "Vendor not found");
    const coupon = await Coupon.findOne({
      vendorId: vendor.id,
      code: String(code || "").toUpperCase(),
      isActive: true,
    });
    if (!coupon) throw new HttpError(404, "Invalid coupon");
    if (coupon.expiry && coupon.expiry < new Date()) throw new HttpError(400, "Coupon expired");
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new HttpError(400, "Coupon usage limit reached");
    }
    const discount =
      coupon.type === "percent"
        ? Math.round((Number(subtotal) * coupon.value) / 100)
        : Math.min(coupon.value, Number(subtotal));
    res.json({ code: coupon.code, type: coupon.type, value: coupon.value, discount });
  })
);

// Create an order.
router.post(
  "/orders",
  asyncH(async (req, res) => {
    const { slug, customerName, customerPhone, note, orderType, items, paymentMethod, couponCode } = req.body;
    if (!slug || !customerName || !customerPhone || !Array.isArray(items) || items.length === 0) {
      throw new HttpError(400, "Missing required order fields");
    }
    const vendor = await Vendor.findOne({ slug, status: "active" });
    if (!vendor) throw new HttpError(404, "Vendor not found");
    if (!vendor.isOpen) {
      throw new HttpError(400, "This store is currently closed and not accepting orders.");
    }

    // Re-price from DB to avoid trusting client prices.
    const dbItems = await MenuItem.find({
      _id: { $in: items.map((i: any) => i.itemId) },
      vendorId: vendor.id,
    });
    const priceMap = new Map(dbItems.map((d) => [d.id, d]));

    let subtotal = 0;
    const orderItems = items.map((i: any) => {
      const db = priceMap.get(String(i.itemId));
      if (!db) throw new HttpError(400, `Item not available: ${i.itemId}`);
      if (!db.isAvailable) throw new HttpError(400, `Item unavailable: ${db.name}`);
      const qty = Math.max(1, Number(i.qty) || 1);

      // Validate & price chosen add-ons against the item's real customizations
      // (server-authoritative — the client can't inject arbitrary add-on prices).
      const addons: { group: string; label: string; price: number }[] = [];
      let addonTotal = 0;
      const selected = Array.isArray(i.selectedOptions) ? i.selectedOptions : [];
      for (const sel of selected) {
        const group = (db.customizations || []).find((g: any) => g.name === sel.group);
        const opt = group?.options.find((o: any) => o.label === sel.label);
        if (opt) {
          addons.push({ group: group!.name, label: opt.label, price: opt.price });
          addonTotal += opt.price;
        }
      }

      const unitPrice = db.price + addonTotal;
      subtotal += unitPrice * qty;
      return {
        itemId: db.id,
        name: db.name,
        price: unitPrice,
        qty,
        instructions: i.instructions || "",
        addons,
      };
    });

    // Apply coupon if provided.
    let discount = 0;
    let appliedCode = "";
    if (couponCode) {
      const coupon = await Coupon.findOne({
        vendorId: vendor.id,
        code: String(couponCode).toUpperCase(),
        isActive: true,
      });
      if (coupon && (!coupon.expiry || coupon.expiry >= new Date())) {
        discount =
          coupon.type === "percent"
            ? Math.round((subtotal * coupon.value) / 100)
            : Math.min(coupon.value, subtotal);
        appliedCode = coupon.code;
        coupon.usedCount += 1;
        await coupon.save();
      }
    }

    const tax = 0; // No extra charges — customer pays exactly the item total (minus any discount).
    const total = subtotal - discount;
    const method = ["CASHFREE", "RAZORPAY", "COD"].includes(paymentMethod) ? paymentMethod : "CASHFREE";

    const order = await Order.create({
      vendorId: vendor.id,
      orderNumber: genOrderNumber(),
      customerName,
      customerPhone,
      note: note || "",
      orderType: orderType === "TAKE_AWAY" ? "TAKE_AWAY" : "DINE_IN",
      items: orderItems,
      subtotal,
      tax,
      discount,
      total,
      couponCode: appliedCode,
      paymentMethod: method,
      paymentStatus: "pending", // Confirmed via Cashfree webhook (or demo-confirm).
      status: "received",
      pickupTime: `${vendor.prepTime} min`,
    });

    // The vendor is alerted only after payment succeeds (payment webhook /
    // demo-confirm calls emitNewOrder). COD orders are alerted immediately.
    if (method === "COD") emitNewOrder(vendor.id, order);
    res.status(201).json(order);
  })
);

// Track an order by number.
router.get(
  "/orders/:orderNumber",
  asyncH(async (req, res) => {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber }).populate(
      "vendorId",
      "name slug phone address logo"
    );
    if (!order) throw new HttpError(404, "Order not found");
    res.json(order);
  })
);

export default router;
