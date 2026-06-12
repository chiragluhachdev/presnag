import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Loader2, Store, ArrowRight, ArrowLeft, ShieldCheck, Zap, Banknote,
  Lock, CheckCircle2, Building2, BadgeIndianRupee, FileCheck, Clock,
} from "lucide-react";
import { api } from "@/lib/api";
import { AuthUser } from "@/lib/types";
import { useAuth } from "@/store/authStore";
import { Input, Button, Label, Select } from "@/components/ui";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { ImagePanel } from "./VendorLogin";

const CATEGORIES = ["Tea Stall", "Café", "Bakery", "Juice Corner", "Fast Food", "Food Court", "North Indian", "Multi-Cuisine", "Healthy Food"];

export default function VendorRegister() {
  const navigate = useNavigate();
  const setAuth = useAuth((s) => s.setAuth);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);

  // Step 1 — basic details
  const [name, setName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState("Fast Food");
  const [openTime, setOpenTime] = useState("09:00");
  const [closeTime, setCloseTime] = useState("21:00");

  // Step 2 — settlement (PreSnag Managed)
  const [accountHolderName, setAccountHolderName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [pan, setPan] = useState("");

  // Step 3 — food license
  const [fssaiLicense, setFssaiLicense] = useState("");

  function next1(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !ownerName.trim() || !phone.trim() || !password.trim() || !address.trim()) {
      return toast.error("Please fill all required fields");
    }
    if (phone.replace(/\D/g, "").length !== 10) return toast.error("Enter a valid 10-digit mobile");
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    setStep(2);
  }
  function next2(e: React.FormEvent) {
    e.preventDefault();
    if (!accountHolderName || !accountNumber || !ifsc || !pan) return toast.error("Please complete your bank details");
    setStep(3);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!fssaiLicense.trim()) return toast.error("FSSAI license number is required");
    setLoading(true);
    try {
      const res = await api<{ token: string; user: AuthUser }>("/api/auth/vendor/register", {
        method: "POST",
        body: {
          name, ownerName, phone, email, password, address, category, openTime, closeTime,
          accountHolderName, accountNumber, ifsc, pan, fssaiLicense,
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
          <div className="mt-4 flex items-center gap-1.5">
            <StepDot active={step >= 1} done={step > 1} label="Details" n={1} />
            <Bar done={step > 1} />
            <StepDot active={step >= 2} done={step > 2} label="Bank" n={2} />
            <Bar done={step > 2} />
            <StepDot active={step >= 3} done={false} label="License" n={3} />
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <form onSubmit={next1} className="mt-5 space-y-3">
              <div>
                <h1 className="text-lg font-extrabold tracking-tight text-slate-900">Basic details</h1>
                <p className="text-xs text-slate-500">Tell us about your shop.</p>
              </div>
              <div><Label>Shop Name *</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Tadka Junction" /></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div><Label>Owner Name *</Label><Input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Full name" /></div>
                <div><Label>Mobile Number *</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile" type="tel" /></div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div><Label>Email (optional)</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></div>
                <div><Label>Password *</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" /></div>
              </div>
              <div><Label>Shop Address *</Label><Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Area, city" /></div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="sm:col-span-1">
                  <Label>Category *</Label>
                  <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </Select>
                </div>
                <div><Label>Opening Time</Label><Input type="time" value={openTime} onChange={(e) => setOpenTime(e.target.value)} /></div>
                <div><Label>Closing Time</Label><Input type="time" value={closeTime} onChange={(e) => setCloseTime(e.target.value)} /></div>
              </div>
              <Button className="w-full" size="lg">Continue <ArrowRight className="h-4 w-4" /></Button>
            </form>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <form onSubmit={next2} className="mt-5 space-y-3.5">
              <div>
                <h1 className="text-lg font-extrabold tracking-tight text-slate-900">Settlement details</h1>
                <p className="text-xs text-slate-500">Where should we settle your earnings?</p>
              </div>

              {/* Mode — Managed (active) + Direct (coming soon) */}
              <div className="space-y-2.5">
                <div className="relative flex w-full items-start gap-3 rounded-xl border border-brand-500 bg-brand-50/40 p-3 ring-1 ring-brand-500">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-white"><Zap className="h-4 w-4" /></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">PreSnag Managed</span>
                      <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700">Active</span>
                    </div>
                    <p className="mt-0.5 text-[11px] leading-snug text-slate-500">PreSnag collects payments and settles to your bank automatically within 24 hours.</p>
                  </div>
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
                </div>
                <div className="relative flex w-full items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 opacity-70">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-400"><Banknote className="h-4 w-4" /></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-500">Direct Settlement</span>
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">Available soon</span>
                    </div>
                    <p className="mt-0.5 text-[11px] leading-snug text-slate-400">Get paid directly per order via Cashfree — coming soon.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800"><Building2 className="h-4 w-4 text-brand-500" /> Bank details</div>
                <div><Label>Account Holder Name *</Label><Input value={accountHolderName} onChange={(e) => setAccountHolderName(e.target.value)} placeholder="As per bank records" /></div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div><Label>Account Number *</Label><Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="Bank account no." /></div>
                  <div><Label>IFSC Code *</Label><Input value={ifsc} onChange={(e) => setIfsc(e.target.value.toUpperCase())} placeholder="e.g. HDFC0001234" /></div>
                </div>
                <div><Label>PAN Number *</Label><Input value={pan} onChange={(e) => setPan(e.target.value.toUpperCase())} placeholder="ABCDE1234F" /></div>
                <div className="flex items-start gap-2 rounded-lg bg-white p-2.5 text-[11px] text-slate-500">
                  <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  Your bank details are kept private and used only to settle your earnings.
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4" /> Back</Button>
                <Button className="flex-1" size="lg">Continue <ArrowRight className="h-4 w-4" /></Button>
              </div>
            </form>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <form onSubmit={submit} className="mt-5 space-y-4">
              <div>
                <h1 className="text-lg font-extrabold tracking-tight text-slate-900">Food license</h1>
                <p className="text-xs text-slate-500">Required to serve food on PreSnag.</p>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><FileCheck className="h-5 w-5" /></div>
                <div className="flex-1">
                  <Label>FSSAI License Number *</Label>
                  <Input value={fssaiLicense} onChange={(e) => setFssaiLicense(e.target.value)} placeholder="14-digit FSSAI number" />
                  <p className="mt-1.5 text-[11px] text-slate-400">That's the only document we need — no GST, Udyam or photos required.</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <TrustChip icon={ShieldCheck} text="Secure" />
                <TrustChip icon={BadgeIndianRupee} text="5% per order" />
                <TrustChip icon={Clock} text="Live in 24h" />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setStep(2)} disabled={loading}><ArrowLeft className="h-4 w-4" /> Back</Button>
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
      <ImagePanel heading="Grow your cafe with PreSnag." sub="Accept prepaid orders, reduce queues, and get paid — set up in minutes." />
    </div>
  );
}

function StepDot({ active, done, label, n }: { active: boolean; done: boolean; label: string; n: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn("flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition", active ? "bg-brand-500 text-white shadow-sm shadow-brand-500/20" : "bg-slate-100 text-slate-400")}>
        {done ? <CheckCircle2 className="h-4 w-4" /> : n}
      </div>
      <span className={cn("hidden text-xs font-semibold sm:inline", active ? "text-slate-800" : "text-slate-400")}>{label}</span>
    </div>
  );
}
function Bar({ done }: { done: boolean }) {
  return <div className={cn("h-0.5 flex-1 rounded", done ? "bg-brand-500" : "bg-slate-200")} />;
}
function TrustChip({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-lg border border-slate-100 bg-slate-50/60 py-1.5 text-[10px] font-semibold text-slate-500">
      <Icon className="h-3.5 w-3.5 text-emerald-600" />
      {text}
    </div>
  );
}
