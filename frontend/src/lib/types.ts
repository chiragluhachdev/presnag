export type Role = "SUPER_ADMIN" | "ADMIN" | "VENDOR";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  slug?: string;
}

export interface Vendor {
  _id: string;
  name: string;
  slug: string;
  email?: string;
  phone?: string;
  description?: string;
  address?: string;
  logo?: string;
  banner?: string;
  category: string;
  openingHours?: string;
  isOpen: boolean;
  prepTime: number;
  status: "pending" | "active" | "suspended" | "inactive";
  subscriptionPlan?: string;
  socialLinks?: { instagram?: string; facebook?: string; website?: string };
  lat?: number;
  lng?: number;
  createdAt?: string;
  // Settlement / payments
  settlementMode?: "MANAGED" | "DIRECT";
  eligibleForDirectMigration?: boolean;
  managedPayout?: {
    accountHolderName?: string;
    accountNumberLast4?: string;
    ifsc?: string;
    panMasked?: string;
  };
  cashfreeBeneficiaryId?: string;
  cashfreeVendorId?: string;
  kycStatus?: "not_started" | "in_progress" | "active" | "rejected";
}

export interface Category {
  _id: string;
  vendorId: string;
  name: string;
  image?: string;
  sortOrder?: number;
}

export interface MenuItem {
  _id: string;
  vendorId: string;
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  isAvailable: boolean;
}

export type OrderStatus =
  | "received"
  | "accepted"
  | "preparing"
  | "ready"
  | "collected"
  | "cancelled";

export interface OrderItem {
  itemId: string;
  name: string;
  price: number;
  qty: number;
  instructions?: string;
}

export interface Order {
  _id: string;
  vendorId: string | Vendor;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  note?: string;
  orderType?: "DINE_IN" | "TAKE_AWAY";
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  couponCode?: string;
  paymentMethod: "COD" | "RAZORPAY" | "CASHFREE";
  paymentStatus: "pending" | "paid";
  status: OrderStatus;
  pickupTime?: string;
  settlementMode?: "MANAGED" | "DIRECT";
  settlementStatus?: "not_applicable" | "pending" | "processing" | "settled" | "failed";
  createdAt: string;
}

export interface Coupon {
  _id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  expiry?: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}
