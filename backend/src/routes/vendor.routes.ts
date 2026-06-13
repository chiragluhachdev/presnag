import { Router } from "express";
import QRCode from "qrcode";
import { Vendor } from "../models/Vendor";
import { MenuCategory } from "../models/MenuCategory";
import { MenuItem } from "../models/MenuItem";
import { Order, ORDER_STATUSES } from "../models/Order";
import { Coupon } from "../models/Coupon";
import { CustomizationTemplate } from "../models/CustomizationTemplate";
import { authenticate, requireRole } from "../middleware/auth";
import { hashPassword, comparePassword } from "../utils/auth";
import { asyncH, HttpError } from "../middleware/error";
import { emitOrderStatus } from "../realtime/io";
import { env, cashfreePgEnabled } from "../config/env";
import { PLATFORM_FEE_PCT, platformFee, vendorNet } from "../config/constants";
import {
  createPayoutBeneficiary,
  createEasySplitVendor,
  last4,
  maskPan,
} from "../services/cashfree";

const router = Router();

router.use(authenticate, requireRole("VENDOR"));

const vid = (req: any) => req.user!.id as string;

// An order only "counts" (shown to the vendor, included in stats) once it is
// actually paid — or if it's a cash-on-pickup order. This prevents abandoned
// online checkouts (created but never paid) from appearing or inflating revenue.
const PAID_FILTER = { $or: [{ paymentStatus: "paid" }, { paymentMethod: "COD" }] };

// ---- Stall profile ----
router.get(
  "/me",
  asyncH(async (req, res) => {
    const vendor = await Vendor.findById(vid(req)).select("-passwordHash");
    if (!vendor) throw new HttpError(404, "Not found");
    res.json(vendor);
  })
);

router.put(
  "/me",
  asyncH(async (req, res) => {
    const allowed = [
      "name",
      "ownerName",
      "description",
      "address",
      "logo",
      "banner",
      "category",
      "openingHours",
      "openTime",
      "closeTime",
      "isOpen",
      "socialLinks",
      "prepTime",
      "fssaiLicense",
    ];
    const update: Record<string, unknown> = {};
    for (const k of allowed) if (k in req.body) update[k] = req.body[k];
    const vendor = await Vendor.findByIdAndUpdate(vid(req), update, { new: true }).select(
      "-passwordHash"
    );
    res.json(vendor);
  })
);

// Change own password (must supply the current password).
router.post(
  "/change-password",
  asyncH(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) throw new HttpError(400, "Current and new password required");
    if (String(newPassword).length < 6) throw new HttpError(400, "New password must be at least 6 characters");
    const vendor = await Vendor.findById(vid(req));
    if (!vendor) throw new HttpError(404, "Not found");
    if (!(await comparePassword(currentPassword, vendor.passwordHash))) {
      throw new HttpError(401, "Current password is incorrect");
    }
    vendor.passwordHash = await hashPassword(newPassword);
    await vendor.save();
    res.json({ ok: true });
  })
);

// Clear this vendor's entire order history (irreversible).
router.delete(
  "/orders",
  asyncH(async (req, res) => {
    const result = await Order.deleteMany({ vendorId: vid(req) });
    res.json({ ok: true, deleted: result.deletedCount });
  })
);

// ---- Dashboard stats ----
router.get(
  "/stats",
  asyncH(async (req, res) => {
    const vendorId = vid(req);
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [todayOrders, pending, completed, allOrders] = await Promise.all([
      Order.find({ vendorId, createdAt: { $gte: startOfDay }, ...PAID_FILTER }),
      Order.countDocuments({ vendorId, status: { $in: ["received", "accepted", "preparing"] }, ...PAID_FILTER }),
      Order.countDocuments({ vendorId, status: "collected", ...PAID_FILTER }),
      Order.find({ vendorId, status: { $ne: "cancelled" }, ...PAID_FILTER }),
    ]);

    const todayRevenue = todayOrders
      .filter((o) => o.status !== "cancelled")
      .reduce((s, o) => s + o.total, 0);

    // Top selling items across all orders.
    const counts = new Map<string, { name: string; qty: number; revenue: number }>();
    for (const o of allOrders) {
      for (const it of o.items) {
        const cur = counts.get(it.name) || { name: it.name, qty: 0, revenue: 0 };
        cur.qty += it.qty;
        cur.revenue += it.price * it.qty;
        counts.set(it.name, cur);
      }
    }
    const topItems = [...counts.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);

    res.json({
      todayOrdersCount: todayOrders.length,
      todayRevenue,
      pendingOrders: pending,
      completedOrders: completed,
      totalOrders: allOrders.length,
      totalRevenue: allOrders.reduce((s, o) => s + o.total, 0),
      topItems,
    });
  })
);

