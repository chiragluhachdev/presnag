import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Volume2, VolumeX, Phone, StickyNote } from "lucide-react";
import { api } from "@/lib/api";
import { Order, OrderStatus } from "@/lib/types";
import { useSound } from "@/store/soundStore";
import { Button, Badge, Spinner } from "@/components/ui";
import { toast } from "@/components/ui/toast";
import { rupees, timeAgo, cn } from "@/lib/utils";
import { VendorHeader } from "./Dashboard";
import { playClickSound } from "@/lib/sound";

const TABS: { key: "all" | "ready" | "completed"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "ready", label: "Ready" },
  { key: "completed", label: "Completed" },
];

// Next action per status.
const NEXT: Partial<Record<OrderStatus, { to: OrderStatus; label: string }>> = {
  received: { to: "accepted", label: "Accept" },
  accepted: { to: "preparing", label: "Start Preparing" },
  preparing: { to: "ready", label: "Mark Ready" },
  ready: { to: "collected", label: "Mark Delivered" },
};

const statusColor: Record<OrderStatus, any> = {
  received: "orange",
  accepted: "blue",
  preparing: "purple",
  ready: "green",
  collected: "slate",
  cancelled: "red",
};

export default function Orders() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"all" | "ready" | "completed">("all");

  // Fetch all orders and filter them on the client side
  const { data: orders, isLoading } = useQuery({
    queryKey: ["vendor-orders"],
    queryFn: () => api<Order[]>(`/api/vendor/orders?status=all`, { auth: true }),
  });

  async function updateStatus(id: string, status: OrderStatus) {
    try {
      if (useSound.getState().enabled) playClickSound();
      await api(`/api/vendor/orders/${id}/status`, { method: "PATCH", body: { status }, auth: true });
      qc.invalidateQueries({ queryKey: ["vendor-orders"] });
      qc.invalidateQueries({ queryKey: ["vendor-stats"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  const filteredOrders = orders?.filter((o) => {
    if (tab === "all") {
      return o.status === "received" || o.status === "accepted" || o.status === "preparing";
    }
    if (tab === "ready") {
      return o.status === "ready";
    }
    if (tab === "completed") {
      return o.status === "collected";
    }
    return false;
  });

  const vm: OrdersView = { tab, setTab, orders: filteredOrders, isLoading, updateStatus };

  return (
    <>
      {/* Mobile / tablet (no sidebar) */}
      <div className="lg:hidden">
        <OrdersMobile {...vm} />
      </div>
      {/* Desktop (with sidebar) */}
      <div className="hidden lg:block">
        <OrdersDesktop {...vm} />
      </div>
    </>
  );
}

interface OrdersView {
  tab: "all" | "ready" | "completed";
  setTab: (t: "all" | "ready" | "completed") => void;
  orders: Order[] | undefined;
  isLoading: boolean;
  updateStatus: (id: string, status: OrderStatus) => void;
}

function Tabs({ tab, setTab }: Pick<OrdersView, "tab" | "setTab">) {
  return (
    <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {TABS.map((t) => (
        <button
          key={t.key}
          onClick={() => setTab(t.key)}
          className={cn(
            "shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-semibold transition",
            tab === t.key
              ? "border-brand-500 bg-brand-500 text-white shadow-sm"
              : "border-slate-200 bg-white text-slate-600 hover:border-brand-300"
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function SoundToggle() {
  const { enabled, toggle } = useSound();
  return (
    <Button variant="outline" size="sm" onClick={toggle}>
      {enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
      <span className="hidden sm:inline">{enabled ? "Sound On" : "Sound Off"}</span>
    </Button>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-400">
      No orders here.
    </div>
  );
}

/* ---------------- MOBILE — app-style, single column, sticky tabs ---------------- */
function OrdersMobile({ tab, setTab, orders, isLoading, updateStatus }: OrdersView) {
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <VendorHeader title="Orders" subtitle="Tap a card to update its status." />
        <SoundToggle />
      </div>

      {/* Sticky tabs under the mobile top bar */}
      <div className="sticky top-14 z-20 -mx-4 border-b border-slate-200 bg-slate-100/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6">
        <Tabs tab={tab} setTab={setTab} />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>
      ) : !orders || orders.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <OrderCard key={o._id} o={o} onUpdate={updateStatus} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- DESKTOP — roomier multi-column grid ---------------- */
function OrdersDesktop({ tab, setTab, orders, isLoading, updateStatus }: OrdersView) {
  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3">
        <VendorHeader title="Orders" subtitle="Live incoming orders — update status as you go." />
        <SoundToggle />
      </div>

      <Tabs tab={tab} setTab={setTab} />

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>
      ) : !orders || orders.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
          {orders.map((o) => (
            <OrderCard key={o._id} o={o} onUpdate={updateStatus} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ o, onUpdate }: { o: Order; onUpdate: (id: string, s: OrderStatus) => void }) {
  const next = NEXT[o.status];
  const isNew = o.status === "received";
  const canCancel = o.status !== "collected" && o.status !== "cancelled";

  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border bg-white p-4 shadow-sm transition",
        isNew ? "border-brand-300 ring-2 ring-brand-200" : "border-slate-200"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">{o.orderNumber}</span>
            {isNew && (
              <span className="rounded-full bg-brand-500 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                New
              </span>
            )}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide",
                o.orderType === "TAKE_AWAY" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
              )}
            >
              {o.orderType === "TAKE_AWAY" ? "Take Away" : "Dine In"}
            </span>
          </div>
          <div className="text-xs text-slate-400">{timeAgo(o.createdAt)}</div>
        </div>
        <Badge color={statusColor[o.status]}>
          {o.status === "collected" ? "delivered" : o.status}
        </Badge>
      </div>

      {/* Customer + call */}
      <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-slate-800">{o.customerName}</div>
          <div className="text-xs text-slate-400">{o.customerPhone}</div>
        </div>
        <a
          href={`tel:${o.customerPhone}`}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-brand-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-brand-50"
        >
          <Phone className="h-3.5 w-3.5" /> Call
        </a>
      </div>

      {/* Items */}
      <div className="mt-3 space-y-1.5">
        {o.items.map((it, i) => (
          <div key={i}>
            <div className="flex justify-between gap-2 text-sm">
              <span className="text-slate-700">
                <span className="font-semibold text-brand-600">{it.qty}×</span> {it.name}
              </span>
              <span className="shrink-0 text-slate-500">{rupees(it.price * it.qty)}</span>
            </div>
            {it.instructions && (
              <div className="mt-0.5 flex items-center gap-1 text-xs text-amber-600">
                <StickyNote className="h-3 w-3 shrink-0" /> {it.instructions}
              </div>
            )}
          </div>
        ))}
      </div>

      {o.note && (
        <p className="mt-2 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs text-amber-700">Note: {o.note}</p>
      )}

      {/* Total */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-xs font-medium text-slate-400">{o.paymentMethod} · {o.paymentStatus}</span>
        <span className="text-lg font-extrabold text-slate-900">{rupees(o.total)}</span>
      </div>

      {/* Actions */}
      {(next || canCancel) && (
        <div className="mt-3 flex gap-2">
          {next && (
            <Button className="h-10 flex-1" onClick={() => onUpdate(o._id, next.to)}>
              {next.label}
            </Button>
          )}
          {canCancel && (
            <Button variant="outline" className="h-10" onClick={() => onUpdate(o._id, "cancelled")}>
              Cancel
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
