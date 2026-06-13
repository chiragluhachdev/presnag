  import { useEffect, useState } from "react";
  import { useParams, Link } from "react-router-dom";
  import { useQuery } from "@tanstack/react-query";
  import { Check, Clock, ChefHat, Package, ShoppingBag, XCircle, Copy, ArrowLeft } from "lucide-react";
  import { api } from "@/lib/api";
  import { Order, OrderStatus, Vendor } from "@/lib/types";
  import { SiteHeader } from "@/components/SiteHeader";
  import { Card, Spinner, Badge } from "@/components/ui";
  import { toast } from "@/components/ui/toast";
  import { getSocket } from "@/lib/socket";
  import { rupees, cn } from "@/lib/utils";

  const STEPS: { key: OrderStatus; label: string; icon: any }[] = [
    { key: "received", label: "Order Received", icon: Clock },
    { key: "accepted", label: "Accepted", icon: Check },
    { key: "preparing", label: "Preparing", icon: ChefHat },
    { key: "ready", label: "Ready for Pickup", icon: Package },
    { key: "collected", label: "Collected", icon: ShoppingBag },
  ];

  export default function OrderTracking() {
    const { orderNumber } = useParams<{ orderNumber: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [copied, setCopied] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    async function cancelOrder() {
      if (!order || !window.confirm("Cancel this order? This can't be undone.")) return;
      setCancelling(true);
      try {
        const updated = await api<Order>(`/api/public/orders/${order.orderNumber}/cancel`, { method: "POST" });
        setOrder(updated);
        toast.success("Order cancelled");
      } catch (e: any) {
        toast.error(e.message || "Couldn't cancel the order");
      } finally {
        setCancelling(false);
      }
    }

    const { data, isLoading } = useQuery({
      queryKey: ["track", orderNumber],
      queryFn: () => api<Order>(`/api/public/orders/${orderNumber}`),
      enabled: !!orderNumber,
    });

    useEffect(() => {
      if (data) setOrder(data);
    }, [data]);

    useEffect(() => {
      if (!orderNumber) return;
      const socket = getSocket();
      socket.emit("order:track", orderNumber);
      const handler = (updated: Order) => {
        if (updated.orderNumber === orderNumber) setOrder(updated);
      };
      socket.on("order:status", handler);
      return () => {
        socket.off("order:status", handler);
      };
    }, [orderNumber]);

    if (isLoading || !order)
      return (
        <div className="flex h-screen items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      );

    // An unpaid online order was never completed — nothing to track.
    if (order.paymentStatus !== "paid" && order.paymentMethod !== "COD") {
      return (
        <div className="min-h-screen flex flex-col bg-slate-50/50">
          <SiteHeader />
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
            <XCircle className="h-12 w-12 text-red-500" />
            <p className="text-sm font-semibold text-slate-800">This order wasn't completed</p>
            <p className="max-w-xs text-xs text-slate-500">
              The payment for this order didn't go through, so there's nothing to track.
            </p>
            <Link to="/" className="text-xs font-semibold text-brand-600 hover:underline">Back to home</Link>
          </div>
        </div>
      );
    }

    const cancelled = order.status === "cancelled";
    const currentIdx = STEPS.findIndex((s) => s.key === order.status);
    const currentStep = STEPS[currentIdx];
    const isReady = order.status === "ready";
    const isDone = order.status === "collected";
    const vendor = typeof order.vendorId === "object" ? (order.vendorId as Vendor) : null;

    const suffix = order.orderNumber.startsWith("PS-")
      ? order.orderNumber.substring(3) 
      : order.orderNumber;

    function handleCopy() {
      navigator.clipboard.writeText(suffix);
      setCopied(true);
      toast.success("Order ID copied!");
      setTimeout(() => setCopied(false), 2000);
    }

    return (
      <div className="min-h-screen flex flex-col bg-slate-50/50">
        <SiteHeader />
        
        <div className="flex-1 mx-auto w-full max-w-sm px-4 py-3">
          {/* Header Section */}
          <div className="mb-5 text-center flex flex-col items-center">
            <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
              Track <span className="text-brand-500">Order</span>
            </h1>
            
            {/* Copyable Order ID Pill */}
            <div className="mt-2.5 flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 shadow-sm select-none">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">ID:</span>
              <span className="font-mono text-xs font-black text-slate-800 tracking-wider">{suffix}</span>
              <button 
                onClick={handleCopy}
                className="ml-0.5 p-0.5 rounded-full hover:bg-slate-100 active:bg-slate-200 text-slate-400 hover:text-slate-600 transition"
                title="Copy Order ID"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-emerald-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
            </div>

            <p className="text-[11px] font-bold text-slate-800 tracking-wide uppercase mt-2.5">
              {vendor?.name || "SHOP"}
            </p>
          </div>

          {cancelled ? (
            <Card className="flex flex-col items-center gap-2.5 p-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
              <p className="text-base font-bold text-slate-900">
                {order.cancelledBy === "system" ? "Order couldn't be accepted" : "Order cancelled"}
              </p>
              <p className="max-w-xs text-xs leading-relaxed text-slate-500">
                {order.cancelReason ||
                  (order.cancelledBy === "system"
                    ? "The restaurant didn't respond in time, so your order was cancelled."
                    : "This order was cancelled.")}
              </p>
              {order.paymentStatus === "paid" && order.paymentMethod !== "COD" && (
                <p className="mt-1 max-w-xs rounded-lg bg-emerald-50 px-3 py-2 text-[11px] font-medium leading-relaxed text-emerald-700">
                  Any amount you paid will be refunded to your original payment method within 5–7 business days.
                </p>
              )}
              <Link to="/" className="mt-1 text-xs font-semibold text-brand-600 hover:underline">
                Order from another place
              </Link>
            </Card>
          ) : (
            <Card className="overflow-hidden shadow-sm">
              {/* Current status banner */}
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3",
                  isReady
                    ? "bg-emerald-500 text-white"
                    : isDone
                    ? "bg-slate-800 text-white"
                    : "bg-brand-500 text-white"
                )}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20">
                  {currentStep && <currentStep.icon className="h-5 w-5" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold leading-tight">
                    {isReady ? "Your order is ready! 🎉" : isDone ? "Order collected" : currentStep?.label}
                  </p>
                  <p className="text-[11px] text-white/80 leading-tight mt-0.5">
                    {isReady
                      ? "Head to the counter to collect it."
                      : isDone
                      ? "Thanks for ordering with PreSnag."
                      : `Estimated pickup in ~${order.pickupTime || "a few"} ${order.pickupTime ? "" : "mins"}`}
                  </p>
                </div>
              </div>

              <div className="relative p-4">
                {STEPS.map((step, i) => {
                  const done = i <= currentIdx;
                  const active = i === currentIdx;
                  const Icon = step.icon;
                  return (
                    <div key={step.key} className="flex gap-3 pb-4 last:pb-0">
                      <div className="relative flex flex-col items-center">
                        <div
                          className={cn(
                            "z-10 flex h-7 w-7 items-center justify-center rounded-full border transition",
                            done ? "border-brand-500 bg-brand-500 text-white" : "border-slate-200 bg-white text-slate-300",
                            active && "animate-pulse-ring"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        {i < STEPS.length - 1 && (
                          <div className={cn("absolute top-7 h-full w-0.5", done ? "bg-brand-500" : "bg-slate-200")} />
                        )}
                      </div>
                      <div className="pt-0.5">
                        <div className={cn("text-xs font-semibold", done ? "text-slate-800" : "text-slate-400")}>{step.label}</div>
                        {active && (
                          isDone ? (
                            <div className="text-[10px] font-medium text-emerald-600">Completed ✓</div>
                          ) : (
                            <div className="text-[10px] font-medium text-brand-600">In progress…</div>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Customer-initiated cancellation — only before the kitchen starts. */}
          {!cancelled && (order.status === "received" || order.status === "accepted") && (
            <button
              onClick={cancelOrder}
              disabled={cancelling}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
            >
              {cancelling ? <Spinner className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              Cancel Order
            </button>
          )}

          {/* Compact Order Items Card */}
          <Card className="mt-3 p-3.5 shadow-sm">
            <h3 className="mb-2 text-xs font-bold text-slate-800 uppercase tracking-wider">Order Items</h3>
            <div className="divide-y divide-slate-100/60 max-h-24 overflow-y-auto pr-1">
              {order.items.map((it, i) => (
                <div key={i} className="flex justify-between py-1 text-xs">
                  <span className="text-slate-600">{it.qty} × {it.name}</span>
                  <span className="font-semibold text-slate-800">{rupees(it.price * it.qty)}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between border-t border-slate-100 pt-2 text-xs font-black text-slate-900">
              <span>Total</span><span>{rupees(order.total)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
              <span className="font-mono">{order.paymentMethod === "COD" ? "CASH ON PICKUP" : "ONLINE (UPI)"}</span>
              <Badge color={order.paymentStatus === "paid" ? "green" : "yellow"}>{order.paymentStatus}</Badge>
            </div>
          </Card>

          <Link 
            to="/" 
            className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to home</span>
          </Link>
        </div>

        <footer className="w-full mt-auto py-3 border-t border-slate-200/40 bg-white/30 backdrop-blur-sm text-center text-[9px] text-slate-400 font-mono tracking-wide print:hidden">
          <div>© {new Date().getFullYear()} PreSnag Technologies. All rights reserved.</div>
          <div className="mt-0.5 text-slate-400/60 font-sans text-[8px]">Powering instant order-ahead & queue-free pickups.</div>
        </footer>
      </div>
    );
  }
