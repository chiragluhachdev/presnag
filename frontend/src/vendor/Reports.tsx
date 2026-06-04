import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar,
} from "recharts";
import { api } from "@/lib/api";
import { Card, Spinner } from "@/components/ui";
import { rupees } from "@/lib/utils";
import { VendorHeader } from "./Dashboard";

interface ReportData {
  daily: { date: string; revenue: number; orders: number }[];
  bestSellers: { name: string; qty: number }[];
  totalRevenue: number;
  totalOrders: number;
}

export default function Reports() {
  const { data, isLoading } = useQuery({
    queryKey: ["vendor-reports"],
    queryFn: () => api<ReportData>("/api/vendor/reports", { auth: true }),
  });

  if (isLoading || !data) return <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>;

  const chartData = data.daily.map((d) => ({ ...d, label: d.date.slice(5) }));

  return (
    <div className="space-y-5">
      <VendorHeader title="Reports" subtitle="Your sales performance over the last 30 days." />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <div className="text-sm text-slate-500">Total Revenue (30d)</div>
          <div className="text-3xl font-bold text-green-600">{rupees(data.totalRevenue)}</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-slate-500">Total Orders (30d)</div>
          <div className="text-3xl font-bold">{data.totalOrders}</div>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="mb-4 font-semibold">Daily Revenue</h3>
        {chartData.length === 0 ? (
          <p className="py-10 text-center text-slate-400">No data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
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
              <Tooltip formatter={(v: number) => rupees(v)} />
              <Area type="monotone" dataKey="revenue" stroke="#f97316" fill="url(#rev)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card className="p-5">
        <h3 className="mb-4 font-semibold">Best Sellers</h3>
        {data.bestSellers.length === 0 ? (
          <p className="py-10 text-center text-slate-400">No data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.bestSellers} layout="vertical" margin={{ left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="qty" fill="#f97316" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
}
