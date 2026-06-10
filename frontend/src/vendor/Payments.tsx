import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Zap, Banknote, ShieldCheck, Loader2, ArrowRight, Building2, Lock,
  Clock, IndianRupee, CheckCircle2, Sparkles,
} from "lucide-react";
import { api, API_URL } from "@/lib/api";
import { Input, Button, Label, Card, Spinner } from "@/components/ui";
import { toast } from "@/components/ui/toast";
import { rupees, cn } from "@/lib/utils";
import { VendorHeader } from "./Dashboard";

interface Settlement {
  settlementMode: "MANAGED" | "DIRECT";
  kycStatus: "not_started" | "in_progress" | "active" | "rejected";
  eligibleForDirectMigration: boolean;
  managedPayout?: { accountHolderName?: string; accountNumberLast4?: string; ifsc?: string; panMasked?: string };
  hasPayoutSetup: boolean;
  todayEarnings: number;
  todayOrders: number;
  pendingSettlement: number;
  pendingOrders: number;
  lastPayoutAt: string | null;
}

export default function Payments() {
  const qc = useQueryClient();
  const [params, setParams] = useSearchParams();

  const { data, isLoading } = useQuery({
    queryKey: ["vendor-settlement"],
    queryFn: () => api<Settlement>("/api/vendor/settlement", { auth: true }),
  });

  // Returning from (demo) Cashfree onboarding → finish migration locally.
  const completeDemoKyc = useMutation({
    mutationFn: () => api("/api/vendor/settlement/complete-demo-kyc", { method: "POST", auth: true }),
    onSuccess: () => {
      toast.success("Direct Settlement is now active 🎉");
      qc.invalidateQueries({ queryKey: ["vendor-settlement"] });
    },
  });
  useEffect(() => {
    if (params.get("demo_kyc") === "1") {
      completeDemoKyc.mutate();
      params.delete("demo_kyc");
      setParams(params, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchDirect = useMutation({
    mutationFn: () => api<{ onboardingUrl: string }>("/api/vendor/settlement/switch-direct", { method: "POST", auth: true }),
    onSuccess: (res) => {
      // Redirect to Cashfree hosted onboarding (a local demo URL when unconfigured).
      window.location.href = res.onboardingUrl.startsWith("http")
        ? res.onboardingUrl
        : `${API_URL}${res.onboardingUrl}`;
    },
    onError: (e: any) => toast.error(e.message || "Could not start migration"),
  });

  if (isLoading || !data) {
    return (
      <div>
        <VendorHeader title="Payments" subtitle="Settlement & earnings" />
        <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>
      </div>
    );
  }

  const direct = data.settlementMode === "DIRECT";

  return (
    <div className="space-y-6">
      <VendorHeader title="Payments" subtitle="How you get paid, and what you've earned." />

      {/* Earnings cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={IndianRupee}
          label="Today's earnings"
          value={rupees(data.todayEarnings)}
          sub={`${data.todayOrders} paid order${data.todayOrders === 1 ? "" : "s"}`}
          highlight
        />
        <StatCard
          icon={Clock}
          label={direct ? "Settled to bank" : "Pending settlement"}
          value={direct ? "Instant" : rupees(data.pendingSettlement)}
          sub={direct ? "Paid directly per order" : `${data.pendingOrders} order${data.pendingOrders === 1 ? "" : "s"} awaiting payout`}
        />
        <StatCard
          icon={CheckCircle2}
          label="Last payout"
          value={data.lastPayoutAt ? new Date(data.lastPayoutAt).toLocaleDateString() : "—"}
          sub={direct ? "Direct settlement active" : "Auto payout within 24 hrs"}
        />
      </div>

      {/* Current mode */}
      <Card className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", direct ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600")}>
              {direct ? <Banknote className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Current settlement mode</h3>
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", direct ? "bg-emerald-500 text-white" : "bg-amber-500 text-white")}>
                  {direct ? "Direct" : "Managed"}
                </span>
              </div>
              <p className="mt-0.5 max-w-lg text-xs text-slate-500">
                {direct
                  ? "Cashfree sends 100% of each order straight to your bank account in real time."
                  : "PreSnag collects payments and settles your earnings to your bank automatically within 24 hours."}
              </p>
            </div>
          </div>
          {direct && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              <ShieldCheck className="h-4 w-4" /> KYC verified
            </span>
          )}
        </div>
      </Card>

      {/* Migration banner (managed only) */}
      {!direct && data.eligibleForDirectMigration && (
        <Card className="overflow-hidden border-brand-200">
          <div className="flex flex-col gap-4 bg-gradient-to-br from-brand-50 to-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Switch to Direct Settlement</h3>
                <p className="mt-0.5 max-w-lg text-xs text-slate-600">
                  Receive payments directly into your bank account, instantly per order. One quick
                  KYC on Cashfree's secure page — that's it.
                </p>
              </div>
            </div>
            <Button onClick={() => switchDirect.mutate()} disabled={switchDirect.isPending} className="shrink-0">
              {switchDirect.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              Switch to Direct
            </Button>
          </div>
        </Card>
      )}

      {data.kycStatus === "in_progress" && !direct && (
        <Card className="flex items-center gap-3 border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <Loader2 className="h-4 w-4 animate-spin" />
          Your Direct Settlement KYC is in progress. We'll switch you over automatically once Cashfree verifies it.
        </Card>
      )}

      {/* Managed payout details / setup */}
      {!direct && (
        <ManagedPayoutCard settlement={data} onSaved={() => qc.invalidateQueries({ queryKey: ["vendor-settlement"] })} />
      )}

      {/* Trust footer */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-emerald-600" /> Bank details secured by Cashfree</span>
        <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> PreSnag takes 0% commission</span>
        <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Transparent daily settlements</span>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, highlight }: { icon: any; label: string; value: string; sub: string; highlight?: boolean }) {
  return (
    <div className={cn(
      "rounded-2xl border p-5 shadow-sm",
      highlight ? "border-transparent bg-gradient-to-br from-brand-500 to-orange-600 text-white" : "border-slate-200 bg-white"
    )}>
      <div className={cn("flex items-center gap-2 text-xs font-medium", highlight ? "text-brand-50" : "text-slate-500")}>
        <Icon className="h-4 w-4" /> {label}
      </div>
      <div className={cn("mt-2 text-2xl font-extrabold", highlight ? "text-white" : "text-slate-900")}>{value}</div>
      <div className={cn("mt-0.5 text-[11px]", highlight ? "text-brand-50/80" : "text-slate-400")}>{sub}</div>
    </div>
  );
}

function ManagedPayoutCard({ settlement, onSaved }: { settlement: Settlement; onSaved: () => void }) {
  const p = settlement.managedPayout;
  const hasDetails = Boolean(p?.accountNumberLast4);
  const [editing, setEditing] = useState(!hasDetails);

  const [accountHolderName, setAccountHolderName] = useState(p?.accountHolderName || "");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState(p?.ifsc || "");
  const [pan, setPan] = useState("");

  const save = useMutation({
    mutationFn: () =>
      api("/api/vendor/settlement/managed", {
        method: "POST", auth: true,
        body: { accountHolderName, accountNumber, ifsc, pan },
      }),
    onSuccess: () => {
      toast.success("Payout details saved");
      setEditing(false);
      onSaved();
    },
    onError: (e: any) => toast.error(e.message || "Could not save"),
  });

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Building2 className="h-4 w-4 text-brand-500" /> Payout bank account
        </div>
        {hasDetails && !editing && (
          <Button size="sm" variant="outline" onClick={() => setEditing(true)}>Update</Button>
        )}
      </div>

      {!editing && hasDetails ? (
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <Row label="Account holder" value={p?.accountHolderName || "—"} />
          <Row label="Account number" value={p?.accountNumberLast4 ? `•••• ${p.accountNumberLast4}` : "—"} />
          <Row label="IFSC" value={p?.ifsc || "—"} />
          <Row label="PAN" value={p?.panMasked || "—"} />
        </div>
      ) : (
        <div className="space-y-3">
          {!hasDetails && (
            <p className="rounded-lg bg-amber-50 p-2.5 text-xs font-medium text-amber-800">
              Add your bank details so PreSnag can settle your earnings. Your shop goes live only after this is set.
            </p>
          )}
          <div>
            <Label>Account Holder Name</Label>
            <Input value={accountHolderName} onChange={(e) => setAccountHolderName(e.target.value)} placeholder="As per bank records" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Account Number</Label>
              <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="Bank account no." />
            </div>
            <div>
              <Label>IFSC Code</Label>
              <Input value={ifsc} onChange={(e) => setIfsc(e.target.value.toUpperCase())} placeholder="e.g. HDFC0001234" />
            </div>
          </div>
          <div>
            <Label>PAN</Label>
            <Input value={pan} onChange={(e) => setPan(e.target.value.toUpperCase())} placeholder="ABCDE1234F" />
          </div>
          <div className="flex gap-2">
            {hasDetails && <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>}
            <Button
              className="flex-1"
              disabled={save.isPending || !accountHolderName || !accountNumber || !ifsc || !pan}
              onClick={() => save.mutate()}
            >
              {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save payout details
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
      <span className="text-slate-400">{label}</span>
      <span className="font-semibold text-slate-700">{value}</span>
    </div>
  );
}
