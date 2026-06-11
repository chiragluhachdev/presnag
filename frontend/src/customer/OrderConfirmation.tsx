import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock, Download, FileText, ArrowLeft, Copy, Check, XCircle, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { Order, Vendor } from "@/lib/types";
import { SiteHeader } from "@/components/SiteHeader";
import { Button, Spinner } from "@/components/ui";
import { toast } from "@/components/ui/toast";
import { useCart } from "@/store/cartStore";
import { rupees } from "@/lib/utils";

function JaggedEdgeTop() {
  return (
    <svg className="w-full h-2 text-white fill-current block print:hidden" viewBox="0 0 100 10" preserveAspectRatio="none">
      <path d="M0 10 L5 0 L10 10 L15 0 L20 10 L25 0 L30 10 L35 0 L40 10 L45 0 L50 10 L55 0 L60 10 L65 0 L70 10 L75 0 L80 10 L85 0 L90 10 L95 0 L100 10 Z" />
    </svg>
  );
}

function JaggedEdgeBottom() {
  return (
    <svg className="w-full h-2 text-white fill-current block print:hidden" viewBox="0 0 100 10" preserveAspectRatio="none">
      <path d="M0 0 L5 10 L10 0 L15 10 L20 0 L25 10 L30 0 L35 10 L40 0 L45 10 L50 0 L55 10 L60 0 L65 10 L70 0 L75 10 L80 0 L85 10 L90 0 L95 10 L100 0 Z" />
    </svg>
  );
}

