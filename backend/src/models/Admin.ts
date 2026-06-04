import { Schema, model, InferSchemaType } from "mongoose";

const adminSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["SUPER_ADMIN", "ADMIN"],
      default: "ADMIN",
    },
  },
  { timestamps: true }
);

export type AdminDoc = InferSchemaType<typeof adminSchema>;
export const Admin = model("Admin", adminSchema);
