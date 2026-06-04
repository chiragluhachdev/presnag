import { Router } from "express";
import multer from "multer";
import { authenticate } from "../middleware/auth";
import { asyncH, HttpError } from "../middleware/error";
import { uploadBuffer, cloudinaryEnabled } from "../config/cloudinary";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Upload an image to Cloudinary. Requires auth (vendor or admin).
router.post(
  "/image",
  authenticate,
  upload.single("image"),
  asyncH(async (req, res) => {
    if (!cloudinaryEnabled) {
      throw new HttpError(
        503,
        "Cloudinary not configured. Set CLOUDINARY_* env vars, or pass an image URL directly."
      );
    }
    if (!req.file) throw new HttpError(400, "No image uploaded (field name: 'image')");
    const folder = (req.query.folder as string) || "presnag";
    const url = await uploadBuffer(req.file.buffer, folder);
    res.json({ url });
  })
);

export default router;
