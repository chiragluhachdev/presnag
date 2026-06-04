import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import { AuthUser } from "@/lib/types";
import { useAuth } from "@/store/authStore";
import { Input, Button, Label, Card } from "@/components/ui";
import { toast } from "@/components/ui/toast";

export default function AdminLogin() {
  const navigate = useNavigate();
  const setAuth = useAuth((s) => s.setAuth);
  const [email, setEmail] = useState("admin@presnag.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api<{ token: string; user: AuthUser }>("/api/auth/admin/login", {
        method: "POST",
        body: { email, password },
      });
      setAuth(res.user, res.token);
      navigate("/admin/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-900 p-4">
      {/* decorative glows */}
      <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" />
      <div className="absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Brand / large logo */}
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 inline-flex items-center justify-center rounded-3xl bg-white p-4 shadow-2xl">
            <img src="/PreSnaglogo.png" alt="PreSnag" className="h-16 w-16 object-contain" />
          </div>
          <div className="text-4xl font-black tracking-tight">
            <span className="text-white">Pre</span><span className="text-brand-400">Snag</span>
          </div>
          <div className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.25em] text-brand-400">
            <ShieldCheck className="h-3.5 w-3.5" /> Admin Panel
          </div>
        </div>

        <Card className="p-8">
          <h1 className="text-center text-xl font-bold text-slate-900">Sign in to continue</h1>
          <p className="mb-6 mt-1 text-center text-sm text-slate-500">Platform management dashboard</p>

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
            Demo · admin@presnag.com / admin123
          </p>
        </Card>

        <Link to="/" className="mt-5 block text-center text-sm font-medium text-slate-400 transition hover:text-white">
          ← Back to PreSnag
        </Link>
      </div>
    </div>
  );
}
