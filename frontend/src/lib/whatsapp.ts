import { Order, Vendor } from "./types";

// Manual WhatsApp notifications (MVP — no API, no cost).
// We just build a wa.me deep link with a pre-filled message; the admin/vendor
// clicks it and presses "Send" themselves in WhatsApp.

/** Normalise a phone number for wa.me: digits only, with a country code. */
export function waPhone(raw: string, countryCode = "91"): string {
  const digits = (raw || "").replace(/\D/g, "");
  if (digits.length === 10) return countryCode + digits; // local 10-digit (India)
  if (digits.length === 11 && digits.startsWith("0")) return countryCode + digits.slice(1);
  return digits; // already includes a country code
}

function shopName(o: Order, fallback?: string): string {
  if (fallback) return fallback;
  return typeof o.vendorId === "object" ? (o.vendorId as Vendor).name : "the restaurant";
}

function waUrl(phone: string, message: string): string {
  return `https://wa.me/${waPhone(phone)}?text=${encodeURIComponent(message)}`;
}

/** Order-confirmation message link. */
export function waConfirmUrl(o: Order, vendorName?: string): string {
  const shop = shopName(o, vendorName);
  const pickup = o.pickupTime || "a few minutes";
  const msg =
    `Hi ${o.customerName}, your order at ${shop} is confirmed! ✅\n\n` +
    `Order ID: ${o.orderNumber}\n` +
    `Total: ₹${o.total}\n` +
    `Estimated pickup: ${pickup}\n\n` +
    `We'll let you know as soon as it's ready. Thank you for ordering with PreSnag!`;
  return waUrl(o.customerPhone, msg);
}

/** Order-cancellation message link. */
export function waCancelUrl(o: Order, vendorName?: string): string {
  const shop = shopName(o, vendorName);
  const reasonLine = o.cancelReason ? `\nReason: ${o.cancelReason}` : "";
  const refundLine =
    o.paymentStatus === "paid" && o.paymentMethod !== "COD"
      ? `\n\nYour payment will be refunded to your original payment method within 5-7 business days.`
      : "";
  const msg =
    `Hi ${o.customerName}, we're sorry to let you know that your order ${o.orderNumber} at ${shop} (₹${o.total}) has been cancelled.${reasonLine}${refundLine}\n\n` +
    `Apologies for the inconvenience. — PreSnag`;
  return waUrl(o.customerPhone, msg);
}
