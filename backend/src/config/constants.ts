// PreSnag's platform commission, charged on every order.
export const PLATFORM_FEE_RATE = 0.05; // 5%
export const PLATFORM_FEE_PCT = Math.round(PLATFORM_FEE_RATE * 100); // 5

/** Platform fee (commission) for an order total, rounded to the nearest rupee. */
export function platformFee(total: number): number {
  return Math.round(total * PLATFORM_FEE_RATE);
}

/** Net amount the vendor receives after the platform fee. */
export function vendorNet(total: number): number {
  return total - platformFee(total);
}
