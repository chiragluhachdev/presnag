import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CreditCard, Tag, Loader2, ShoppingCart, CheckCircle2, Store, Clock, ShieldCheck, User, Phone, FileText, Circle, Smartphone, Utensils, ShoppingBag, Banknote } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Order, Vendor } from "@/lib/types";
import { SiteHeader } from "@/components/SiteHeader";
import { Input, Button, Label, Textarea, Card } from "@/components/ui";
import { toast } from "@/components/ui/toast";
import { useCart } from "@/store/cartStore";
import { DemoBanner } from "@/components/DemoBanner";
import { loadCashfreeSdk, CASHFREE_MODE } from "@/lib/cashfree";
import { loadRazorpaySdk } from "@/lib/razorpay";
import { rupees, cn } from "@/lib/utils";

export default function Checkout() {
  const navigate = useNavigate();
  const cart = useCart();

  const { data: vendorData, isLoading: loadingVendor } = useQuery({
    queryKey: ["vendor", cart.vendorSlug],
    queryFn: () => api<{ vendor: Vendor }>(`/api/public/vendors/${cart.vendorSlug}`),
    enabled: !!cart.vendorSlug,
  });

  const { data: settings } = useQuery({
    queryKey: ["public-settings"],
    queryFn: () => api<{ paymentsDisabled?: boolean; codEnabled?: boolean }>("/api/public/settings"),
  });

  const isStoreClosed = vendorData ? !vendorData.vendor.isOpen : false;
  const paymentsDisabled = !!settings?.paymentsDisabled;
  const codEnabled = !!settings?.codEnabled;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [method, setMethod] = useState<"COD" | "RAZORPAY">("RAZORPAY");
  const [orderType, setOrderType] = useState<"DINE_IN" | "TAKE_AWAY">("DINE_IN");
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState("");
  const [placing, setPlacing] = useState(false);

  // If the admin turns COD off while it's selected, fall back to online payment.
  useEffect(() => {
    if (!codEnabled && method === "COD") setMethod("RAZORPAY");
  }, [codEnabled, method]);

  const subtotal = cart.subtotal();
  const total = subtotal - discount;
  const itemCount = cart.lines.reduce((n, l) => n + l.qty, 0);
  const prepTime = vendorData?.vendor.prepTime;

  if (cart.lines.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50/50">
        <SiteHeader />
        <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-4 py-32 px-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <ShoppingCart className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Your cart is empty</h2>
          <p className="text-sm text-slate-500">Looks like you haven't added anything to your cart yet.</p>
          <Link to="/" className="mt-2">
            <Button>Browse vendors</Button>
          </Link>
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
    if (paymentsDisabled) {
      toast.error("Payments are temporarily disabled. Please try again later.");
      return;
    }
    if (!name.trim() || !phone.trim()) {
      toast.error("Please enter your name and phone number");
      return;
    }
    setPlacing(true);

    try {
      const isCod = method === "COD" && codEnabled;

      // 1. Create the PreSnag order (unpaid until Cashfree confirms payment).
      const order = await api<Order>("/api/public/orders", {
        method: "POST",
        body: {
          slug: cart.vendorSlug,
          customerName: name,
          customerPhone: phone,
          note,
          orderType,
          paymentMethod: isCod ? "COD" : "CASHFREE",
          couponCode: appliedCode,
          items: cart.lines.map((l) => ({
            itemId: l.itemId,
            qty: l.qty,
            instructions: l.instructions,
            selectedOptions: (l.addons ?? []).map((a) => ({ group: a.group, label: a.label })),
          })),
        },
      });

      // Cash on Delivery — no gateway; the order is placed and the vendor alerted.
      if (isCod) {
        toast.success("Order placed! Pay at pickup.");
        cart.clear();
        navigate(`/order/${order.orderNumber}`);
        return;
      }

      // 2. Create the payment order with whichever gateway the admin enabled.
      const pay = await api<{
        provider: "CASHFREE" | "RAZORPAY";
        demo: boolean;
        paymentSessionId?: string;
        razorpayOrderId?: string;
        amount?: number;
        currency?: string;
        keyId?: string;
      }>("/api/payments/order", { method: "POST", body: { orderNumber: order.orderNumber } });

      // Demo mode (gateway not configured) — simulate a successful payment.
      if (pay.demo) {
        await api("/api/payments/cashfree/demo-confirm", {
          method: "POST",
          body: { orderNumber: order.orderNumber },
        });
        navigate(`/order/${order.orderNumber}`);
        return;
      }

      // 3. Open the right gateway's checkout.
      if (pay.provider === "RAZORPAY") {
        const Razorpay = await loadRazorpaySdk();
        await new Promise<void>((resolve) => {
          const rzp = new Razorpay({
            key: pay.keyId,
            order_id: pay.razorpayOrderId,
            amount: pay.amount,
            currency: pay.currency || "INR",
            name: "PreSnag",
            description: `Order ${order.orderNumber}`,
            prefill: { name, contact: phone },
            theme: { color: "#f97316" },
            handler: async (resp: any) => {
              try {
                await api("/api/payments/verify", {
                  method: "POST",
                  body: {
                    orderNumber: order.orderNumber,
                    razorpayPaymentId: resp.razorpay_payment_id,
                    razorpayOrderId: resp.razorpay_order_id,
                    razorpaySignature: resp.razorpay_signature,
                  },
                });
              } catch {
                /* the order page re-verifies as a fallback */
              }
              navigate(`/order/${order.orderNumber}`);
              resolve();
            },
            modal: {
              ondismiss: () => {
                // Payment cancelled — order stays unpaid; cart kept for retry.
                navigate(`/order/${order.orderNumber}`);
                resolve();
              },
            },
          });
          rzp.open();
        });
        return;
      }

      // CASHFREE — hosted redirect; the order page confirms the payment.
      const Cashfree = await loadCashfreeSdk();
      const cashfree = Cashfree({ mode: CASHFREE_MODE });
      await cashfree.checkout({ paymentSessionId: pay.paymentSessionId, redirectTarget: "_self" });
      navigate(`/order/${order.orderNumber}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-28 md:pb-12">
      <SiteHeader />
      <div className="mx-auto max-w-4xl px-4 pt-2 pb-6 md:pt-4 md:pb-8">
        
        {/* Header */}
        <div className="mb-3 flex items-center gap-1.5 sm:gap-2">
          {/* Tweak the -top class below to shift the icon up/down as needed */}
          <ShieldCheck 
            className="relative -top-[2px] min-[375px]:-top-[3px] h-5 min-[375px]:h-6 w-5 min-[375px]:w-6 text-brand-500 shrink-0" 
            strokeWidth={2} 
          />
          <div className="leading-tight">
            <h1 className="text-base min-[375px]:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
              Secure Checkout
            </h1>
            <p className="text-xs text-slate-500 whitespace-nowrap">
              Your order will be confirmed instantly
            </p>
          </div>
        </div>

        {/* Admin-controlled notice banner */}
        <DemoBanner placement="checkout" className="mb-4" />

        <div className="grid gap-4 md:grid-cols-12 md:gap-8">

          {/* Left Column: Forms */}
          <div className="space-y-4 md:col-span-7 md:space-y-6">
            
            {/* Contact Details */}
            <Card className="border-slate-200/60 shadow-sm p-3 min-[375px]:p-4 md:p-5">
              <div className="mb-3 min-[375px]:mb-4 flex items-center justify-between">
                <h3 className="text-sm min-[375px]:text-base font-semibold text-slate-900">Contact Details</h3>
                <User className="h-4 w-4 min-[375px]:h-5 min-[375px]:w-5 text-brand-500" />
              </div>
              <div className="space-y-3 min-[375px]:space-y-4">
                <div className="space-y-1 min-[375px]:space-y-1.5">
                  <Label className="text-[10px] min-[375px]:text-xs font-medium text-slate-700">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-2.5 min-[375px]:left-3 top-1/2 h-3.5 w-3.5 min-[375px]:h-4 min-[375px]:w-4 -translate-y-1/2 text-slate-400" />
                    <Input 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="John Doe" 
                      className="h-9 min-[375px]:h-10 pl-8 min-[375px]:pl-9 text-xs min-[375px]:text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1 min-[375px]:space-y-1.5">
                  <Label className="text-[10px] min-[375px]:text-xs font-medium text-slate-700">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-2.5 min-[375px]:left-3 top-1/2 h-3.5 w-3.5 min-[375px]:h-4 min-[375px]:w-4 -translate-y-1/2 text-slate-400" />
                    <Input 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      placeholder="10-digit mobile" 
                      type="tel"
                      className="h-9 min-[375px]:h-10 pl-8 min-[375px]:pl-9 text-xs min-[375px]:text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1 min-[375px]:space-y-1.5">
                  <Label className="text-[10px] min-[375px]:text-xs font-medium text-slate-700">Order Notes (Optional)</Label>
                  <div className="relative">
                    <FileText className="absolute left-2.5 min-[375px]:left-3 top-3 h-3.5 w-3.5 min-[375px]:h-4 min-[375px]:w-4 text-slate-400" />
                    <Textarea 
                      value={note} 
                      onChange={(e) => setNote(e.target.value)} 
                      rows={2} 
                      placeholder="E.g., Please ensure the food is extra spicy..." 
                      className="resize-none pl-8 min-[375px]:pl-9 py-2 min-[375px]:py-2.5 text-xs min-[375px]:text-sm min-h-[40px] min-[375px]:min-h-[44px]"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Order Type */}
            <Card className="border-slate-200/60 shadow-sm p-3 min-[375px]:p-4 md:p-5">
              <div className="mb-2.5 flex items-center justify-between">
                <h3 className="text-sm min-[375px]:text-base font-semibold text-slate-900">Order Type</h3>
                <Utensils className="h-4 w-4 text-brand-500" />
              </div>
              <div className="flex gap-2">
                {([
                  { key: "DINE_IN", label: "Dine In", icon: Utensils },
                  { key: "TAKE_AWAY", label: "Take Away", icon: ShoppingBag },
                ] as const).map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setOrderType(opt.key)}
                    className={cn(
                      "flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border text-xs font-semibold transition",
                      orderType === opt.key
                        ? "border-brand-500 bg-brand-50 text-brand-600 ring-1 ring-brand-500"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    )}
                  >
                    <opt.icon className="h-3.5 w-3.5" /> {opt.label}
                  </button>
                ))}
              </div>
            </Card>

            {/* Payment Method */}
            <Card className="border-slate-200/60 shadow-sm p-3 min-[375px]:p-4 md:p-5">
              <div className="mb-3 min-[375px]:mb-4 flex items-center justify-between">
                <h3 className="text-sm min-[375px]:text-base font-semibold text-slate-900">Payment Method</h3>
                <CreditCard className="h-4 w-4 min-[375px]:h-5 min-[375px]:w-5 text-brand-500" />
              </div>
              <div className="space-y-2.5 min-[375px]:space-y-3">
                <button
                  onClick={() => setMethod("RAZORPAY")}
                  className={cn(
                    "relative flex w-full items-center gap-2 min-[375px]:gap-3 rounded-xl border p-3 min-[375px]:p-4 text-left transition-all",
                    method === "RAZORPAY" 
                      ? "border-brand-500 bg-brand-50/20 ring-1 ring-brand-500 shadow-sm" 
                      : "border-slate-200 bg-white hover:border-slate-300"
                  )}
                >
                  <Smartphone className={cn("h-5 w-5 min-[375px]:h-6 min-[375px]:w-6 shrink-0", method === "RAZORPAY" ? "text-brand-500" : "text-slate-400")} />
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className={cn("text-xs min-[375px]:text-sm font-semibold", method === "RAZORPAY" ? "text-slate-900" : "text-slate-700")}>
                        Pay Online
                      </span>
                      <div className="flex items-center gap-0.5 rounded border border-slate-200/80 bg-slate-50 px-1.5 py-0.5 select-none scale-95 origin-left shrink-0">
                        <span className="font-black text-[#0654A2] tracking-wider text-[9px] leading-none">UPI</span>
                        <svg className="h-2 w-auto" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <polygon points="1,1 5,6 1,11 4,11 8,6 4,1" fill="#F47920" />
                          <polygon points="6,1 10,6 6,11 9,11 13,6 9,1" fill="#0FA76F" />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-0.5 text-[10px] min-[375px]:text-xs text-slate-500">
                      GPay, PhonePe, Paytm, Cards
                    </div>
                  </div>
                  {method === "RAZORPAY" ? (
                    <CheckCircle2 className="h-5 w-5 min-[375px]:h-6 min-[375px]:w-6 text-brand-500 fill-brand-500 text-white shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 min-[375px]:h-6 min-[375px]:w-6 text-slate-200 shrink-0" />
                  )}
                </button>

                {/* Cash on Delivery — only when the admin has enabled it. */}
                {codEnabled && (
                  <button
                    onClick={() => setMethod("COD")}
                    className={cn(
                      "relative flex w-full items-center gap-2 min-[375px]:gap-3 rounded-xl border p-3 min-[375px]:p-4 text-left transition-all",
                      method === "COD"
                        ? "border-brand-500 bg-brand-50/20 ring-1 ring-brand-500 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    )}
                  >
                    <Banknote className={cn("h-5 w-5 min-[375px]:h-6 min-[375px]:w-6 shrink-0", method === "COD" ? "text-brand-500" : "text-slate-400")} />
                    <div className="flex-1">
                      <span className={cn("text-xs min-[375px]:text-sm font-semibold", method === "COD" ? "text-slate-900" : "text-slate-700")}>
                        Cash on Delivery
                      </span>
                      <div className="mt-0.5 text-[10px] min-[375px]:text-xs text-slate-500">
                        Pay at pickup — no online payment
                      </div>
                    </div>
                    {method === "COD" ? (
                      <CheckCircle2 className="h-5 w-5 min-[375px]:h-6 min-[375px]:w-6 text-brand-500 fill-brand-500 text-white shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 min-[375px]:h-6 min-[375px]:w-6 text-slate-200 shrink-0" />
                    )}
                  </button>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column: Order Summary */}
          <div className="md:col-span-5">
            <Card className="sticky top-6 border-slate-200/60 shadow-sm p-4 md:p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">Order Summary</h3>
                <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </span>
              </div>
              <div className="mb-5 flex items-center gap-3 text-xs text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Store className="h-4 w-4 text-slate-400" />
                  {cart.vendorName}
                </span>
                <span className="h-3 w-px bg-slate-300" />
                {prepTime != null && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-slate-400" />
                    ~{prepTime} min
                  </span>
                )}
              </div>

              {/* Items */}
              <div className="space-y-4 mb-6">
                {cart.lines.map((l) => (
                  <div key={l.lineKey} className="flex items-start justify-between text-sm">
                    <div className="flex items-start gap-3">
                      <span className="flex h-6 items-center justify-center rounded bg-slate-100 px-2 text-xs font-semibold text-slate-700">
                        {l.qty}x
                      </span>
                      <div className="pt-0.5">
                        <span className="text-slate-700">{l.name}</span>
                        {(l.addons ?? []).length > 0 && (
                          <div className="text-[11px] text-slate-400">{(l.addons ?? []).map((a) => a.label).join(", ")}</div>
                        )}
                      </div>
                    </div>
                    <span className="font-medium text-slate-900 pt-0.5">{rupees(l.price * l.qty)}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 border-t border-slate-100 pt-4 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>{rupees(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount ({appliedCode})</span>
                    <span>−{rupees(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between border-t border-slate-100 pt-4 text-base font-bold text-slate-900">
                  <span>Total Amount</span>
                  <span>{rupees(total)}</span>
                </div>
              </div>
            </Card>
          </div>
          
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] md:static md:border-none md:bg-transparent md:p-0 md:shadow-none md:mt-8 mx-auto max-w-4xl px-4 md:px-0">
        {isStoreClosed ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm font-medium text-red-800">
            🚫 Store is currently closed
          </div>
        ) : paymentsDisabled ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center text-sm font-medium text-amber-800">
            ⏸️ Payments are temporarily disabled. Please try again later.
          </div>
        ) : (
          <Button
            className="w-full h-14 text-base font-semibold shadow-md bg-brand-500 hover:bg-brand-600 text-white rounded-xl flex items-center justify-center gap-2"
            onClick={placeOrder}
            disabled={placing || loadingVendor}
          >
            {placing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <ShieldCheck className="h-5 w-5" />
                <span>Confirm Order • {rupees(total)}</span>
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}