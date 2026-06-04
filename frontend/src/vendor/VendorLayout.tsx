import { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard, ClipboardList, UtensilsCrossed, Store, QrCode, Ticket, BarChart3, LogOut, Menu, X,
  Volume2, VolumeX,
} from "lucide-react";
import { useAuth } from "@/store/authStore";
import { useSound } from "@/store/soundStore";
import { getSocket } from "@/lib/socket";
import { toast } from "@/components/ui/toast";
import { playOrderChime, notify, ensureNotificationPermission } from "@/lib/sound";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/vendor/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/vendor/orders", label: "Orders", icon: ClipboardList },
  { to: "/vendor/menu", label: "Menu", icon: UtensilsCrossed },
  { to: "/vendor/settings", label: "Settings", icon: Store },
  { to: "/vendor/qr", label: "QR Code", icon: QrCode },
  { to: "/vendor/coupons", label: "Coupons", icon: Ticket },
  { to: "/vendor/reports", label: "Reports", icon: BarChart3 },
];

export default function VendorLayout() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user, logout } = useAuth();
  const { enabled: soundOn, toggle: toggleSound } = useSound();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/vendor/login");
  }

  // Global new-order alerts — active on EVERY vendor screen while logged in.
  useEffect(() => {
    if (!user?.id) return;
    ensureNotificationPermission();
    const socket = getSocket();
    socket.emit("vendor:join", user.id);

    const onNew = (order: any) => {
      if (useSound.getState().enabled) playOrderChime();
      toast.info("🔔 New order received!");
      notify("New order received", order?.orderNumber ? `Order ${order.orderNumber}` : "Open your dashboard to view it.");
      qc.invalidateQueries({ queryKey: ["vendor-orders"] });
      qc.invalidateQueries({ queryKey: ["vendor-stats"] });
    };
    const onStatus = () => {
      qc.invalidateQueries({ queryKey: ["vendor-orders"] });
      qc.invalidateQueries({ queryKey: ["vendor-stats"] });
    };
    socket.on("order:new", onNew);
    socket.on("order:status", onStatus);
    return () => {
      socket.off("order:new", onNew);
      socket.off("order:status", onStatus);
    };
  }, [user?.id, qc]);

  const handleToggleSound = () => {
    toggleSound();
    if (!soundOn) {
      // Play a preview of the chime to test and unlock browser audio autoplay
      setTimeout(() => {
        playOrderChime();
      }, 50);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 transform flex-col bg-slate-900 text-slate-200 transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          <Link to="/vendor/dashboard" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-md">
              <img src="/PreSnaglogo.png" alt="PreSnag" className="h-9 w-9 object-contain" />
            </div>
            <div className="leading-none">
              <div className="text-2xl font-black tracking-tight">
                <span className="text-white">Pre</span><span className="text-brand-400">Snag</span>
              </div>
              <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.22em] text-brand-400">
                Vendor Panel
              </div>
            </div>
          </Link>
          <button className="lg:hidden" onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 p-3">
          <div className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Menu</div>
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
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

        {/* Sound toggle + user + logout */}
        <div className="space-y-2 border-t border-white/10 p-3">
          <button
            onClick={handleToggleSound}
            className="flex w-full items-center justify-between rounded-xl bg-white/5 px-3 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
          >
            <span className="flex items-center gap-3">
              {soundOn ? <Volume2 className="h-5 w-5 text-brand-400" /> : <VolumeX className="h-5 w-5 text-slate-500" />}
              Order Sound
            </span>
            <span
              className={cn(
                "relative h-5 w-9 rounded-full transition",
                soundOn ? "bg-brand-500" : "bg-slate-600"
              )}
            >
              <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all", soundOn ? "left-4" : "left-0.5")} />
            </span>
          </button>

          <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
              {user?.name?.charAt(0).toUpperCase() || "V"}
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="truncate text-sm font-semibold text-white">{user?.name}</div>
              <div className="truncate text-[10px] uppercase tracking-wide text-brand-400">Vendor</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
          >
            <LogOut className="h-5 w-5" /> Log Out
          </button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4 lg:hidden">
          <button onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="h-6 w-6 text-slate-700" /></button>
          <span className="text-lg font-black tracking-tight">
            <span className="text-slate-900">Pre</span><span className="text-brand-500">Snag</span>
          </span>
          <button
            onClick={handleToggleSound}
            aria-label="Toggle order sound"
            title={soundOn ? "Order sound on" : "Order sound off"}
            className={cn(
              "ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full transition",
              soundOn ? "bg-brand-50 text-brand-600" : "text-slate-400 hover:bg-slate-100"
            )}
          >
            {soundOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </button>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
