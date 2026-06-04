import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Check, Clock, ChefHat, Package, ShoppingBag, XCircle } from "lucide-react";
import { api } from "@/lib/api";
import { Order, OrderStatus } from "@/lib/types";
import { SiteHeader } from "@/components/SiteHeader";
import { Card, Spinner, Badge } from "@/components/ui";
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

  const cancelled = order.status === "cancelled";
  const currentIdx = STEPS.findIndex((s) => s.key === order.status);
  const vendor = typeof order.vendorId === "object" ? order.vendorId : null;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-lg px-4 py-8">
        <div className="mb-6 text-center">
          <div className="text-xs text-slate-400">Tracking</div>
          <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
          <p className="text-sm text-slate-500">{vendor?.name}</p>
        </div>

        {cancelled ? (
          <Card className="flex flex-col items-center gap-2 p-8 text-center">
            <XCircle className="h-12 w-12 text-red-500" />
            <p className="font-semibold">This order was cancelled</p>
          </Card>
        ) : (
          <Card className="p-6">
            <div className="relative">
              {STEPS.map((step, i) => {
                const done = i <= currentIdx;
                const active = i === currentIdx;
                const Icon = step.icon;
                return (
                  <div key={step.key} className="flex gap-4 pb-8 last:pb-0">
                    <div className="relative flex flex-col items-center">
                      <div
                        className={cn(
                          "z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition",
                          done ? "border-brand-500 bg-brand-500 text-white" : "border-slate-200 bg-white text-slate-300",
                          active && "animate-pulse-ring"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className={cn("absolute top-10 h-full w-0.5", done ? "bg-brand-500" : "bg-slate-200")} />
                      )}
                    </div>
                    <div className="pt-1.5">
                      <div className={cn("font-medium", done ? "text-slate-800" : "text-slate-400")}>{step.label}</div>
                      {active && <div className="text-xs text-brand-600">In progress…</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        <Card className="mt-5 p-5">
          <h3 className="mb-2 font-semibold">Order Items</h3>
          {order.items.map((it, i) => (
            <div key={i} className="flex justify-between py-1 text-sm">
              <span className="text-slate-600">{it.qty} × {it.name}</span>
              <span>{rupees(it.price * it.qty)}</span>
            </div>
          ))}
          <div className="mt-2 flex justify-between border-t border-slate-100 pt-2 font-bold">
            <span>Total</span><span>{rupees(order.total)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>{order.paymentMethod === "COD" ? "Cash On Pickup" : "Online"}</span>
            <Badge color={order.paymentStatus === "paid" ? "green" : "yellow"}>{order.paymentStatus}</Badge>
          </div>
        </Card>

        <Link to="/" className="mt-5 block text-center text-sm text-slate-500 hover:underline">
          Back to home
        </Link>
      </div>
    </div>
  );
}
