import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2, MessageCircle } from "lucide-react";
import { api } from "@/lib/api";
import { Order, Vendor } from "@/lib/types";
import { Badge, Spinner, Input, Select, Button } from "@/components/ui";
import { toast } from "@/components/ui/toast";
import { rupees, timeAgo } from "@/lib/utils";
import { waConfirmUrl, waCancelUrl } from "@/lib/whatsapp";
import { PageHeader } from "./Overview";

const STATUSES = ["all", "received", "accepted", "preparing", "ready", "collected", "cancelled"];
const statusColor: Record<string, any> = {
  received: "orange", accepted: "blue", preparing: "purple", ready: "green", collected: "slate", cancelled: "red",
};

export default function Orders() {
  const qc = useQueryClient();
  const [status, setStatus] = useState("all");
  const [date, setDate] = useState("");
  const [clearing, setClearing] = useState(false);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders", status, date],
    queryFn: () =>
      api<Order[]>(`/api/admin/orders?status=${status}${date ? `&date=${date}` : ""}`, { auth: true }),
  });

  async function clearAll() {
    if (!window.confirm("Clear ALL order history across every vendor? This permanently deletes all orders and cannot be undone.")) return;
    setClearing(true);
    try {
      const r: any = await api("/api/admin/orders", { method: "DELETE", auth: true });
      toast.success(`Cleared ${r.deleted} orders`);
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      qc.invalidateQueries({ queryKey: ["admin-overview"] });
    } catch (e: any) {
      toast.error(e.message || "Failed to clear");
    } finally {
      setClearing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <PageHeader title="Order Monitoring" subtitle="Track every order placed across all vendors in real time." />
        <Button variant="outline" size="sm" onClick={clearAll} disabled={clearing}>
          <Trash2 className="h-4 w-4 text-red-500" /> Clear All History
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <span className="text-sm font-semibold text-slate-500">Filter</span>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-44 capitalize">
          {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
        </Select>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-44" />
        {date && <button onClick={() => setDate("")} className="text-sm font-medium text-brand-600 hover:underline">Clear date</button>}
        {orders && <span className="ml-auto text-sm text-slate-400">{orders.length} order(s)</span>}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>
      ) : !orders?.length ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-400">
          No orders found.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Vendor</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Items</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Time</th>
                <th className="px-5 py-3">Notify</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((o) => {
                const vendor = typeof o.vendorId === "object" ? (o.vendorId as Vendor) : null;
                return (
                  <tr key={o._id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-3 font-semibold text-slate-800">{o.orderNumber}</td>
                    <td className="px-5 py-3 text-slate-600">{vendor?.name || "—"}</td>
                    <td className="px-5 py-3">
                      <div className="font-medium text-slate-700">{o.customerName}</div>
                      <div className="text-xs text-slate-400">{o.customerPhone}</div>
                    </td>
                    <td className="px-5 py-3 text-slate-500">{o.items.reduce((s, i) => s + i.qty, 0)} items</td>
                    <td className="px-5 py-3 font-bold text-slate-900">{rupees(o.total)}</td>
                    <td className="px-5 py-3">
                      <div className="text-xs text-slate-500">{o.paymentMethod}</div>
                      <Badge color={o.paymentStatus === "paid" ? "green" : "yellow"}>{o.paymentStatus}</Badge>
                    </td>
                    <td className="px-5 py-3"><Badge color={statusColor[o.status]}>{o.status}</Badge></td>
                    <td className="px-5 py-3 text-xs text-slate-400">{timeAgo(o.createdAt)}</td>
                    <td className="px-5 py-3">
                      <WhatsAppButton o={o} vendorName={vendor?.name} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/** Opens WhatsApp with a pre-filled confirmation or cancellation message.
 *  The admin just presses "Send" — no API, no automatic messaging. */
function WhatsAppButton({ o, vendorName }: { o: Order; vendorName?: string }) {
  const cancelled = o.status === "cancelled";
  const href = cancelled ? waCancelUrl(o, vendorName) : waConfirmUrl(o, vendorName);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={cancelled ? "Send cancellation message on WhatsApp" : "Send order confirmation on WhatsApp"}
      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
    >
      <MessageCircle className="h-3.5 w-3.5" />
      {cancelled ? "Cancellation" : "Confirm"}
    </a>
  );
}
