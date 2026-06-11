import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Store, CheckCircle2, Clock, ShoppingBag, IndianRupee, TrendingUp, CalendarDays, Wrench, Wallet, Loader2, Banknote } from "lucide-react";
import { api } from "@/lib/api";
import { Spinner, Button, Input, Label } from "@/components/ui";
import { Modal } from "@/components/ui/modal";
import { toast } from "@/components/ui/toast";
import { rupees, cn } from "@/lib/utils";

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

      <MaintenanceToggle />

      <SettlementsPanel />

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

interface SettlementRow {
  vendorId: string; vendorName: string; orders: number; gross: number; fee: number; net: number;
  bank?: { accountHolderName?: string; accountNumberLast4?: string; ifsc?: string } | null;
}

function SettlementsPanel() {
  const qc = useQueryClient();
  const [payFor, setPayFor] = useState<SettlementRow | null>(null);
  const { data } = useQuery({
    queryKey: ["admin-settlements"],
    queryFn: () => api<{ rows: SettlementRow[]; totalPendingGross: number; totalPendingNet: number; feeRatePct: number }>("/api/admin/settlements", { auth: true }),
  });

  const rows = data?.rows || [];
  const fee = data?.feeRatePct ?? 5;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Vendor Settlements</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Net amounts owed to vendors after the {fee}% platform fee. Pay each one, then mark it paid.
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Total to pay (net)</div>
          <div className="text-xl font-extrabold text-slate-900">{rupees(data?.totalPendingNet || 0)}</div>
          <div className="text-[11px] text-slate-400">gross {rupees(data?.totalPendingGross || 0)}</div>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400">
          No pending settlements.
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-slate-100 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-3 py-2">Vendor</th>
                <th className="px-3 py-2 text-right">Orders</th>
                <th className="px-3 py-2 text-right">Gross</th>
                <th className="px-3 py-2 text-right">Fee ({fee}%)</th>
                <th className="px-3 py-2 text-right">Net to Pay</th>
                <th className="px-3 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.map((r) => (
                <tr key={r.vendorId} className="hover:bg-slate-50/50">
                  <td className="px-3 py-2.5">
                    <div className="font-semibold text-slate-800">{r.vendorName}</div>
                    {r.bank?.accountNumberLast4 && (
                      <div className="text-[11px] text-slate-400">{r.bank.accountHolderName} · ••••{r.bank.accountNumberLast4} · {r.bank.ifsc}</div>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right text-slate-600">{r.orders}</td>
                  <td className="px-3 py-2.5 text-right text-slate-600">{rupees(r.gross)}</td>
                  <td className="px-3 py-2.5 text-right text-rose-600">− {rupees(r.fee)}</td>
                  <td className="px-3 py-2.5 text-right font-bold text-emerald-700">{rupees(r.net)}</td>
                  <td className="px-3 py-2.5 text-right">
                    <Button size="sm" onClick={() => setPayFor(r)}><Banknote className="h-4 w-4" /> Mark Paid</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {payFor && (
        <MarkPaidModal
          row={payFor}
          onClose={() => setPayFor(null)}
          onDone={() => { setPayFor(null); qc.invalidateQueries({ queryKey: ["admin-settlements"] }); qc.invalidateQueries({ queryKey: ["admin-overview"] }); }}
        />
      )}
    </div>
  );
}

function MarkPaidModal({ row, onClose, onDone }: { row: SettlementRow; onClose: () => void; onDone: () => void }) {
  const [reference, setReference] = useState("");
  const pay = useMutation({
    mutationFn: () => api<{ ordersSettled: number; net: number }>(`/api/admin/settlements/${row.vendorId}/mark-paid`, { method: "POST", auth: true, body: { reference } }),
    onSuccess: (res) => { toast.success(`Settled ${rupees(res.net)} to ${row.vendorName} (${res.ordersSettled} orders)`); onDone(); },
    onError: (e: any) => toast.error(e.message || "Failed to mark paid"),
  });
  return (
    <Modal
      open
      onClose={onClose}
      title={`Settle ${row.vendorName}`}
      footer={<>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={() => pay.mutate()} disabled={pay.isPending}>
          {pay.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Confirm Paid
        </Button>
      </>}
    >
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          <Mini label="Gross" value={rupees(row.gross)} />
          <Mini label="Fee" value={`− ${rupees(row.fee)}`} tone="rose" />
          <Mini label="Net to pay" value={rupees(row.net)} tone="emerald" />
        </div>
        <p className="text-xs text-slate-500">
          Confirm you've transferred <b>{rupees(row.net)}</b> to {row.vendorName} for {row.orders} order{row.orders === 1 ? "" : "s"}. This marks those orders as settled.
        </p>
        <div>
          <Label>Transaction Ref / UTR (optional)</Label>
          <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. UTR123456789" />
        </div>
      </div>
    </Modal>
  );
}

function Mini({ label, value, tone }: { label: string; value: string; tone?: "rose" | "emerald" }) {
  return (
    <div className="rounded-lg bg-slate-50 px-2 py-2">
      <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}</div>
      <div className={cn("text-sm font-bold", tone === "rose" ? "text-rose-600" : tone === "emerald" ? "text-emerald-700" : "text-slate-800")}>{value}</div>
    </div>
  );
}

function MaintenanceToggle() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => api<{ maintenanceMode: boolean }>("/api/admin/settings", { auth: true }),
  });
  const on = !!data?.maintenanceMode;

  const mutation = useMutation({
    mutationFn: (maintenanceMode: boolean) =>
      api<{ maintenanceMode: boolean }>("/api/admin/settings", {
        method: "PUT",
        auth: true,
        body: { maintenanceMode },
      }),
    onSuccess: (res) => {
      qc.setQueryData(["admin-settings"], res);
      qc.invalidateQueries({ queryKey: ["public-settings"] });
      toast.success(res.maintenanceMode ? "Maintenance mode is ON — site shows the under-development page." : "Maintenance mode is OFF — site is live.");
    },
    onError: (e: any) => toast.error(e.message || "Failed to update"),
  });

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl border p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between",
        on ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-white"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            on ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500"
          )}
        >
          <Wrench className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">Maintenance Mode</h3>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                on ? "bg-amber-500 text-white" : "bg-slate-200 text-slate-600"
              )}
            >
              {on ? "On" : "Off"}
            </span>
          </div>
          <p className="mt-0.5 max-w-xl text-xs text-slate-500">
            When ON, visitors see an "under development" page with your contact details. The admin
            dashboard stays accessible so you can turn it back off.
          </p>
        </div>
      </div>

      {/* Toggle switch */}
      <button
        type="button"
        disabled={mutation.isPending || !data}
        onClick={() => mutation.mutate(!on)}
        className={cn(
          "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition disabled:opacity-50",
          on ? "bg-amber-500" : "bg-slate-300"
        )}
        aria-pressed={on}
        title="Toggle maintenance mode"
      >
        <span
          className={cn(
            "inline-block h-5 w-5 transform rounded-full bg-white shadow transition",
            on ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
    </div>
  );
}
