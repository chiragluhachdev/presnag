import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { IndianRupee, Percent, Wallet, TrendingUp, Receipt } from "lucide-react";
import { api } from "@/lib/api";
import { Spinner } from "@/components/ui";
import { cn } from "@/lib/utils";
import { PageHeader } from "./Overview";

// Money with 2 decimals (finance precision).
const m = (n: number) =>
  `₹${(n ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

interface FinanceRow {
  orderNumber: string;
  vendorName: string;
  createdAt: string;
  customerPaid: number;
  platformFee: number;
  vendorGets: number;
  status: "Pending" | "Paid";
}
interface FinanceData {
  date: string;
  feeRatePct: number;
  rows: FinanceRow[];
  totals: {
    collection: number;
    platformCommission: number;
    vendorPayoutDue: number;
    netProfit: number;
    orders: number;
  };
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function Finance() {
  const [date, setDate] = useState(todayStr());

  const { data, isLoading } = useQuery({
    queryKey: ["admin-finance", date],
    queryFn: () => api<FinanceData>(`/api/admin/finance?date=${date}`, { auth: true }),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <PageHeader title="Finance" subtitle="Per-order money flow — commission and vendor payouts." />
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500">Date</label>
          <input
            type="date"
            value={date}
            max={todayStr()}
            onChange={(e) => setDate(e.target.value)}
            className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>

      {isLoading || !data ? (
        <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>
      ) : (
        <>
          {/* Totals */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <TotalCard icon={IndianRupee} label="Collection" value={m(data.totals.collection)} sub={`${data.totals.orders} paid order${data.totals.orders === 1 ? "" : "s"}`} />
            <TotalCard icon={Percent} label={`PreSnag Commission (${data.feeRatePct}%)`} value={m(data.totals.platformCommission)} sub="Your earnings" tone="indigo" />
            <TotalCard icon={Wallet} label="Vendor Payout Due" value={m(data.totals.vendorPayoutDue)} sub="Total owed to vendors" tone="amber" />
            <TotalCard icon={TrendingUp} label="Net Profit" value={m(data.totals.netProfit)} sub="Platform commission earned" highlight />
          </div>

          {/* Per-order table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/60 px-5 py-3">
              <Receipt className="h-4 w-4 text-brand-500" />
              <h3 className="text-sm font-bold text-slate-900">Orders — {new Date(data.date).toLocaleDateString()}</h3>
            </div>
            {data.rows.length === 0 ? (
              <div className="py-14 text-center text-sm text-slate-400">No paid orders on this date.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead className="border-b border-slate-100 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="px-5 py-2.5">Order</th>
                      <th className="px-3 py-2.5">Vendor</th>
                      <th className="px-3 py-2.5 text-right">Customer Paid</th>
                      <th className="px-3 py-2.5 text-right">Platform Fee ({data.feeRatePct}%)</th>
                      <th className="px-3 py-2.5 text-right">Vendor Gets</th>
                      <th className="px-5 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.rows.map((r) => (
                      <tr key={r.orderNumber} className="hover:bg-slate-50/50">
                        <td className="px-5 py-2.5">
                          <div className="font-mono text-xs font-bold text-slate-800">{r.orderNumber}</div>
                          <div className="text-[11px] text-slate-400">{new Date(r.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                        </td>
                        <td className="px-3 py-2.5 text-slate-600">{r.vendorName}</td>
                        <td className="px-3 py-2.5 text-right font-semibold text-slate-800">{m(r.customerPaid)}</td>
                        <td className="px-3 py-2.5 text-right text-indigo-600">− {m(r.platformFee)}</td>
                        <td className="px-3 py-2.5 text-right font-bold text-emerald-700">{m(r.vendorGets)}</td>
                        <td className="px-5 py-2.5">
                          <span className={cn(
                            "inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                            r.status === "Paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                          )}>{r.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2 border-slate-100 bg-slate-50/60 text-sm font-bold">
                    <tr>
                      <td className="px-5 py-3 text-slate-500" colSpan={2}>Totals</td>
                      <td className="px-3 py-3 text-right text-slate-900">{m(data.totals.collection)}</td>
                      <td className="px-3 py-3 text-right text-indigo-600">− {m(data.totals.platformCommission)}</td>
                      <td className="px-3 py-3 text-right text-emerald-700">{m(data.totals.vendorPayoutDue)}</td>
                      <td className="px-5 py-3"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          <p className="text-center text-[11px] text-slate-400">
            PreSnag's {data.feeRatePct}% commission is the only deduction per order; the vendor receives the
            remaining {100 - data.feeRatePct}%. Settle pending vendor payouts from the Overview → Settlements panel.
          </p>
        </>
      )}
    </div>
  );
}

function TotalCard({
  icon: Icon, label, value, sub, highlight, tone,
}: { icon: any; label: string; value: string; sub: string; highlight?: boolean; tone?: "rose" | "indigo" | "amber" }) {
  const toneCls = { rose: "text-rose-600", indigo: "text-indigo-600", amber: "text-amber-600" }[tone || "amber"];
  return (
    <div className={cn(
      "rounded-2xl border p-5 shadow-sm",
      highlight ? "border-transparent bg-gradient-to-br from-emerald-500 to-emerald-600 text-white" : "border-slate-200 bg-white"
    )}>
      <div className={cn("flex items-center gap-2 text-xs font-medium", highlight ? "text-emerald-50" : "text-slate-500")}>
        <Icon className={cn("h-4 w-4", highlight ? "" : tone ? toneCls : "")} /> {label}
      </div>
      <div className={cn("mt-2 text-2xl font-extrabold", highlight ? "text-white" : "text-slate-900")}>{value}</div>
      <div className={cn("mt-0.5 text-[11px]", highlight ? "text-emerald-50/80" : "text-slate-400")}>{sub}</div>
    </div>
  );
}
