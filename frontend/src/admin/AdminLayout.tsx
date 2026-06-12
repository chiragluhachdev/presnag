import { Outlet, NavLink, useNavigate, Link } from "react-router-dom";
import { LayoutDashboard, Store, ClipboardList, BarChart3, LogOut, ExternalLink, Wallet } from "lucide-react";
import { useAuth } from "@/store/authStore";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/admin/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/vendors", label: "Vendors", icon: Store },
  { to: "/admin/orders", label: "Orders", icon: ClipboardList },
  { to: "/admin/finance", label: "Finance", icon: Wallet },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col bg-slate-900 text-slate-200">
        {/* Brand / large logo */}
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-md">
            <img src="/PreSnaglogo.png" alt="PreSnag" className="h-10 w-10 object-contain" />
          </div>
          <div className="leading-none">
            <div className="text-2xl font-black tracking-tight">
              <span className="text-white">Pre</span><span className="text-brand-400">Snag</span>
            </div>
            <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.25em] text-brand-400">
              Admin Panel
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 p-3">
          <div className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Management
          </div>
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                  isActive
                    ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                )
              }
            >
              <n.icon className="h-5 w-5" /> {n.label}
            </NavLink>
          ))}
        </nav>

        {/* User + logout */}
        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
              {user?.name?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="truncate text-sm font-semibold text-white">{user?.name}</div>
              <div className="truncate text-[10px] uppercase tracking-wide text-brand-400">{user?.role}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
          >
            <LogOut className="h-5 w-5" /> Log Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8">
          <div className="text-sm text-slate-500">
            Welcome back, <span className="font-semibold text-slate-800">{user?.name}</span> 👋
          </div>
          <Link
            to="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-brand-600 transition hover:bg-brand-50"
          >
            View site <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </header>
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
