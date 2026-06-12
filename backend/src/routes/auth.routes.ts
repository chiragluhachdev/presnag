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
      name, ownerName, email, password, phone, category, address,
      openTime, closeTime, fssaiLicense,
      // managed-payout bank fields (required for PreSnag-Managed)
      accountHolderName, accountNumber, ifsc, pan,
    } = req.body;

    // Step 1
    if (!name || !ownerName || !phone || !password || !address || !category) {
      throw new HttpError(400, "Shop name, owner name, mobile, password, address and category are required");
    }
    if (String(password).length < 6) throw new HttpError(400, "Password must be at least 6 characters");
    // Step 2 (settlement — PreSnag Managed)
    if (!accountHolderName || !accountNumber || !ifsc || !pan) {
      throw new HttpError(400, "Bank account holder name, account number, IFSC and PAN are required");
    }
    // Step 3
    if (!fssaiLicense) throw new HttpError(400, "FSSAI license number is required");

    const cleanPhone = String(phone).replace(/\D/g, "").slice(-10);
    if (cleanPhone.length !== 10) throw new HttpError(400, "Enter a valid 10-digit mobile number");
    if (await Vendor.exists({ phone: cleanPhone })) {
      throw new HttpError(409, "An account with this mobile number already exists");
    }
    const lowerEmail = email ? String(email).toLowerCase().trim() : undefined;
    if (lowerEmail && (await Vendor.exists({ email: lowerEmail }))) {
      throw new HttpError(409, "An account with this email already exists");
    }

    let slug = slugify(name);
    if (await Vendor.exists({ slug })) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

    const vendor = await Vendor.create({
      name,
      ownerName,
      ...(lowerEmail ? { email: lowerEmail } : {}),
      passwordHash: await hashPassword(password),
      slug,
      phone: cleanPhone,
      category,
      address,
      fssaiLicense: String(fssaiLicense).toUpperCase().trim(),
      openTime: openTime || "09:00",
      closeTime: closeTime || "21:00",
      status: "pending",
      settlementMode: "MANAGED", // Direct Settlement is "available soon"
    });

    // Set up the managed payout beneficiary (simulated when Cashfree keys absent).
    try {
      const { beneficiaryId } = await createPayoutBeneficiary(vendor.id, { accountHolderName, accountNumber, ifsc, pan });
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
    } catch {
      // Non-fatal: vendor can complete payout setup later from the dashboard.
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
    // `identifier` is the email or 10-digit mobile number.
    const { identifier, email, password } = req.body;
    const id = String(identifier || email || "").trim();
    if (!id || !password) throw new HttpError(400, "Email/mobile and password required");
    const phoneId = id.replace(/\D/g, "").slice(-10);
    const vendor = await Vendor.findOne({
      $or: [{ email: id.toLowerCase() }, { phone: phoneId }],
    });
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
