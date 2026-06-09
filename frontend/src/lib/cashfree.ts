// Loads the Cashfree JS SDK (v3) from their CDN on demand, so we don't bundle
// an npm dependency. Exposes a global `Cashfree` factory once loaded.
let loader: Promise<any> | null = null;

export const CASHFREE_MODE =
  (import.meta.env.VITE_CASHFREE_ENV as string) === "production" ? "production" : "sandbox";

export function loadCashfreeSdk(): Promise<any> {
  if ((window as any).Cashfree) return Promise.resolve((window as any).Cashfree);
  if (loader) return loader;
  loader = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    s.async = true;
    s.onload = () => resolve((window as any).Cashfree);
    s.onerror = () => reject(new Error("Failed to load Cashfree checkout"));
    document.head.appendChild(s);
  });
  return loader;
}
