import { useQuery } from "@tanstack/react-query";
import { IndianRupee, ShoppingBag, Clock, CheckCircle2, TrendingUp, PartyPopper, ShieldCheck, Store } from "lucide-react";
import { api } from "@/lib/api";
import { Vendor } from "@/lib/types";
import { Spinner } from "@/components/ui";
import { rupees, cn } from "@/lib/utils";

interface Stats {
  todayOrdersCount: number;
  todayRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  totalOrders: number;
  totalRevenue: number;
  topItems: { name: string; qty: number; revenue: number }[];
}

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["vendor-stats"],
    queryFn: () => api<Stats>("/api/vendor/stats", { auth: true }),
  });
  const { data: me } = useQuery({
    queryKey: ["vendor-me"],
    queryFn: () => api<Vendor>("/api/vendor/me", { auth: true }),
  });

  if (isLoading || !data)
    return <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>;

  const cards = [
    { label: "Today's Orders", value: data.todayOrdersCount, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Pending Orders", value: data.pendingOrders, icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Completed", value: data.completedOrders, icon: CheckCircle2, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Total Orders", value: data.totalOrders, icon: ShoppingBag, color: "text-slate-600", bg: "bg-slate-100" },
  ];

  return (
    <div className="space-y-6">
      <VendorHeader title="Dashboard" subtitle="Your stall at a glance." />

      {me && <ShopStatusBanner vendor={me} />}

      {/* Revenue highlights */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 to-orange-600 p-6 text-white shadow-lg">
          <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
          <div className="flex items-center gap-2 text-sm font-medium text-brand-50">
            <IndianRupee className="h-4 w-4" /> Today's Revenue
          </div>
          <div className="mt-2 text-3xl font-extrabold sm:text-4xl">{rupees(data.todayRevenue)}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <TrendingUp className="h-4 w-4 text-brand-500" /> Total Revenue
          </div>
          <div className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">{rupees(data.totalRevenue)}</div>
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${c.bg} ${c.color}`}>
              <c.icon className="h-5 w-5" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{c.value}</div>
            <div className="text-xs font-medium text-slate-500">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Top sellers */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center gap-2 font-bold text-slate-900">
          <TrendingUp className="h-5 w-5 text-brand-500" /> Top Selling Items
        </div>
        {data.topItems.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">No sales yet.</p>
        ) : (
          <div className="space-y-2">
            {data.topItems.map((it, i) => (
              <div key={it.name} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700">{it.name}</span>
                <span className="hidden text-xs text-slate-500 sm:block">{it.qty} sold</span>
                <span className="w-20 text-right text-sm font-bold text-slate-900">{rupees(it.revenue)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ShopStatusBanner({ vendor }: { vendor: Vendor }) {
  const status = vendor.status;
  if (status === "active") {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-900">
            Shop is Live <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Active</span>
          </div>
          <p className="text-xs text-emerald-700">Your shop is verified and visible to customers on PreSnag.</p>
        </div>
        <span className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
          vendor.isOpen ? "bg-white text-emerald-700" : "bg-white text-slate-500"
        )}>
          <Store className="h-3.5 w-3.5" /> {vendor.isOpen ? "Open now" : "Closed"}
        </span>
      </div>
    );
  }
  if (status === "suspended" || status === "inactive") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
        <Clock className="h-5 w-5 text-red-500" />
        <p className="text-sm font-semibold text-red-800">
          Your shop is currently {status}. Please contact PreSnag support.
        </p>
      </div>
    );
  }
  // pending
  return (
    <div className="overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white">
          <PartyPopper className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-slate-900">🎉 Congratulations, you're registered!</h3>
          <p className="mt-1 max-w-xl text-sm text-slate-600">
            Your shop is <span className="font-semibold text-amber-700">under review</span>. We'll verify it and
            list it on PreSnag <span className="font-semibold">within 24 hours</span>. Meanwhile, set up your
            menu so you're ready to take orders the moment you go live.
          </p>
        </div>
      </div>
    </div>
  );
}

export function VendorHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </div>
  );
}
