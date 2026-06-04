import { Router } from "express";
import { Vendor } from "../models/Vendor";
import { Admin } from "../models/Admin";
import { comparePassword, signToken } from "../utils/auth";
import { authenticate } from "../middleware/auth";
import { asyncH, HttpError } from "../middleware/error";

const router = Router();

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