// ---- Orders ----
router.get(
  "/orders",
  asyncH(async (req, res) => {
    const { status } = req.query;
    const filter: Record<string, unknown> = { vendorId: vid(req), ...PAID_FILTER };
    if (status && status !== "all") filter.status = status;
    const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(200);
    res.json(orders);
  })
);

router.patch(
  "/orders/:id/status",
  asyncH(async (req, res) => {
    const { status, reason } = req.body;
    if (!ORDER_STATUSES.includes(status)) throw new HttpError(400, "Invalid status");
    const extra: Record<string, unknown> =
      status === "collected"
        ? { paymentStatus: "paid" }
        : status === "cancelled"
        ? { cancelledBy: "vendor", cancelReason: String(reason || "Declined by the restaurant.") }
        : {};
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, vendorId: vid(req) },
      { status, ...extra },
      { new: true }
    );
    if (!order) throw new HttpError(404, "Order not found");
    emitOrderStatus(vid(req), order.orderNumber, order);
    res.json(order);
  })
);

// ---- Categories ----
router.get(
  "/categories",
  asyncH(async (req, res) => {
    res.json(await MenuCategory.find({ vendorId: vid(req) }).sort({ sortOrder: 1 }));
  })
);

router.post(
  "/categories",
  asyncH(async (req, res) => {
    const { name, image, sortOrder } = req.body;
    if (!name) throw new HttpError(400, "Name required");
    const cat = await MenuCategory.create({ vendorId: vid(req), name, image, sortOrder });
    res.status(201).json(cat);
  })
);

router.put(
  "/categories/:id",
  asyncH(async (req, res) => {
    const cat = await MenuCategory.findOneAndUpdate(
      { _id: req.params.id, vendorId: vid(req) },
      req.body,
      { new: true }
    );
    if (!cat) throw new HttpError(404, "Not found");
    res.json(cat);
  })
);

router.delete(
  "/categories/:id",
  asyncH(async (req, res) => {
    await MenuCategory.deleteOne({ _id: req.params.id, vendorId: vid(req) });
    await MenuItem.deleteMany({ categoryId: req.params.id, vendorId: vid(req) });
    res.json({ ok: true });
  })
);

// ---- Items ----
router.get(
  "/items",
  asyncH(async (req, res) => {
    res.json(await MenuItem.find({ vendorId: vid(req) }).sort({ createdAt: -1 }));
  })
);

router.post(
  "/items",
  asyncH(async (req, res) => {
    const { name, price, categoryId } = req.body;
    if (!name || price == null || !categoryId) throw new HttpError(400, "Missing fields");
    const item = await MenuItem.create({ ...req.body, vendorId: vid(req) });
    res.status(201).json(item);
  })
);

router.put(
  "/items/:id",
  asyncH(async (req, res) => {
    const item = await MenuItem.findOneAndUpdate(
      { _id: req.params.id, vendorId: vid(req) },
      req.body,
      { new: true }
    );
    if (!item) throw new HttpError(404, "Not found");
    res.json(item);
  })
);

router.patch(
  "/items/:id/availability",
  asyncH(async (req, res) => {
    const item = await MenuItem.findOne({ _id: req.params.id, vendorId: vid(req) });
    if (!item) throw new HttpError(404, "Not found");
    item.isAvailable = !item.isAvailable;
    await item.save();
    res.json(item);
  })
);

router.delete(
  "/items/:id",
  asyncH(async (req, res) => {
    await MenuItem.deleteOne({ _id: req.params.id, vendorId: vid(req) });
    res.json({ ok: true });
  })
);

// ---- Customization Templates ----
router.get(
  "/customization-templates",
  asyncH(async (req, res) => {
    res.json(await CustomizationTemplate.find({ vendorId: vid(req) }).sort({ createdAt: -1 }));
  })
);

router.post(
  "/customization-templates",
  asyncH(async (req, res) => {
    const { name, customizations } = req.body;
    if (!name) throw new HttpError(400, "Name required");
    const template = await CustomizationTemplate.create({ vendorId: vid(req), name, customizations: customizations || [] });
    res.status(201).json(template);
  })
);

router.put(
  "/customization-templates/:id",
  asyncH(async (req, res) => {
    const template = await CustomizationTemplate.findOneAndUpdate(
      { _id: req.params.id, vendorId: vid(req) },
      req.body,
      { new: true }
    );
    if (!template) throw new HttpError(404, "Not found");
    res.json(template);
  })
);

