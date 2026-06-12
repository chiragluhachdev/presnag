// PreSnag's commission and the payment-gateway charge, applied to every order.
export const PLATFORM_FEE_RATE = 0.05; // 5% PreSnag commission
export const PLATFORM_FEE_PCT = Math.round(PLATFORM_FEE_RATE * 100); // 5
// Gateway MDR (~2%) + 18% GST on the MDR  →  2% * 1.18 = 2.36%.
export const GATEWAY_FEE_RATE = 0.0236;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** PreSnag's 5% commission on an order total. */
export function platformFee(total: number): number {
  return round2(total * PLATFORM_FEE_RATE);
}

/** Payment-gateway fee (MDR + GST) on an order total. */
export function gatewayFee(total: number): number {
  return round2(total * GATEWAY_FEE_RATE);
}

/** What the vendor actually receives: total − platform fee − gateway fee. */
export function vendorNet(total: number): number {
  return round2(total - platformFee(total) - gatewayFee(total));
}
