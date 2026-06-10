import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Store, CheckCircle2, Clock, ShoppingBag, IndianRupee, TrendingUp, CalendarDays, Wrench, Wallet, Loader2, Banknote } from "lucide-react";
import { api } from "@/lib/api";
import { Spinner, Button } from "@/components/ui";
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

interface SettlementRow { vendorId: string; vendorName: string; amount: number; orders: number; }

function SettlementsPanel() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-settlements"],
    queryFn: () => api<{ rows: SettlementRow[]; totalPending: number }>("/api/admin/settlements", { auth: true }),
  });

  const run = useMutation({
    mutationFn: () => api<{ results: any[] }>("/api/admin/settlements/run", { method: "POST", auth: true }),
    onSuccess: (res) => {
      const settled = res.results.filter((r) => r.status === "settled");
      const failed = res.results.filter((r) => r.status === "failed");
      toast.success(`Settled ${settled.length} vendor(s)${failed.length ? `, ${failed.length} failed` : ""}`);
      qc.invalidateQueries({ queryKey: ["admin-settlements"] });
    },
    onError: (e: any) => toast.error(e.message || "Settlement run failed"),
  });

  const rows = data?.rows || [];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Managed settlements</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Pending payouts to PreSnag-Managed vendors. Auto-settles within 24 hours.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Total pending</div>
            <div className="text-xl font-extrabold text-slate-900">{rupees(data?.totalPending || 0)}</div>
          </div>
          <Button
            size="sm"
            disabled={run.isPending || rows.length === 0}
            onClick={() => run.mutate()}
            title={rows.length === 0 ? "Nothing pending" : "Run settlement now"}
          >
            {run.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Banknote className="h-4 w-4" />}
            Run settlement
          </Button>
        </div>
      </div>

      {rows.length > 0 && (
        <div className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-100">
          {rows.map((r) => (
            <div key={r.vendorId} className="flex items-center justify-between px-4 py-2.5 text-sm">
              <span className="font-medium text-slate-700">{r.vendorName}</span>
              <span className="flex items-center gap-3">
                <span className="text-xs text-slate-400">{r.orders} order{r.orders === 1 ? "" : "s"}</span>
                <span className="font-bold text-slate-900">{rupees(r.amount)}</span>
              </span>
            </div>
          ))}
        </div>
      )}
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
