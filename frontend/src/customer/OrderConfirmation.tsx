import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock } from "lucide-react";
import { api } from "@/lib/api";
import { Order } from "@/lib/types";
import { SiteHeader } from "@/components/SiteHeader";
import { Button, Card, Spinner, Badge } from "@/components/ui";
import { rupees } from "@/lib/utils";

export default function OrderConfirmation() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderNumber],
    queryFn: () => api<Order>(`/api/public/orders/${orderNumber}`),
    enabled: !!orderNumber,
  });

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  if (!order) return <div className="py-32 text-center text-slate-500">Order not found.</div>;

  const vendor = typeof order.vendorId === "object" ? order.vendorId : null;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-lg px-4 py-10">
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
          <h1 className="mt-3 text-2xl font-bold">Order Placed!</h1>
          <p className="text-slate-500">Your order has been sent to {vendor?.name}.</p>
        </div>

        <Card className="mt-6 p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="text-xs text-slate-400">Order Number</div>
              <div className="text-lg font-bold">{order.orderNumber}</div>
            </div>
            <Badge color="orange">{order.status}</Badge>
          </div>

          <div className="flex items-center gap-2 py-3 text-sm text-slate-600">
            <Clock className="h-4 w-4 text-brand-500" />
            Estimated pickup in <span className="font-semibold">{order.pickupTime}</span>
          </div>

          <div className="space-y-1 border-t border-slate-100 py-3">
            {order.items.map((it, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-slate-600">{it.qty} × {it.name}</span>
                <span>{rupees(it.price * it.qty)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-1 border-t border-slate-100 pt-3 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>{rupees(order.subtotal)}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>−{rupees(order.discount)}</span></div>}
            <div className="flex justify-between"><span className="text-slate-500">Tax</span><span>{rupees(order.tax)}</span></div>
            <div className="flex justify-between text-base font-bold"><span>Total</span><span>{rupees(order.total)}</span></div>
            <div className="flex justify-between pt-1 text-xs text-slate-400">
              <span>Payment</span>
              <span>{order.paymentMethod === "COD" ? "Cash On Pickup" : "Online (Razorpay)"} · {order.paymentStatus}</span>
            </div>
          </div>
        </Card>

        <Link to={`/track/${order.orderNumber}`}>
          <Button className="mt-5 w-full" size="lg">Track Order Live</Button>
        </Link>
        <Link to="/" className="mt-3 block text-center text-sm text-slate-500 hover:underline">
          Order from another vendor
        </Link>
      </div>
    </div>
  );
}
