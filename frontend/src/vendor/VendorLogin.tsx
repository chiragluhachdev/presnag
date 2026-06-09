import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, Store, CheckCircle2, ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { AuthUser } from "@/lib/types";
import { useAuth } from "@/store/authStore";
import { Input, Button, Label } from "@/components/ui";
import { toast } from "@/components/ui/toast";

const SIDE_IMG =
  "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=1400&q=80&auto=format&fit=crop";

export default function VendorLogin() {
  const navigate = useNavigate();
  const setAuth = useAuth((s) => s.setAuth);
  const [email, setEmail] = useState("tadka@presnag.com");
  const [password, setPassword] = useState("vendor123");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api<{ token: string; user: AuthUser }>("/api/auth/vendor/login", {
        method: "POST",
        body: { email, password },
      });
      setAuth(res.user, res.token);
      navigate("/vendor/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left — form */}
      <div className="flex w-full flex-col px-6 py-8 md:w-1/2 md:px-12 lg:px-20">
        <Link to="/" className="inline-flex items-center gap-2 self-start text-sm font-medium text-slate-500 transition hover:text-brand-600">
          <ArrowLeft className="h-4 w-4" /> Back to PreSnag
        </Link>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <img src="/PreSnaglogo.png" alt="PreSnag" className="h-11 w-11 object-contain" />
            <div className="leading-none">
              <div className="text-2xl font-black tracking-tight">
                <span className="text-slate-900">Pre</span><span className="text-brand-500">Snag</span>
              </div>
              <div className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                <Store className="h-3 w-3" /> Vendor Panel
              </div>
            </div>
          </div>

          <h1 className="mt-8 text-2xl font-extrabold tracking-tight text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">Log in to manage your stall and orders.</p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <div>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button className="w-full" size="lg" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Log In
            </Button>
          </form>

          <p className="mt-5 rounded-lg bg-slate-50 py-2 text-center text-xs text-slate-400">
            Demo · tadka@presnag.com / vendor123
          </p>

          <p className="mt-6 text-center text-sm text-slate-500">
            New to PreSnag?{" "}
            <Link to="/vendor/register" className="font-semibold text-brand-600 hover:underline">
              Register your shop
            </Link>
          </p>
        </div>
      </div>

      {/* Right — image panel */}
      <ImagePanel
        heading="Run your stall, skip the queue."
        sub="Manage orders, menu and payments — all from one simple dashboard."
      />
    </div>
  );
}

/* Shared right-side branded image panel (login + register). */
export function ImagePanel({ heading, sub }: { heading: string; sub: string }) {
  return (
    <div className="relative hidden md:block md:w-1/2">
      <img src={SIDE_IMG} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-br from-brand-600/85 via-orange-600/75 to-slate-900/80" />
      <div className="relative flex h-full flex-col justify-between p-10">
        <div className="inline-flex items-center gap-2 self-start rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur">
          <Store className="h-3.5 w-3.5" /> PreSnag for Partners
        </div>
        <div>
          <h2 className="max-w-sm text-2xl font-black leading-tight tracking-tight text-white lg:text-3xl">
            {heading}
          </h2>
          <p className="mt-2.5 max-w-sm text-sm text-white/85">{sub}</p>
          <ul className="mt-6 space-y-2">
            {["Zero per-order commission", "Daily settlements to your bank", "No customer app required"].map((t) => (
              <li key={t} className="flex items-center gap-2.5 text-sm font-medium text-white">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-200" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="text-[11px] text-white/70">© {new Date().getFullYear()} PreSnag Technologies</div>
      </div>
    </div>
  );
}