export default function OrderConfirmation() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const cart = useCart();
  const [copied, setCopied] = useState(false);
  // null = still checking, true/false = verified result
  const [paidCheck, setPaidCheck] = useState<boolean | null>(null);
  const clearedRef = useRef(false);
  const qc = useQueryClient();
  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderNumber],
    queryFn: () => api<Order>(`/api/public/orders/${orderNumber}`),
    enabled: !!orderNumber,
  });

  // On return from Cashfree checkout, confirm the payment with the gateway
  // (works on localhost without a public webhook).
  useEffect(() => {
    if (!orderNumber) return;
    api<{ paid: boolean }>("/api/payments/cashfree/verify", { method: "POST", body: { orderNumber } })
      .then((r) => {
        setPaidCheck(!!r.paid);
        if (r.paid) qc.invalidateQueries({ queryKey: ["order", orderNumber] });
      })
      .catch(() => setPaidCheck(false));
  }, [orderNumber, qc]);

  const paid = order?.paymentStatus === "paid" || paidCheck === true;

  // Clear the cart only once payment is confirmed (so a failed payment keeps
  // the cart intact for a retry).
  useEffect(() => {
    if (paid && !clearedRef.current) {
      clearedRef.current = true;
      cart.clear();
    }
  }, [paid, cart]);

  const vendor = typeof order?.vendorId === "object" ? (order!.vendorId as Vendor) : null;

  // Still loading the order or waiting on the payment verification.
  if (isLoading || paidCheck === null) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50/50">
        <SiteHeader />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4">
          <Spinner className="h-8 w-8" />
          <p className="text-sm text-slate-500">Confirming your payment…</p>
        </div>
      </div>
    );
  }
  if (!order) return <div className="py-32 text-center text-slate-500">Order not found.</div>;

  // Payment failed / not completed → do NOT show the order ticket.
  if (!paid) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50/50">
        <SiteHeader />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
            <XCircle className="h-9 w-9" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900">Payment not completed</h1>
            <p className="mt-1 text-sm text-slate-500">
              Your payment didn't go through, so this order wasn't placed. No money was charged.
            </p>
          </div>
          <div className="mt-2 w-full space-y-2">
            <Link to="/checkout" className="block">
              <Button className="w-full" size="lg">
                <RefreshCw className="h-4 w-4" /> Try Again
              </Button>
            </Link>
            <Link to={vendor?.slug ? `/vendor/${vendor.slug}` : "/"} className="block">
              <Button variant="outline" className="w-full">
                {vendor?.slug ? "Back to menu" : "Back to home"}
              </Button>
            </Link>
          </div>
          <p className="text-[11px] text-slate-400">
            Already paid? Wait a moment and refresh this page.
          </p>
        </div>
      </div>
    );
  }

  const suffix = order.orderNumber.startsWith("PS-") 
    ? order.orderNumber.substring(3) 
    : order.orderNumber;

  function handleCopy() {
    navigator.clipboard.writeText(suffix);
    setCopied(true);
    toast.success("Order ID copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadTextReceipt() {
    if (!order) return;
    const vendorName = vendor?.name || "Vendor";
    const itemsText = order.items
      .map((it) => `${it.qty}x ${it.name.padEnd(25)} ${rupees(it.price * it.qty)}`)
      .join("\n");
    
    const receiptContent = `========================================
           PRESNAG ORDER RECEIPT
========================================
Order Number : ${order.orderNumber}
Vendor       : ${vendorName}
Status       : ${order.status.toUpperCase()}
Date/Time    : ${new Date(order.createdAt).toLocaleString()}
----------------------------------------
ITEMS:
${itemsText}
----------------------------------------
Subtotal     : ${rupees(order.subtotal)}
${order.discount > 0 ? `Discount     : -${rupees(order.discount)}\n` : ""}\
Taxes (5%)   : ${rupees(order.tax)}
TOTAL        : ${rupees(order.total)}
----------------------------------------
Payment      : ${order.paymentMethod === "COD" ? "Cash On Pickup" : "Online (UPI)"}
Status       : ${order.paymentStatus}
========================================
       Thank you for ordering!
========================================`;
    
    const blob = new Blob([receiptContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `PreSnag_Receipt_${order.orderNumber}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 print:bg-white print:pb-0">
      <div className="print:hidden">
        <SiteHeader />
      </div>
      
      <div className="flex-1 mx-auto w-full max-w-sm px-4 py-3 print:p-0 print:max-w-none">
        
        {/* Printable Header (only visible on print) */}
        <div className="hidden print:flex flex-col items-center text-center pb-4 border-b-2 border-slate-200 mb-4">
          <div className="text-2xl font-black tracking-tight text-slate-900">
            Pre<span className="text-brand-500">Snag</span>
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-semibold mt-0.5">
            Order Ahead. Skip The Queue.
          </p>
          <h1 className="text-base font-bold text-slate-800 mt-2">ORDER INVOICE</h1>
        </div>

         {/* Success Header */}
        <div className="text-center mb-4 print:hidden">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 shadow-inner">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h1 className="mt-2 text-lg font-extrabold tracking-tight text-slate-900">Order Confirmed!</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Sent to <span className="font-semibold text-slate-700">{vendor?.name}</span>
          </p>
          <p className="text-[10px] text-brand-600 font-medium mt-1">
            Keep your Order ID handy to track your pickup later!
          </p>
        </div>

        {/* Jagged Receipt Card */}
        <div className="relative shadow-[0_4px_20px_rgba(0,0,0,0.04)] print:shadow-none">
          <JaggedEdgeTop />
          
          <div className="bg-white px-4 py-3 pt-0.5 print:p-0">
            {/* Store Header */}
            <div className="text-center pb-2.5 border-b border-dashed border-slate-200 flex flex-col items-center">
              <div className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Order ID (Tap to copy)</div>
              <button 
                onClick={handleCopy}
                className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200/80 active:bg-slate-300/60 transition font-mono text-base font-black text-slate-800 tracking-wider"
                title="Copy Order ID"
              >
                <span>{suffix}</span>
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="h-3 w-3 text-slate-400" />
                )}
              </button>
              <div className="text-[9px] text-slate-400 mt-1.5 font-mono">
                {new Date(order.createdAt).toLocaleString()}
              </div>
            </div>

            {/* Receipt Info */}
            <div className="py-2.5 space-y-1 text-xs border-b border-dashed border-slate-200 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">ORDER NUMBER:</span>
                <span className="font-bold text-slate-800">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">CUSTOMER:</span>
                <span className="text-slate-700 uppercase font-semibold">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">STATUS:</span>
                <span className="font-bold text-brand-600 uppercase">{order.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">ORDER TYPE:</span>
                <span className="font-bold text-slate-800">{order.orderType === "TAKE_AWAY" ? "Take Away" : "Dine In"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">EST. PICKUP:</span>
                <span className="font-bold text-slate-800">{order.pickupTime}</span>
              </div>
            </div>

            {/* Items Table */}
            <div className="py-2.5 space-y-1.5 border-b border-dashed border-slate-200">
              {order.items.map((it, i) => (
                <div key={i} className="flex justify-between text-xs font-mono">
                  <div className="flex items-start gap-2 max-w-[75%]">
                    <span className="text-slate-400 font-semibold">{it.qty}x</span>
                    <span className="text-slate-700">{it.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">{rupees(it.price * it.qty)}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="py-2.5 space-y-1.5 border-b border-dashed border-slate-200 text-xs font-mono">
              <div className="flex justify-between text-slate-500 font-medium">
                <span>SUBTOTAL</span>
                <span>{rupees(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>DISCOUNT</span>
                  <span>−{rupees(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500 font-medium">
                <span>TAXES (5%)</span>
                <span>{rupees(order.tax)}</span>
              </div>
              <div className="flex justify-between text-xs font-black text-slate-900 pt-0.5">
                <span>TOTAL PAID</span>
                <span>{rupees(order.total)}</span>
              </div>
            </div>

            {/* Footer details */}
            <div className="pt-2.5 text-center space-y-2 font-mono">
              <div className="text-[9px] text-slate-400 leading-normal">
                PAYMENT: {order.paymentMethod === "COD" ? "CASH ON PICKUP" : "ONLINE (UPI)"} | {order.paymentStatus.toUpperCase()}
              </div>
              
              <div className="text-[10px] font-bold text-slate-600 tracking-wider">
                *** THANK YOU FOR ORDERING ***
              </div>

              {/* Decorative Barcode */}
              <div className="flex flex-col items-center justify-center opacity-80 pt-1 print:hidden">
                <svg className="h-5 w-36 text-slate-800" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <rect x="0" y="0" width="2" height="20" fill="currentColor" />
                  <rect x="3" y="0" width="1" height="20" fill="currentColor" />
                  <rect x="6" y="0" width="4" height="20" fill="currentColor" />
                  <rect x="12" y="0" width="1" height="20" fill="currentColor" />
                  <rect x="15" y="0" width="2" height="20" fill="currentColor" />
                  <rect x="19" y="0" width="3" height="20" fill="currentColor" />
                  <rect x="24" y="0" width="1" height="20" fill="currentColor" />
                  <rect x="27" y="0" width="5" height="20" fill="currentColor" />
                  <rect x="34" y="0" width="2" height="20" fill="currentColor" />
                  <rect x="38" y="0" width="1" height="20" fill="currentColor" />
                  <rect x="41" y="0" width="3" height="20" fill="currentColor" />
                  <rect x="46" y="0" width="2" height="20" fill="currentColor" />
                  <rect x="50" y="0" width="1" height="20" fill="currentColor" />
                  <rect x="53" y="0" width="4" height="20" fill="currentColor" />
                  <rect x="59" y="0" width="2" height="20" fill="currentColor" />
                  <rect x="63" y="0" width="1" height="20" fill="currentColor" />
                  <rect x="66" y="0" width="3" height="20" fill="currentColor" />
                  <rect x="71" y="0" width="5" height="20" fill="currentColor" />
                  <rect x="78" y="0" width="1" height="20" fill="currentColor" />
                  <rect x="81" y="0" width="2" height="20" fill="currentColor" />
                  <rect x="85" y="0" width="3" height="20" fill="currentColor" />
                  <rect x="90" y="0" width="1" height="20" fill="currentColor" />
                  <rect x="93" y="0" width="2" height="20" fill="currentColor" />
                  <rect x="97" y="0" width="3" height="20" fill="currentColor" />
                </svg>
                <span className="text-[8px] font-mono tracking-widest text-slate-400 mt-0.5">{order.orderNumber}</span>
              </div>
            </div>
          </div>
          
          <JaggedEdgeBottom />
        </div>

        {/* Buttons / Actions */}
        <div className="mt-4 space-y-2 print:hidden">
          <div className="grid grid-cols-2 gap-2">
            <Link to={`/track/${order.orderNumber}`} className="block">
              <Button className="w-full h-9 text-[11px] font-semibold rounded-lg bg-brand-500 hover:bg-brand-600 text-white shadow-sm">
                Track Order
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              className="w-full h-9 text-[11px] font-semibold rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1"
              onClick={downloadTextReceipt}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Get Receipt</span>
            </Button>
          </div>

          <div className="flex justify-between items-center px-1 text-[10px] text-slate-400">
            <button 
              onClick={() => window.print()}
              className="hover:text-slate-600 hover:underline flex items-center gap-1"
            >
              <Download className="h-3 w-3" />
              <span>Download PDF</span>
            </button>

            <Link to="/" className="hover:text-brand-600 hover:underline inline-flex items-center gap-0.5">
              <ArrowLeft className="h-2.5 w-2.5" />
              <span>Other vendor</span>
            </Link>
          </div>
        </div>

      </div>

      <footer className="w-full mt-auto py-3 border-t border-slate-200/40 bg-white/30 backdrop-blur-sm text-center text-[9px] text-slate-400 font-mono tracking-wide print:hidden">
        <div>© {new Date().getFullYear()} PreSnag Technologies. All rights reserved.</div>
        <div className="mt-0.5 text-slate-400/60 font-sans text-[8px]">Powering instant order-ahead & queue-free pickups.</div>
      </footer>
    </div>
  );
}
