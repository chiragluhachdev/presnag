import { Router } from "express";
import { Vendor } from "../models/Vendor";
import { Order } from "../models/Order";
import { MenuCategory } from "../models/MenuCategory";
import { MenuItem } from "../models/MenuItem";
import { getSettings } from "../models/Setting";
import { runManagedSettlement } from "../jobs/dailyPayout";
import { PLATFORM_FEE_RATE, PLATFORM_FEE_PCT, platformFee, vendorNet } from "../config/constants";
import { authenticate, requireRole } from "../middleware/auth";
import { asyncH, HttpError } from "../middleware/error";
import { hashPassword } from "../utils/auth";
import { slugify } from "../utils/helpers";

const router = Router();

router.use(authenticate, requireRole("ADMIN", "SUPER_ADMIN"));

// Only paid (or cash-on-pickup) orders count — abandoned unpaid online
// checkouts must never appear in admin metrics or order lists.
const PAID_FILTER = { $or: [{ paymentStatus: "paid" }, { paymentMethod: "COD" }] };

// ---- Platform settings (maintenance mode) ----
router.get(
  "/settings",
  asyncH(async (_req, res) => {
    const settings = await getSettings();
    res.json({ maintenanceMode: settings.maintenanceMode, paymentProvider: settings.paymentProvider });
  })
);

router.put(
  "/settings",
  asyncH(async (req, res) => {
    const settings = await getSettings();
    if (typeof req.body.maintenanceMode === "boolean") {
      settings.maintenanceMode = req.body.maintenanceMode;
    }
    if (req.body.paymentProvider === "CASHFREE" || req.body.paymentProvider === "RAZORPAY") {
      settings.paymentProvider = req.body.paymentProvider;
    }
    await settings.save();
    res.json({ maintenanceMode: settings.maintenanceMode, paymentProvider: settings.paymentProvider });
  })
);

// ---- Platform overview ----
router.get(
  "/overview",
  asyncH(async (_req, res) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [totalVendors, activeVendors, pendingVendors, totalOrders, todayOrders, monthOrders] =
      await Promise.all([
        Vendor.countDocuments({}),
        Vendor.countDocuments({ status: "active" }),
        Vendor.countDocuments({ status: "pending" }),
        Order.countDocuments({ status: { $ne: "cancelled" }, ...PAID_FILTER }),
        Order.find({ createdAt: { $gte: startOfDay }, status: { $ne: "cancelled" }, ...PAID_FILTER }),
        Order.find({ createdAt: { $gte: startOfMonth }, status: { $ne: "cancelled" }, ...PAID_FILTER }),
      ]);

    const monthlyRevenue = monthOrders.reduce((s, o) => s + o.total, 0);
    // Platform fee: 5% per order.
    const platformRevenue = Math.round(monthlyRevenue * PLATFORM_FEE_RATE);

    res.json({
      totalVendors,
      activeVendors,
      inactiveVendors: totalVendors - activeVendors,
      pendingVendors,
      totalOrders,
      todayOrders: todayOrders.length,
      todayRevenue: todayOrders.reduce((s, o) => s + o.total, 0),
      monthlyRevenue,
      platformRevenue,
    });
  })
);

// ---- Settlements (PreSnag-Managed vendors) ----
// Per-vendor pending amounts with the 5% fee breakdown.
router.get(
  "/settlements",
  asyncH(async (_req, res) => {
    const pending = await Order.aggregate([
      { $match: { settlementMode: "MANAGED", paymentStatus: "paid", settlementStatus: "pending" } },
      { $group: { _id: "$vendorId", gross: { $sum: "$total" }, orders: { $sum: 1 } } },
    ]);
    const vendors = await Vendor.find({ _id: { $in: pending.map((p) => p._id) } }).select(
      "name managedPayout"
    );
    const vMap = new Map(vendors.map((v) => [v.id, v]));
    const rows = pending.map((p) => {
      const v = vMap.get(String(p._id));
      const fee = platformFee(p.gross);
      return {
        vendorId: String(p._id),
        vendorName: v?.name || "Unknown",
        bank: v?.managedPayout || null,
        orders: p.orders,
        gross: p.gross,
        fee,
        net: p.gross - fee,
      };
    });
    res.json({
      feeRatePct: PLATFORM_FEE_PCT,
      rows,
      totalPendingGross: rows.reduce((s, r) => s + r.gross, 0),
      totalPendingNet: rows.reduce((s, r) => s + r.net, 0),
    });
  })
);

// Manually mark a vendor's pending settlement as PAID (admin settles by hand,
// then records it). Optionally stores a UTR / transaction reference.
router.post(
  "/settlements/:vendorId/mark-paid",
  asyncH(async (req, res) => {
    const { reference } = req.body;
    const orders = await Order.find({
      vendorId: req.params.vendorId,
      settlementMode: "MANAGED",
      paymentStatus: "paid",
      settlementStatus: "pending",
    });
    if (orders.length === 0) throw new HttpError(400, "Nothing pending to settle for this vendor");

    const gross = orders.reduce((s, o) => s + o.total, 0);
    const net = vendorNet(gross);
    const now = new Date();
    await Order.updateMany(
      { _id: { $in: orders.map((o) => o._id) } },
      {
        settlementStatus: "settled",
        settledAt: now,
        settlementRef: reference || "",
        payoutId: reference || `manual_${now.getTime()}`,
      }
    );
    res.json({ ok: true, ordersSettled: orders.length, gross, net, settledAt: now });
  })
);

