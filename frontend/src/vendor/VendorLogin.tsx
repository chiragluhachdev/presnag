import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, Store } from "lucide-react";
import { api } from "@/lib/api";
import { AuthUser } from "@/lib/types";
import { useAuth } from "@/store/authStore";
import { Input, Button, Label, Card } from "@/components/ui";
import { toast } from "@/components/ui/toast";

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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-brand-500 via-orange-500 to-orange-600 p-4">
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-white/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -right-20 h-96 w-96 rounded-full bg-amber-300/20 blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Brand / large logo */}
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 inline-flex items-center justify-center rounded-3xl bg-white p-4 shadow-2xl">
            <img src="/PreSnaglogo.png" alt="PreSnag" className="h-16 w-16 object-contain" />
          </div>
          <div className="text-4xl font-black tracking-tight text-white">
            Pre<span className="text-amber-200">Snag</span>
          </div>
          <div className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.25em] text-white/90">
            <Store className="h-3.5 w-3.5" /> Vendor Panel
          </div>
        </div>

        <Card className="p-8">
          <h1 className="text-center text-xl font-bold text-slate-900">Welcome back</h1>
          <p className="mb-6 mt-1 text-center text-sm text-slate-500">Log in to manage your stall</p>

          <form onSubmit={submit} className="space-y-4">
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
        </Card>

        <Link to="/" className="mt-5 block text-center text-sm font-medium text-white/90 transition hover:text-white">
          ← Back to PreSnag
        </Link>
      </div>
    </div>
  );
}