router.delete(
  "/customization-templates/:id",
  asyncH(async (req, res) => {
    await CustomizationTemplate.deleteOne({ _id: req.params.id, vendorId: vid(req) });
    res.json({ ok: true });
  })
);

// ---- Coupons ----
router.get(
  "/coupons",
  asyncH(async (req, res) => {
    res.json(await Coupon.find({ vendorId: vid(req) }).sort({ createdAt: -1 }));
  })
);

router.post(
  "/coupons",
  asyncH(async (req, res) => {
    const { code, type, value } = req.body;
    if (!code || !type || value == null) throw new HttpError(400, "Missing fields");
    const coupon = await Coupon.create({ ...req.body, vendorId: vid(req) });
    res.status(201).json(coupon);
  })
);

router.put(
  "/coupons/:id",
  asyncH(async (req, res) => {
    const coupon = await Coupon.findOneAndUpdate(
      { _id: req.params.id, vendorId: vid(req) },
      req.body,
      { new: true }
    );
    if (!coupon) throw new HttpError(404, "Not found");
    res.json(coupon);
  })
);

router.delete(
  "/coupons/:id",
  asyncH(async (req, res) => {
    await Coupon.deleteOne({ _id: req.params.id, vendorId: vid(req) });
    res.json({ ok: true });
  })
);

// ---- QR ----
router.get(
  "/qr",
  asyncH(async (req, res) => {
    const vendor = await Vendor.findById(vid(req));
    if (!vendor) throw new HttpError(404, "Not found");
    const url = `${env.CLIENT_URL}/vendor/${vendor.slug}`;
    const dataUrl = await QRCode.toDataURL(url, { width: 600, margin: 2 });
    res.json({ url, qr: dataUrl });
  })
);

// ---- Reports ----
router.get(
  "/reports",
  asyncH(async (req, res) => {
    const vendorId = vid(req);
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const orders = await Order.find({
      vendorId,
      status: { $ne: "cancelled" },
      createdAt: { $gte: since },
      ...PAID_FILTER,
    });

    // Daily revenue buckets for last 30 days.
    const daily = new Map<string, { date: string; revenue: number; orders: number }>();
    for (const o of orders) {
      const d = new Date(o.createdAt as unknown as string).toISOString().slice(0, 10);
      const cur = daily.get(d) || { date: d, revenue: 0, orders: 0 };
      cur.revenue += o.total;
      cur.orders += 1;
      daily.set(d, cur);
    }

    const counts = new Map<string, { name: string; qty: number }>();
    const addonStats = new Map<string, { name: string; revenue: number; count: number }>();
    
    for (const o of orders) {
      for (const it of o.items) {
        const cur = counts.get(it.name) || { name: it.name, qty: 0 };
        cur.qty += it.qty;
        counts.set(it.name, cur);
        
        // Track advanced addon analytics
        if (it.addons) {
          for (const a of it.addons) {
            const key = `${a.group}::${a.label}`;
            const aStat = addonStats.get(key) || { name: `${a.group}: ${a.label}`, revenue: 0, count: 0 };
            aStat.revenue += a.price * it.qty;
            aStat.count += it.qty;
            addonStats.set(key, aStat);
          }
        }
      }
    }

    res.json({
      daily: [...daily.values()].sort((a, b) => a.date.localeCompare(b.date)),
      bestSellers: [...counts.values()].sort((a, b) => b.qty - a.qty).slice(0, 10),
      topAddons: [...addonStats.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 10),
      totalRevenue: orders.reduce((s, o) => s + o.total, 0),
      addonRevenue: [...addonStats.values()].reduce((s, a) => s + a.revenue, 0),
      totalOrders: orders.length,
    });
  })
);

