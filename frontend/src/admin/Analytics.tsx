import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar,
} from "recharts";
import { IndianRupee, ShoppingBag, Repeat, CreditCard } from "lucide-react";
import { api } from "@/lib/api";
import { Spinner } from "@/components/ui";
import { rupees } from "@/lib/utils";
import { PageHeader } from "./Overview";

interface Analytics {
  daily: { date: string; revenue: number; orders: number }[];
  topVendors: { name: string; revenue: number }[];
  mrr: number;
  gatewayFees: number;
  totalRevenue: number;
  totalOrders: number;
}

export default function Analytics() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => api<Analytics>("/api/admin/analytics", { auth: true }),
  });

  if (isLoading || !data) return <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>;

  const chartData = data.daily.map((d) => ({ ...d, label: d.date.slice(5) }));

  const stats = [
    { label: "Revenue (30d)", value: rupees(data.totalRevenue), icon: IndianRupee, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Orders (30d)", value: data.totalOrders, icon: ShoppingBag, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "MRR", value: rupees(data.mrr), icon: Repeat, color: "text-brand-600", bg: "bg-brand-50" },
    { label: "Gateway Fees", value: rupees(data.gatewayFees), icon: CreditCard, color: "text-rose-600", bg: "bg-rose-50" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Revenue Analytics" subtitle="Platform performance over the last 30 days." />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl ${s.bg} ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{s.value}</div>
            <div className="mt-0.5 text-xs font-medium text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-slate-900">Platform Revenue & Orders</h3>
        {chartData.length === 0 ? (
          <p className="py-10 text-center text-slate-400">No data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number, n: string) => (n === "revenue" ? rupees(v) : v)} />
              <Area type="monotone" dataKey="revenue" stroke="#f97316" fill="url(#rev)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-slate-900">Top Vendors by Revenue</h3>
        {data.topVendors.length === 0 ? (
          <p className="py-10 text-center text-slate-400">No data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.topVendors} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => rupees(v)} />
              <Bar dataKey="revenue" fill="#f97316" radius={[0, 6, 6, 0]} barSize={26} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
