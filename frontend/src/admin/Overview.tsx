import { useQuery } from "@tanstack/react-query";
import { Store, CheckCircle2, Clock, ShoppingBag, IndianRupee, TrendingUp, CalendarDays } from "lucide-react";
import { api } from "@/lib/api";
import { Spinner } from "@/components/ui";
import { rupees } from "@/lib/utils";

interface Overview {
  totalVendors: number;
  activeVendors: number;
  inactiveVendors: number;
  pendingVendors: number;
  totalOrders: number;
  todayOrders: number;
  todayRevenue: number;
  monthlyRevenue: number;
  platformRevenue: number;
}

export default function Overview() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => api<Overview>("/api/admin/overview", { auth: true }),
  });

  if (isLoading || !data) return <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>;

  const cards = [
    { label: "Total Vendors", value: data.totalVendors, icon: Store, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Active Vendors", value: data.activeVendors, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
    { label: "Pending Approval", value: data.pendingVendors, icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Total Orders", value: data.totalOrders, icon: ShoppingBag, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Today's Orders", value: data.todayOrders, icon: CalendarDays, color: "text-cyan-600", bg: "bg-cyan-50" },
    { label: "Today's Revenue", value: rupees(data.todayRevenue), icon: IndianRupee, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <div className="space-y-8">
      <PageHeader title="Platform Overview" subtitle="A snapshot of vendors, orders and revenue across PreSnag." />

      {/* Revenue highlight cards */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 to-orange-600 p-6 text-white shadow-lg">
          <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
          <div className="flex items-center gap-2 text-sm font-medium text-brand-50">
            <IndianRupee className="h-4 w-4" /> Monthly Revenue
          </div>
          <div className="mt-2 text-4xl font-extrabold">{rupees(data.monthlyRevenue)}</div>
          <div className="mt-1 text-xs text-brand-50/80">Gross order value this month</div>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <TrendingUp className="h-4 w-4 text-brand-500" /> Platform Revenue
          </div>
          <div className="mt-2 text-4xl font-extrabold text-slate-900">{rupees(data.platformRevenue)}</div>
          <div className="mt-1 text-xs text-slate-400">10% commission this month</div>
        </div>
      </div>

      {/* Stat grid */}
      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">Key metrics</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {cards.map((c) => (
            <div
              key={c.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl ${c.bg} ${c.color}`}>
                <c.icon className="h-5 w-5" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900">{c.value}</div>
              <div className="mt-0.5 text-xs font-medium text-slate-500">{c.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </div>
  );
}