// ---- Settlement & earnings ----
// Full earnings breakdown: per-order (customer paid → 5% fee → net to vendor)
// plus a settlement summary. Used by the dashboard Payments page.
router.get(
  "/settlement",
  asyncH(async (req, res) => {
    const vendor = await Vendor.findById(vid(req)).select("-passwordHash");
    if (!vendor) throw new HttpError(404, "Not found");

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // All paid orders for this vendor (these are the ones that earn money).
    const paidOrders = await Order.find({ vendorId: vendor.id, paymentStatus: "paid" })
      .sort({ createdAt: -1 })
      .limit(200);

    const breakdown = paidOrders.map((o) => ({
      orderNumber: o.orderNumber,
      createdAt: o.createdAt,
      customerName: o.customerName,
      customerPaid: o.total,
      platformFee: platformFee(o.total),
      netAmount: vendorNet(o.total),
      settlementStatus: o.settlementStatus === "settled" ? "Paid" : "Pending",
      settledAt: o.settledAt || null,
      settlementRef: o.settlementRef || "",
    }));

    const sum = (arr: typeof breakdown, key: "customerPaid" | "platformFee" | "netAmount") =>
      arr.reduce((s, o) => s + o[key], 0);

    const todays = breakdown.filter((o) => new Date(o.createdAt as any) >= startOfDay);
    const pending = breakdown.filter((o) => o.settlementStatus === "Pending");
    const settled = breakdown.filter((o) => o.settlementStatus === "Paid");
    const lastSettled = settled.find((o) => o.settledAt);

    res.json({
      settlementMode: vendor.settlementMode,
      kycStatus: vendor.kycStatus,
      eligibleForDirectMigration: vendor.eligibleForDirectMigration,
      managedPayout: vendor.managedPayout,
      hasPayoutSetup:
        vendor.settlementMode === "DIRECT"
          ? vendor.kycStatus === "active"
          : Boolean(vendor.cashfreeBeneficiaryId),
      feeRatePct: PLATFORM_FEE_PCT,
      summary: {
        todayGross: sum(todays, "customerPaid"),
        todayFee: sum(todays, "platformFee"),
        todayNet: sum(todays, "netAmount"),
        todayOrders: todays.length,
        pendingGross: sum(pending, "customerPaid"),
        pendingFee: sum(pending, "platformFee"),
        pendingNet: sum(pending, "netAmount"),
        pendingOrders: pending.length,
        totalSettledNet: sum(settled, "netAmount"),
        lastSettledAt: lastSettled?.settledAt || null,
      },
      orders: breakdown,
    });
  })
);

// Set up / update PreSnag-Managed payout bank details (creates a Cashfree
// Payouts beneficiary; simulated when Cashfree keys are absent).
router.post(
  "/settlement/managed",
  asyncH(async (req, res) => {
    const { accountHolderName, accountNumber, ifsc, pan } = req.body;
    if (!accountHolderName || !accountNumber || !ifsc || !pan) {
      throw new HttpError(400, "Account holder name, account number, IFSC and PAN are required");
    }
    const vendor = await Vendor.findById(vid(req));
    if (!vendor) throw new HttpError(404, "Not found");

    const { beneficiaryId } = await createPayoutBeneficiary(vendor.id, {
      accountHolderName,
      accountNumber,
      ifsc,
      pan,
    });
    vendor.settlementMode = "MANAGED";
    vendor.cashfreeBeneficiaryId = beneficiaryId;
    vendor.managedPayout = {
      accountHolderName,
      accountNumber: String(accountNumber).replace(/\s+/g, ""),
      accountNumberLast4: last4(accountNumber),
      ifsc: String(ifsc).toUpperCase().trim(),
      pan: String(pan).toUpperCase().trim(),
      panMasked: maskPan(pan),
    };
    await vendor.save();
    res.json({ ok: true, settlementMode: vendor.settlementMode, managedPayout: vendor.managedPayout });
  })
);

// Start the one-click migration to Direct Settlement: create the Easy Split
// vendor and return the Cashfree hosted-onboarding URL to redirect to.
router.post(
  "/settlement/switch-direct",
  asyncH(async (req, res) => {
    const vendor = await Vendor.findById(vid(req));
    if (!vendor) throw new HttpError(404, "Not found");
    if (vendor.settlementMode === "DIRECT" && vendor.kycStatus === "active") {
      throw new HttpError(400, "Already on Direct Settlement");
    }

    const { cashfreeVendorId, onboardingUrl } = await createEasySplitVendor({
      vendorId: vendor.id,
      name: vendor.name,
      email: vendor.email || "",
      phone: vendor.phone || "",
    });
    vendor.cashfreeVendorId = cashfreeVendorId;
    vendor.kycStatus = "in_progress";
    await vendor.save();
    res.json({ onboardingUrl });
  })
);

// Demo-only: when Cashfree isn't configured, completes the Direct migration
// locally (production does this via the Cashfree onboarding webhook).
router.post(
  "/settlement/complete-demo-kyc",
  asyncH(async (req, res) => {
    if (cashfreePgEnabled) {
      throw new HttpError(400, "KYC completes via Cashfree onboarding in this environment");
    }
    const vendor = await Vendor.findById(vid(req));
    if (!vendor) throw new HttpError(404, "Not found");
    vendor.kycStatus = "active";
    vendor.settlementMode = "DIRECT";
    if (!vendor.cashfreeVendorId) vendor.cashfreeVendorId = `presnag_${vendor.id}`;
    await vendor.save();
    res.json({ ok: true, settlementMode: vendor.settlementMode, kycStatus: vendor.kycStatus });
  })
);

export default router;
