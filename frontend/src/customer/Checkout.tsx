import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Wallet, CreditCard, Tag, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Order, Vendor } from "@/lib/types";
import { SiteHeader } from "@/components/SiteHeader";
import { Input, Button, Label, Textarea, Card } from "@/components/ui";
import { toast } from "@/components/ui/toast";
import { useCart } from "@/store/cartStore";
import { rupees, cn } from "@/lib/utils";

export default function Checkout() {
  const navigate = useNavigate();
  const cart = useCart();

  const { data: vendorData, isLoading: loadingVendor } = useQuery({
    queryKey: ["vendor", cart.vendorSlug],
    queryFn: () => api<{ vendor: Vendor }>(`/api/public/vendors/${cart.vendorSlug}`),
    enabled: !!cart.vendorSlug,
  });

  const isStoreClosed = vendorData ? !vendorData.vendor.isOpen : false;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [method, setMethod] = useState<"COD" | "RAZORPAY">("COD");
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState("");
  const [placing, setPlacing] = useState(false);

  const subtotal = cart.subtotal();
  const tax = Math.round((subtotal - discount) * 0.05);
  const total = subtotal - discount + tax;

  if (cart.lines.length === 0) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="flex flex-col items-center justify-center gap-4 py-32">
          <p className="text-slate-500">Your cart is empty.</p>
          <Link to="/" className="text-brand-600 underline">Browse vendors</Link>
        </div>
      </div>
    );
  }

  async function applyCoupon() {
    if (!coupon.trim()) return;
    try {
      const res = await api<{ code: string; discount: number }>(
        `/api/public/vendors/${cart.vendorSlug}/coupon`,
        { method: "POST", body: { code: coupon, subtotal } }
      );
      setDiscount(res.discount);
      setAppliedCode(res.code);
      toast.success(`Coupon ${res.code} applied — ${rupees(res.discount)} off`);
    } catch (e: any) {
      setDiscount(0);
      setAppliedCode("");
      toast.error(e.message || "Invalid coupon");
    }
  }

  async function placeOrder() {
    if (!name.trim() || !phone.trim()) {
      toast.error("Please enter your name and phone number");
      return;
    }
    setPlacing(true);

    // Razorpay is a placeholder — hit the stub endpoint, then place the order as pending.
    if (method === "RAZORPAY") {
      try {
        const stub = await api<{ message: string }>("/api/payments/razorpay/order", {
          method: "POST",
          body: { amount: total },
        });
        toast.info(stub.message);
      } catch {
        /* ignore — placeholder */
      }
    }

    try {
      const order = await api<Order>("/api/public/orders", {
        method: "POST",
        body: {
          slug: cart.vendorSlug,
          customerName: name,
          customerPhone: phone,
          note,
          paymentMethod: method,
          couponCode: appliedCode,
          items: cart.lines.map((l) => ({
            itemId: l.itemId,
            qty: l.qty,
            instructions: l.instructions,
          })),
        },
      });
      cart.clear();
      navigate(`/order/${order.orderNumber}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-4 py-6">
        <Link to={`/vendor/${cart.vendorSlug}`} className="mb-4 inline-flex items-center gap-1 text-sm text-slate-600">
          <ArrowLeft className="h-4 w-4" /> Back to {cart.vendorName}
        </Link>
        <h1 className="mb-6 text-2xl font-bold">Checkout</h1>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Customer details */}
          <div className="space-y-4">
            <Card className="p-5">
              <h3 className="mb-3 font-semibold">Your Details</h3>
              <div className="space-y-3">
                <div>
                  <Label>Name *</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                </div>
                <div>
                  <Label>Phone Number *</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile" />
                </div>
                <div>
                  <Label>Note (optional)</Label>
                  <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Any note for the vendor" />
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="mb-3 font-semibold">Payment Method</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setMethod("COD")}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg border p-3 text-left",
                    method === "COD" ? "border-brand-500 bg-brand-50" : "border-slate-200"
                  )}
                >
                  <Wallet className="h-5 w-5 text-brand-600" />
                  <div>
                    <div className="font-medium">Cash On Pickup</div>
                    <div className="text-xs text-slate-500">Pay when you collect your order</div>
                  </div>
                </button>
                <button
                  onClick={() => setMethod("RAZORPAY")}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg border p-3 text-left",
                    method === "RAZORPAY" ? "border-brand-500 bg-brand-50" : "border-slate-200"
                  )}
                >
                  <CreditCard className="h-5 w-5 text-brand-600" />
                  <div>
                    <div className="font-medium">Pay Online (Razorpay)</div>
                    <div className="text-xs text-amber-600">Placeholder — not charged in this demo</div>
                  </div>
                </button>
              </div>
            </Card>
          </div>

          {/* Order summary */}
          <div>
            <Card className="p-5">
              <h3 className="mb-3 font-semibold">Order Summary</h3>
              <div className="space-y-2">
                {cart.lines.map((l) => (
                  <div key={l.itemId} className="flex justify-between text-sm">
                    <span className="text-slate-600">{l.qty} × {l.name}</span>
                    <span>{rupees(l.price * l.qty)}</span>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="mt-4 flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                    placeholder="Coupon code"
                    className="pl-8"
                  />
                </div>
                <Button variant="outline" onClick={applyCoupon}>Apply</Button>
              </div>

              <div className="mt-4 space-y-1 border-t border-slate-100 pt-3 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>{rupees(subtotal)}</span></div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedCode})</span><span>−{rupees(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between"><span className="text-slate-500">Tax (5%)</span><span>{rupees(tax)}</span></div>
                <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-bold">
                  <span>Total</span><span>{rupees(total)}</span>
                </div>
              </div>

              {isStoreClosed && (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-center text-xs font-semibold text-red-800">
                  🚫 This store is currently closed and not accepting orders.
                </div>
              )}

              <Button 
                className="mt-4 w-full" 
                size="lg" 
                onClick={placeOrder} 
                disabled={placing || isStoreClosed || loadingVendor}
              >
                {placing && <Loader2 className="h-4 w-4 animate-spin" />}
                {isStoreClosed ? "Store is Closed" : method === "COD" ? "Place Order" : "Pay & Place Order"}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
