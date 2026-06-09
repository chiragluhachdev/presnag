import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Loader2, Store, ArrowRight, ArrowLeft, ShieldCheck, Zap, Banknote,
  Lock, CheckCircle2, Building2, BadgeIndianRupee,
} from "lucide-react";
import { api } from "@/lib/api";
import { AuthUser } from "@/lib/types";
import { useAuth } from "@/store/authStore";
import { Input, Button, Label, Select } from "@/components/ui";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { ImagePanel } from "./VendorLogin";

const CATEGORIES = ["Tea Stall", "Café", "Bakery", "Juice Corner", "Fast Food", "Food Court"];

type Mode = "MANAGED" | "DIRECT";

export default function VendorRegister() {
  const navigate = useNavigate();
  const setAuth = useAuth((s) => s.setAuth);

  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);

  // Step 1 — account & shop
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("Fast Food");
  const [address, setAddress] = useState("");

  // Step 2 — settlement
  const [mode, setMode] = useState<Mode>("MANAGED");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [pan, setPan] = useState("");

  function next(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error("Please fill shop name, email and password");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setStep(2);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "MANAGED" && (!accountHolderName || !accountNumber || !ifsc || !pan)) {
      toast.error("Please complete your payout bank details");
      return;
    }
    setLoading(true);
    try {
      const res = await api<{ token: string; user: AuthUser }>("/api/auth/vendor/register", {
        method: "POST",
        body: {
          name, email, password, phone, category, address,
          settlementMode: mode,
          ...(mode === "MANAGED" ? { accountHolderName, accountNumber, ifsc, pan } : {}),
        },
      });
      setAuth(res.user, res.token);
      toast.success("Welcome to PreSnag! Your shop is under review.");
      navigate("/vendor/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left — form */}
      <div className="flex w-full flex-col px-6 py-4 md:h-screen md:w-1/2 md:px-12 lg:px-16">
        <Link to="/" className="inline-flex items-center gap-2 self-start text-sm font-medium text-slate-500 transition hover:text-brand-600">
          <ArrowLeft className="h-4 w-4" /> Back to PreSnag
        </Link>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-3 [&_input]:h-9 [&_input]:text-sm [&_select]:h-9">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <img src="/PreSnaglogo.png" alt="PreSnag" className="h-9 w-9 object-contain" />
            <div className="leading-none">
              <div className="text-xl font-black tracking-tight">
                <span className="text-slate-900">Pre</span><span className="text-brand-500">Snag</span>
              </div>
              <div className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                <Store className="h-3 w-3" /> Become a Vendor
              </div>
            </div>
          </div>

          {/* Stepper */}
          <div className="mt-4 flex items-center gap-2">
            <StepDot active={step >= 1} done={step > 1} label="Your Shop" n={1} />
            <div className={cn("h-0.5 flex-1 rounded", step > 1 ? "bg-brand-500" : "bg-slate-200")} />
            <StepDot active={step >= 2} done={false} label="Payments" n={2} />
          </div>

          {step === 1 ? (
            <form onSubmit={next} className="mt-5 space-y-3">
              <div>
                <h1 className="text-lg font-extrabold tracking-tight text-slate-900">Set up your shop</h1>
                <p className="text-xs text-slate-500">Tell customers who you are.</p>
              </div>

              <div>
                <Label>Shop / Stall Name *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Tadka Junction" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Email (login) *</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                </div>
                <div>
                  <Label>Password *</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Phone</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile" />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </Select>
                </div>
              </div>
              <div>
                <Label>Shop Address</Label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Area, city" />
              </div>

              <Button className="w-full" size="lg">
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <form onSubmit={submit} className="mt-5 space-y-3.5">
              <div>
                <h1 className="text-lg font-extrabold tracking-tight text-slate-900">How do you want to get paid?</h1>
                <p className="text-xs text-slate-500">You can switch anytime — no lock-in.</p>
              </div>

              {/* Mode choice */}
              <div className="space-y-2.5">
                <ModeOption
                  active={mode === "MANAGED"}
                  onClick={() => setMode("MANAGED")}
                  icon={Zap}
                  badge="Instant"
                  title="PreSnag Managed"
                  desc="Go live today. PreSnag collects payments and settles to your bank automatically every evening."
                />
                <ModeOption
                  active={mode === "DIRECT"}
                  onClick={() => setMode("DIRECT")}
                  icon={Banknote}
                  badge="Direct to bank"
                  title="Direct Settlement"
                  desc="Each payment lands straight in your account via Cashfree. Requires a quick one-time KYC."
                />
              </div>

              {mode === "MANAGED" ? (
                <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <Building2 className="h-4 w-4 text-brand-500" /> Payout bank details
                  </div>
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
                  <div className="flex items-start gap-2 rounded-lg bg-white p-2.5 text-[11px] text-slate-500">
                    <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    Your details are processed securely by Cashfree, a licensed payment partner.
                    PreSnag never stores your full account number or PAN.
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 rounded-xl border border-brand-100 bg-brand-50/50 p-4 text-sm text-slate-600">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                  <div>
                    After you register, you'll be taken to <span className="font-semibold">Cashfree's secure page</span> to
                    complete a quick KYC. Once verified, every order pays you directly. You can finish this from your dashboard too.
                  </div>
                </div>
              )}

              {/* Trust footer */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <TrustChip icon={ShieldCheck} text="Secure" />
                <TrustChip icon={BadgeIndianRupee} text="0% commission" />
                <TrustChip icon={CheckCircle2} text="Transparent" />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setStep(1)} disabled={loading}>
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button className="flex-1" size="lg" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />} Create my shop
                </Button>
              </div>
            </form>
          )}

          <p className="mt-4 text-center text-xs text-slate-500">
            Already have an account?{" "}
            <Link to="/vendor/login" className="font-semibold text-brand-600 hover:underline">Log in</Link>
          </p>
        </div>
      </div>

      {/* Right — image panel */}
      <ImagePanel
        heading="Grow your cafe with PreSnag."
        sub="Accept prepaid orders, reduce queues, and get paid — set up in minutes."
      />
    </div>
  );
}

function StepDot({ active, done, label, n }: { active: boolean; done: boolean; label: string; n: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn(
        "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition",
        active ? "bg-brand-500 text-white shadow-sm shadow-brand-500/20" : "bg-slate-100 text-slate-400"
      )}>
        {done ? <CheckCircle2 className="h-4 w-4" /> : n}
      </div>
      <span className={cn("text-xs font-semibold", active ? "text-slate-800" : "text-slate-400")}>{label}</span>
    </div>
  );
}

function ModeOption({
  active, onClick, icon: Icon, badge, title, desc,
}: { active: boolean; onClick: () => void; icon: any; badge: string; title: string; desc: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all",
        active ? "border-brand-500 bg-brand-50/40 ring-1 ring-brand-500 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"
      )}
    >
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", active ? "bg-brand-500 text-white" : "bg-slate-100 text-slate-500")}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-900">{title}</span>
          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", active ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-500")}>{badge}</span>
        </div>
        <p className="mt-0.5 text-[11px] leading-snug text-slate-500">{desc}</p>
      </div>
      <div className={cn("mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2", active ? "border-brand-500 bg-brand-500" : "border-slate-300")}>
        {active && <CheckCircle2 className="h-3 w-3 text-white" />}
      </div>
    </button>
  );
}

function TrustChip({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-lg border border-slate-100 bg-slate-50/60 py-1.5 text-[10px] font-semibold text-slate-500">
      <Icon className="h-3.5 w-3.5 text-emerald-600" />
      {text}
    </div>
  );
}
