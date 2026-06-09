import { Router } from "express";
import { Vendor } from "../models/Vendor";
import { Admin } from "../models/Admin";
import { comparePassword, hashPassword, signToken } from "../utils/auth";
import { authenticate } from "../middleware/auth";
import { asyncH, HttpError } from "../middleware/error";
import { slugify } from "../utils/helpers";
import { createPayoutBeneficiary, last4, maskPan } from "../services/cashfree";

const router = Router();

// Vendor self-registration. Creates a pending vendor and auto-logs them in.
// MANAGED is the default settlement mode (instant launch, daily payout).
router.post(
  "/vendor/register",
  asyncH(async (req, res) => {
    const {
      name,
      email,
      password,
      phone,
      category,
      address,
      settlementMode,
      // managed-payout bank fields (optional at this step; can be added later)
      accountHolderName,
      accountNumber,
      ifsc,
      pan,
    } = req.body;

    if (!name || !email || !password) {
      throw new HttpError(400, "Shop name, email and password are required");
    }
    if (String(password).length < 6) {
      throw new HttpError(400, "Password must be at least 6 characters");
    }
    const lowerEmail = String(email).toLowerCase().trim();
    if (await Vendor.exists({ email: lowerEmail })) {
      throw new HttpError(409, "An account with this email already exists");
    }

    let slug = slugify(name);
    if (await Vendor.exists({ slug })) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

    const mode = settlementMode === "DIRECT" ? "DIRECT" : "MANAGED";

    const vendor = await Vendor.create({
      name,
      email: lowerEmail,
      passwordHash: await hashPassword(password),
      slug,
      phone: phone || "",
      category: category || "Fast Food",
      address: address || "",
      status: "pending",
      settlementMode: mode,
    });

    // If they chose MANAGED and supplied bank details now, set up the payout
    // beneficiary immediately (simulated when Cashfree keys are absent).
    if (mode === "MANAGED" && accountHolderName && accountNumber && ifsc && pan) {
      try {
        const { beneficiaryId } = await createPayoutBeneficiary(vendor.id, {
          accountHolderName,
          accountNumber,
          ifsc,
          pan,
        });
        vendor.cashfreeBeneficiaryId = beneficiaryId;
        vendor.managedPayout = {
          accountHolderName,
          accountNumberLast4: last4(accountNumber),
          ifsc: String(ifsc).toUpperCase().trim(),
          panMasked: maskPan(pan),
        };
        await vendor.save();
      } catch {
        // Non-fatal: vendor can complete payout setup later from the dashboard.
      }
    }

    const token = signToken({ id: vendor.id, role: "VENDOR" });
    res.status(201).json({
      token,
      user: { id: vendor.id, name: vendor.name, email: vendor.email, role: "VENDOR", slug: vendor.slug },
    });
  })
);

router.post(
  "/vendor/login",
  asyncH(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) throw new HttpError(400, "Email and password required");
    const vendor = await Vendor.findOne({ email: String(email).toLowerCase() });
    if (!vendor || !(await comparePassword(password, vendor.passwordHash))) {
      throw new HttpError(401, "Invalid credentials");
    }
    if (vendor.status === "suspended") throw new HttpError(403, "Account suspended");
    const token = signToken({ id: vendor.id, role: "VENDOR" });
    res.json({
      token,
      user: { id: vendor.id, name: vendor.name, email: vendor.email, role: "VENDOR", slug: vendor.slug },
    });
  })
);

router.post(
  "/admin/login",
  asyncH(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) throw new HttpError(400, "Email and password required");
    const admin = await Admin.findOne({ email: String(email).toLowerCase() });
    if (!admin || !(await comparePassword(password, admin.passwordHash))) {
      throw new HttpError(401, "Invalid credentials");
    }
    const token = signToken({ id: admin.id, role: admin.role });
    res.json({
      token,
      user: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
    });
  })
);

router.get(
  "/me",
  authenticate,
  asyncH(async (req, res) => {
    const { id, role } = req.user!;
    if (role === "VENDOR") {
      const vendor = await Vendor.findById(id).select("-passwordHash");
      if (!vendor) throw new HttpError(404, "Not found");
      res.json({ ...vendor.toObject(), role });
    } else {
      const admin = await Admin.findById(id).select("-passwordHash");
      if (!admin) throw new HttpError(404, "Not found");
      res.json({ ...admin.toObject(), role });
    }
  })
);

export default router;
