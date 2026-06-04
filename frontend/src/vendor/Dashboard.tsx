import { useQuery } from "@tanstack/react-query";
import { IndianRupee, ShoppingBag, Clock, CheckCircle2, TrendingUp } from "lucide-react";
import { api } from "@/lib/api";
import { Spinner } from "@/components/ui";
import { rupees } from "@/lib/utils";

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

export function VendorHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </div>
  );
}
