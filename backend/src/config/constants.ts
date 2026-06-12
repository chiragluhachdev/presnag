// PreSnag's platform commission, charged on every order.
// This is the ONLY deduction shown to vendors — any payment-gateway charges
// are absorbed by PreSnag and never passed on to the vendor.
export const PLATFORM_FEE_RATE = 0.05; // 5%
export const PLATFORM_FEE_PCT = Math.round(PLATFORM_FEE_RATE * 100); // 5

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** PreSnag's 5% commission on an order total. */
export function platformFee(total: number): number {
  return round2(total * PLATFORM_FEE_RATE);
}

/** What the vendor receives: total − platform fee (nothing else is deducted). */
export function vendorNet(total: number): number {
  return round2(total - platformFee(total));
}