// Trigger the automated Cashfree payout (only used when Payouts is configured).
router.post(
  "/settlements/run",
  asyncH(async (_req, res) => {
    const results = await runManagedSettlement();
    res.json({ results });
  })
);

// ---- Vendor management ----
router.get(
  "/vendors",
  asyncH(async (req, res) => {
    const { status } = req.query;
    const filter: Record<string, unknown> = {};
    if (status && status !== "all") filter.status = status;
    const vendors = await Vendor.find(filter).select("-passwordHash").sort({ createdAt: -1 });
    res.json(vendors);
  })
);

router.post(
  "/vendors",
  asyncH(async (req, res) => {
    const { name, email, password, phone, category } = req.body;
    if (!name || !email || !password) throw new HttpError(400, "Name, email, password required");
    let slug = slugify(name);
    if (await Vendor.exists({ slug })) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
    const vendor = await Vendor.create({
      name,
      email: String(email).toLowerCase(),
      passwordHash: await hashPassword(password),
      phone,
      category,
      slug,
      status: "active",
    });
    const obj = vendor.toObject() as Record<string, unknown>;
    delete obj.passwordHash;
    res.status(201).json(obj);
  })
);

router.put(
  "/vendors/:id",
  asyncH(async (req, res) => {
    const allowed = ["name", "email", "phone", "category", "address", "subscriptionPlan"];
    const update: Record<string, unknown> = {};
    for (const k of allowed) if (k in req.body) update[k] = req.body[k];
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, update, { new: true }).select(
      "-passwordHash"
    );
    if (!vendor) throw new HttpError(404, "Not found");
    res.json(vendor);
  })
);

router.patch(
  "/vendors/:id/status",
  asyncH(async (req, res) => {
    const { status } = req.body;
    if (!["pending", "active", "suspended", "inactive"].includes(status)) {
      throw new HttpError(400, "Invalid status");
    }
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, { status }, { new: true }).select(
      "-passwordHash"
    );
    if (!vendor) throw new HttpError(404, "Not found");
    res.json(vendor);
  })
);

router.delete(
  "/vendors/:id",
  asyncH(async (req, res) => {
    await Vendor.deleteOne({ _id: req.params.id });
    await MenuItem.deleteMany({ vendorId: req.params.id });
    await MenuCategory.deleteMany({ vendorId: req.params.id });
    res.json({ ok: true });
  })
);

// ---- Order monitoring ----
router.get(
  "/orders",
  asyncH(async (req, res) => {
    const { vendorId, status, date } = req.query;
    const filter: Record<string, unknown> = { ...PAID_FILTER };
    if (vendorId) filter.vendorId = vendorId;
    if (status && status !== "all") filter.status = status;
    if (date) {
      const start = new Date(String(date));
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      filter.createdAt = { $gte: start, $lt: end };
    }
    const orders = await Order.find(filter)
      .populate("vendorId", "name slug")
      .sort({ createdAt: -1 })
      .limit(300);
    res.json(orders);
  })
);

// ---- Analytics ----
router.get(
  "/analytics",
  asyncH(async (_req, res) => {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const orders = await Order.find({
      status: { $ne: "cancelled" },
      createdAt: { $gte: since },
      ...PAID_FILTER,
    });

    const daily = new Map<string, { date: string; revenue: number; orders: number }>();
    for (const o of orders) {
      const d = new Date(o.createdAt as unknown as string).toISOString().slice(0, 10);
      const cur = daily.get(d) || { date: d, revenue: 0, orders: 0 };
      cur.revenue += o.total;
      cur.orders += 1;
      daily.set(d, cur);
    }

    // Top vendors by revenue.
    const byVendor = new Map<string, number>();
    for (const o of orders)
      byVendor.set(String(o.vendorId), (byVendor.get(String(o.vendorId)) || 0) + o.total);
    const topVendorIds = [...byVendor.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    const vendorDocs = await Vendor.find({ _id: { $in: topVendorIds.map((v) => v[0]) } }).select(
      "name"
    );
    const vendorNames = new Map(vendorDocs.map((v) => [v.id, v.name]));
    const topVendors = topVendorIds.map(([id, revenue]) => ({
      name: vendorNames.get(id) || "Unknown",
      revenue,
    }));

    const monthlyRevenue = orders.reduce((s, o) => s + o.total, 0);
    const mrr = Math.round(monthlyRevenue * PLATFORM_FEE_RATE);

    res.json({
      daily: [...daily.values()].sort((a, b) => a.date.localeCompare(b.date)),
      topVendors,
      mrr,
      arr: mrr * 12,
      totalRevenue: monthlyRevenue,
      totalOrders: orders.length,
    });
  })
);

export default router;
