import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Store, CheckCircle2, Clock, ShoppingBag, IndianRupee, TrendingUp, CalendarDays, Wrench, Wallet, Loader2, Banknote, CreditCard, Megaphone, Ban } from "lucide-react";
import { api } from "@/lib/api";
import { Spinner, Button, Input, Label, Textarea } from "@/components/ui";
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

      <PaymentGatewayCard />

      <PaymentsToggle />

      <DemoBannerCard />

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

const BANNER_PRESETS = [
  "Demo mode — no real orders or payments are processed. Feel free to explore the full flow.",
  "Heads up — payments are live. Please explore the checkout flow only and don't place a real order.",
  "PreSnag is in early preview. Browse around — this is a demonstration of the platform.",
];

interface DemoBannerCfg { enabled: boolean; message: string; showOnHome: boolean; showOnCheckout: boolean }

function DemoBannerCard() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => api<{ demoBanner: DemoBannerCfg }>("/api/admin/settings", { auth: true }),
  });

  const [form, setForm] = useState<DemoBannerCfg | null>(null);
  useEffect(() => {
    if (data?.demoBanner && !form) setForm({ ...data.demoBanner });
  }, [data, form]);

  const save = useMutation({
    mutationFn: (cfg: DemoBannerCfg) => api("/api/admin/settings", { method: "PUT", auth: true, body: { demoBanner: cfg } }),
    onSuccess: (res: any) => {
      qc.setQueryData(["admin-settings"], res);
      qc.invalidateQueries({ queryKey: ["public-settings"] });
      toast.success("Demo banner updated");
    },
    onError: (e: any) => toast.error(e.message || "Failed to save"),
  });

  const f = form;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
          <Megaphone className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Demo / Notice Banner</h3>
              <p className="mt-0.5 text-xs text-slate-500">Show a notice on the home and/or checkout screens.</p>
            </div>
            {/* Enable toggle */}
            <button
              type="button"
              disabled={!f}
              onClick={() => f && setForm({ ...f, enabled: !f.enabled })}
              className={cn("relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition disabled:opacity-50", f?.enabled ? "bg-amber-500" : "bg-slate-300")}
              aria-pressed={f?.enabled}
            >
              <span className={cn("inline-block h-5 w-5 transform rounded-full bg-white shadow transition", f?.enabled ? "translate-x-6" : "translate-x-1")} />
            </button>
          </div>

          {!f ? (
            <div className="mt-3 text-xs text-slate-400">Loading…</div>
          ) : (
            <div className={cn("mt-3 space-y-3", !f.enabled && "opacity-60")}>
              {/* Preset messages */}
              <div>
                <Label className="text-xs">Message preset</Label>
                <div className="mt-1 grid gap-2">
                  {BANNER_PRESETS.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setForm({ ...f, message: p })}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-left text-xs transition",
                        f.message === p ? "border-amber-400 bg-amber-50 text-amber-900 ring-1 ring-amber-300" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Editable message */}
              <div>
                <Label className="text-xs">Message (editable)</Label>
                <Textarea rows={2} value={f.message} onChange={(e) => setForm({ ...f, message: e.target.value })} className="text-sm" />
              </div>

              {/* Placement */}
              <div className="flex flex-wrap gap-4">
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={f.showOnHome} onChange={(e) => setForm({ ...f, showOnHome: e.target.checked })} className="h-4 w-4 rounded border-slate-300 accent-amber-500" />
                  Show on Home
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={f.showOnCheckout} onChange={(e) => setForm({ ...f, showOnCheckout: e.target.checked })} className="h-4 w-4 rounded border-slate-300 accent-amber-500" />
                  Show on Checkout
                </label>
              </div>

              {/* Live preview */}
              {f.enabled && f.message.trim() && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
                  <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <p className="text-xs leading-snug text-amber-800">{f.message}</p>
                </div>
              )}

              <Button size="sm" disabled={save.isPending} onClick={() => save.mutate(f)}>
                {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Save banner
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PaymentGatewayCard() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => api<{ maintenanceMode: boolean; paymentProvider: "CASHFREE" | "RAZORPAY" }>("/api/admin/settings", { auth: true }),
  });
  const provider = data?.paymentProvider || "CASHFREE";

  const mutation = useMutation({
    mutationFn: (paymentProvider: "CASHFREE" | "RAZORPAY") =>
      api<{ paymentProvider: string }>("/api/admin/settings", { method: "PUT", auth: true, body: { paymentProvider } }),
    onSuccess: (res) => {
      qc.setQueryData(["admin-settings"], res);
      toast.success(`Payment gateway switched to ${res.paymentProvider}`);
    },
    onError: (e: any) => toast.error(e.message || "Failed to switch gateway"),
  });

  const options = [
    { key: "CASHFREE", label: "Cashfree", desc: "Cashfree Payments" },
    { key: "RAZORPAY", label: "Razorpay", desc: "Razorpay Checkout" },
  ] as const;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
          <CreditCard className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-slate-900">Payment Gateway</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Choose which gateway handles customer checkout. Applies to all new orders instantly.
          </p>
          <div className="mt-3 grid max-w-md grid-cols-2 gap-2">
            {options.map((o) => {
              const active = provider === o.key;
              return (
                <button
                  key={o.key}
                  disabled={mutation.isPending || active}
                  onClick={() => mutation.mutate(o.key)}
                  className={cn(
                    "rounded-xl border p-3 text-left transition",
                    active ? "border-indigo-500 bg-indigo-50/60 ring-1 ring-indigo-500" : "border-slate-200 bg-white hover:border-slate-300"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn("text-sm font-bold", active ? "text-indigo-700" : "text-slate-700")}>{o.label}</span>
                    {active && <CheckCircle2 className="h-4 w-4 text-indigo-600" />}
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-500">{o.desc}</div>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Active: <span className="font-semibold text-slate-600">{provider}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function PaymentsToggle() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => api<{ paymentsDisabled: boolean }>("/api/admin/settings", { auth: true }),
  });
  const on = !!data?.paymentsDisabled;

  const mutation = useMutation({
    mutationFn: (paymentsDisabled: boolean) =>
      api<{ paymentsDisabled: boolean }>("/api/admin/settings", {
        method: "PUT",
        auth: true,
        body: { paymentsDisabled },
      }),
    onSuccess: (res) => {
      qc.setQueryData(["admin-settings"], res);
      qc.invalidateQueries({ queryKey: ["public-settings"] });
      toast.success(res.paymentsDisabled ? "Payments are now DISABLED — customers can't pay." : "Payments are now ENABLED — checkout is live.");
    },
    onError: (e: any) => toast.error(e.message || "Failed to update"),
  });

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl border p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between",
        on ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-white"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            on ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-500"
          )}
        >
          <Ban className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">Disable Payments</h3>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                on ? "bg-rose-500 text-white" : "bg-slate-200 text-slate-600"
              )}
            >
              {on ? "On" : "Off"}
            </span>
          </div>
          <p className="mt-0.5 max-w-xl text-xs text-slate-500">
            When ON, customer checkout is paused — the pay button is disabled and no payments are
            processed. The rest of the storefront stays browsable.
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
          on ? "bg-rose-500" : "bg-slate-300"
        )}
        aria-pressed={on}
        title="Toggle payments"
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
