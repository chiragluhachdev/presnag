// Loads the Razorpay Checkout SDK on demand (exposes global `Razorpay`).
let loader: Promise<any> | null = null;

export function loadRazorpaySdk(): Promise<any> {
  if ((window as any).Razorpay) return Promise.resolve((window as any).Razorpay);
  if (loader) return loader;
  loader = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => resolve((window as any).Razorpay);
    s.onerror = () => reject(new Error("Failed to load Razorpay checkout"));
    document.head.appendChild(s);
  });
  return loader;
}
