import { Router } from "express";
import { Vendor } from "../models/Vendor";
import { Order } from "../models/Order";
import { MenuCategory } from "../models/MenuCategory";
import { MenuItem } from "../models/MenuItem";
import { Coupon } from "../models/Coupon";
import { getSettings } from "../models/Setting";
import { runManagedSettlement } from "../jobs/dailyPayout";
import { PLATFORM_FEE_RATE, PLATFORM_FEE_PCT, GATEWAY_FEE_RATE, platformFee, gatewayFee, vendorNet } from "../config/constants";
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
function settingsPayload(s: any) {
  return {
    maintenanceMode: s.maintenanceMode,
    paymentProvider: s.paymentProvider,
    demoBanner: s.demoBanner,
  };
}

router.get(
  "/settings",
  asyncH(async (_req, res) => {
    res.json(settingsPayload(await getSettings()));
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
    const d = req.body.demoBanner;
    if (d && typeof d === "object") {
      const cur: any = settings.demoBanner || {};
      settings.demoBanner = {
        enabled: typeof d.enabled === "boolean" ? d.enabled : cur.enabled ?? false,
        message: typeof d.message === "string" ? d.message : cur.message ?? "",
        showOnHome: typeof d.showOnHome === "boolean" ? d.showOnHome : cur.showOnHome ?? true,
        showOnCheckout: typeof d.showOnCheckout === "boolean" ? d.showOnCheckout : cur.showOnCheckout ?? true,
      };
    }
    await settings.save();
    res.json(settingsPayload(settings));
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

// ---- Finance: full per-order money breakdown + daily totals ----
router.get(
  "/finance",
  asyncH(async (req, res) => {
    const { date } = req.query;
    const day = date ? new Date(String(date)) : new Date();
    const start = new Date(day); start.setHours(0, 0, 0, 0);
    const end = new Date(start); end.setDate(end.getDate() + 1);

    const orders = await Order.find({
      paymentStatus: "paid",
      createdAt: { $gte: start, $lt: end },
    })
      .populate("vendorId", "name")
      .sort({ createdAt: -1 })
      .limit(500);

    const rows = orders.map((o) => {
      const gFee = gatewayFee(o.total);
      const pFee = platformFee(o.total);
      const vendor: any = o.vendorId;
      return {
        orderNumber: o.orderNumber,
        vendorName: vendor?.name || "—",
        createdAt: o.createdAt,
        customerPaid: o.total,
        gatewayFee: gFee,
        platformFee: pFee,
        vendorGets: vendorNet(o.total),
        status: o.settlementStatus === "settled" ? "Paid" : "Pending",
      };
    });

    const sum = (k: "customerPaid" | "gatewayFee" | "platformFee" | "vendorGets") =>
      Math.round(rows.reduce((s, r) => s + r[k], 0) * 100) / 100;
    const collection = sum("customerPaid");
    const gatewayFees = sum("gatewayFee");
    const platformCommission = sum("platformFee");
    const vendorPayoutDue = sum("vendorGets");

    res.json({
      date: start.toISOString().slice(0, 10),
      feeRatePct: PLATFORM_FEE_PCT,
      gatewayRatePct: Math.round(GATEWAY_FEE_RATE * 10000) / 100,
      rows,
      totals: {
        collection,
        gatewayFees,
        platformCommission,
        vendorPayoutDue,
        netProfit: platformCommission, // gateway fee is borne by the vendor
        orders: rows.length,
      },
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
      return {
        vendorId: String(p._id),
        vendorName: v?.name || "Unknown",
        bank: v?.managedPayout || null,
        orders: p.orders,
        gross: p.gross,
        fee: platformFee(p.gross),
        gatewayFee: gatewayFee(p.gross),
        net: vendorNet(p.gross),
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
    const { name, ownerName, email, password, phone, category } = req.body;
    if (!name || !password || !phone) throw new HttpError(400, "Name, mobile and password required");
    const cleanPhone = String(phone).replace(/\D/g, "").slice(-10);
    if (cleanPhone.length !== 10) throw new HttpError(400, "Enter a valid 10-digit mobile number");
    if (await Vendor.exists({ phone: cleanPhone })) throw new HttpError(409, "Mobile already registered");
    const lowerEmail = email ? String(email).toLowerCase().trim() : undefined;
    if (lowerEmail && (await Vendor.exists({ email: lowerEmail }))) throw new HttpError(409, "Email already registered");
    let slug = slugify(name);
    if (await Vendor.exists({ slug })) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
    const vendor = await Vendor.create({
      name,
      ownerName: ownerName || "",
      ...(lowerEmail ? { email: lowerEmail } : {}),
      passwordHash: await hashPassword(password),
      phone: cleanPhone,
      category,
      slug,
      status: "active",
    });
    const obj = vendor.toObject() as Record<string, unknown>;
    delete obj.passwordHash;
    res.status(201).json(obj);
  })
);

// Admin resets a vendor's password.
router.patch(
  "/vendors/:id/password",
  asyncH(async (req, res) => {
    const { password } = req.body;
    if (!password || String(password).length < 6) throw new HttpError(400, "Password must be at least 6 characters");
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) throw new HttpError(404, "Not found");
    vendor.passwordHash = await hashPassword(password);
    await vendor.save();
    res.json({ ok: true });
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

// Delete a vendor AND everything linked to it (orders, menu, coupons).
router.delete(
  "/vendors/:id",
  asyncH(async (req, res) => {
    const id = req.params.id;
    await Promise.all([
      Vendor.deleteOne({ _id: id }),
      MenuItem.deleteMany({ vendorId: id }),
      MenuCategory.deleteMany({ vendorId: id }),
      Order.deleteMany({ vendorId: id }),
      Coupon.deleteMany({ vendorId: id }),
    ]);
    res.json({ ok: true });
  })
);

// Clear order history — all orders, or a single vendor's (?vendorId=...).
router.delete(
  "/orders",
  asyncH(async (req, res) => {
    const { vendorId } = req.query;
    const filter = vendorId ? { vendorId: String(vendorId) } : {};
    const result = await Order.deleteMany(filter);
    res.json({ ok: true, deleted: result.deletedCount });
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
    const gatewayFees = Math.round(orders.reduce((s, o) => s + gatewayFee(o.total), 0));

    res.json({
      daily: [...daily.values()].sort((a, b) => a.date.localeCompare(b.date)),
      topVendors,
      mrr,
      gatewayFees,
      totalRevenue: monthlyRevenue,
      totalOrders: orders.length,
    });
  })
);

export default router;
