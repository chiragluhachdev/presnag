import { useState, useMemo } from "react";
import { useNavigate, Link, NavigateFunction } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Search, MapPin, Loader2, CupSoda, Sandwich, GlassWater, Croissant, UtensilsCrossed, Cookie,
  Store, ClipboardList, PackageCheck, Receipt, Info,
} from "lucide-react";
import { api } from "@/lib/api";
import { Vendor } from "@/lib/types";
import { PublicFooter } from "@/components/PublicNav";
import { DemoBanner } from "@/components/DemoBanner";
import { VendorCard } from "@/components/VendorCard";
import { Spinner, Button, Label } from "@/components/ui";
import { Modal } from "@/components/ui/modal";

const HERO_IMG = "/hero.png";

// Friendly homepage tiles → actual backend vendor categories (for /shops filtering).
const CATEGORY_TILES = [
  { label: "Tea & Coffee", category: "Tea Stall", icon: CupSoda },
  { label: "Juice", category: "Juice Corner", icon: GlassWater },
  { label: "Fast Food", category: "Fast Food", icon: Sandwich },
  { label: "Bakery", category: "Bakery", icon: Croissant },
  { label: "Cafeteria", category: "Café", icon: UtensilsCrossed },
  { label: "Snacks", category: "Food Court", icon: Cookie },
];

const STEPS = [
  { icon: Store, title: "Find a Vendor", text: "Search or browse nearby" },
  { icon: ClipboardList, title: "Place Order", text: "Add items & checkout" },
  { icon: PackageCheck, title: "Pick Up & Go", text: "Collect when ready" },
];

// Haversine distance in km between two lat/lng points.
function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

// Shared view model passed to both the mobile and desktop layouts.
interface HomeView {
  navigate: NavigateFunction;
  q: string;
  setQ: (s: string) => void;
  loc: { lat: number; lng: number } | null;
  locStatus: "idle" | "loading" | "denied";
  useMyLocation: () => void;
  submitSearch: (e: React.FormEvent) => void;
  trackOrder: () => void;
  vendors: Vendor[] | undefined;
  isLoading: boolean;
  featured: Vendor[];
  nearby: { v: Vendor; d: number }[];
}

export default function Home() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [locStatus, setLocStatus] = useState<"idle" | "loading" | "denied">("idle");
  const [trackOpen, setTrackOpen] = useState(false);

  const { data: vendors, isLoading } = useQuery({
    queryKey: ["vendors", "home"],
    queryFn: () => api<Vendor[]>(`/api/public/vendors`),
  });

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate(`/shops?q=${encodeURIComponent(q.trim())}`);
  }

  function trackOrder() {
    setTrackOpen(true);
  }

  function useMyLocation() {
    if (!navigator.geolocation) return setLocStatus("denied");
    setLocStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocStatus("idle");
      },
      () => setLocStatus("denied"),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  const featured = useMemo(
    () => [...(vendors || [])].sort((a, b) => Number(b.isOpen) - Number(a.isOpen)).slice(0, 6),
    [vendors]
  );
  const nearby = useMemo(() => {
    if (!loc || !vendors) return [];
    return vendors
      .filter((v) => v.lat != null && v.lng != null)
      .map((v) => ({ v, d: distanceKm(loc.lat, loc.lng, v.lat!, v.lng!) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 6);
  }, [loc, vendors]);

  const vm: HomeView = {
    navigate, q, setQ, loc, locStatus, useMyLocation, submitSearch, trackOrder, vendors, isLoading, featured, nearby,
  };

  return (
    <>
      {/* Mobile (unchanged) — below md */}
      <div className="md:hidden">
        <MobileHome {...vm} />
      </div>
      {/* Tablet / iPad / Desktop — md and up */}
      <div className="hidden md:block">
        <DesktopHome {...vm} />
      </div>

      {trackOpen && (
        <TrackOrderModal
          onClose={() => setTrackOpen(false)}
          onTrack={(num) => {
            setTrackOpen(false);
            navigate(`/track/${num}`);
          }}
        />
      )}
    </>
  );
}

function TrackOrderModal({ onClose, onTrack }: { onClose: () => void; onTrack: (num: string) => void }) {
  const [suffix, setSuffix] = useState("");

  function go(e?: React.FormEvent) {
    e?.preventDefault();
    const v = suffix.trim().toUpperCase();
    if (v) onTrack(`PS-${v}`);
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Track your order"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => go()}>
            <Receipt className="h-4 w-4" /> Track Order
          </Button>
        </>
      }
    >
      <form onSubmit={go} className="space-y-2">
        <Label>Order Number</Label>
        <div className="flex items-stretch overflow-hidden rounded-lg border border-slate-300 transition focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100">
          <span className="flex select-none items-center bg-slate-100 px-3 text-sm font-bold tracking-wide text-slate-500">
            PS-
          </span>
          <input
            autoFocus
            value={suffix}
            onChange={(e) => setSuffix(e.target.value.toUpperCase())}
            placeholder="XXXXX"
            className="h-10 flex-1 bg-white px-3 text-sm font-semibold uppercase tracking-wide outline-none placeholder:font-normal placeholder:text-slate-400"
          />
        </div>
        <p className="text-xs text-slate-400">
          You'll find your order number on the confirmation screen.
        </p>
      </form>
    </Modal>
  );
}

/* ----------------------------------------------------------------------------
 * MOBILE LAYOUT — kept exactly as the approved mobile design.
 * -------------------------------------------------------------------------- */
function DemoNotice({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 rounded-lg border border-brand-100 bg-brand-50/50 px-2.5 py-1.5 ${className}`}>
      <Info className="h-3.5 w-3.5 shrink-0 text-brand-600" />
      <p className="text-[11px] leading-snug text-brand-800">
        <span className="font-semibold">Demo mode:</span> No real orders are being processed — feel free to explore the full flow.
      </p>
    </div>
  );
}

function MobileHome({
  navigate, q, setQ, loc, locStatus, useMyLocation, submitSearch, trackOrder, vendors, isLoading, featured, nearby,
}: HomeView) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Inline header — logo left, location right (flush against the hero) */}
      <header className="flex items-center justify-between bg-white px-3 py-1.5">
        <Link to="/" className="flex items-center gap-1.5">
          <img src="/PreSnaglogo.png" alt="PreSnag" className="h-9 w-9 object-contain" />
          <div className="leading-none">
            <div className="text-lg font-black tracking-tight">
              <span className="text-slate-900">Pre</span><span className="text-brand-500">Snag</span>
            </div>
            <div className="mt-0.5 text-[8px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Order Ahead. Skip The Queue.
            </div>
          </div>
        </Link>
        <button
          onClick={useMyLocation}
          disabled={locStatus === "loading"}
          aria-label="Use my location"
          title={loc ? "Location on" : "Use my location"}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition disabled:opacity-60 ${
            loc ? "bg-brand-50 text-brand-600" : "text-brand-600 hover:bg-brand-50"
          }`}
        >
          {locStatus === "loading" ? <Loader2 className="h-5 w-5 animate-spin" /> : <MapPin className="h-5 w-5" />}
        </button>
      </header>

      {/* Hero — full-bleed orange, flush to header, edge-to-edge on mobile */}
      <section className="bg-gradient-to-br from-brand-500 to-orange-600 px-3 pb-4 pt-3 text-white sm:px-4">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-3">
            <div className="flex-[0_0_64%]">
              <h1 className="text-2xl font-extrabold leading-[1.12] tracking-tight sm:text-4xl">
                Order Ahead.
                <br />
                <span className="text-amber-200">Skip The Queue.</span>
              </h1>
              <p className="mt-2 line-clamp-2 max-w-md text-xs text-brand-50/90 sm:text-base">
                Find nearby vendors and place your order before you arrive.
              </p>
            </div>
            <div className="flex-1">
              <img
                src={HERO_IMG}
                alt=""
                className="ml-auto h-28 w-full max-w-[150px] object-contain drop-shadow-md sm:h-36"
              />
            </div>
          </div>

          {/* Search — inside the hero */}
          <form
            onSubmit={submitSearch}
            className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-white p-1 shadow-md"
          >
            <Search className="ml-1.5 h-4 w-4 shrink-0 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search vendors, food or categories"
              className="h-8 flex-1 bg-transparent text-[13px] text-slate-800 outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="h-8 shrink-0 rounded-md bg-brand-500 px-3 text-xs font-semibold text-white hover:bg-brand-600"
            >
              Search
            </button>
          </form>

          {/* Action buttons — inside the hero */}
          <div className="mt-2 flex items-center justify-center gap-2">
            <button
              onClick={() => navigate("/shops")}
              className="flex h-8 items-center justify-center gap-1 rounded-lg bg-white px-4 text-xs font-semibold text-brand-600 shadow-sm transition hover:bg-brand-50"
            >
              <Store className="h-3.5 w-3.5" /> Browse Vendors
            </button>
            <button
              onClick={trackOrder}
              className="flex h-8 items-center justify-center gap-1.5 rounded-lg border border-white/70 px-4 text-xs font-semibold text-white transition hover:bg-white/10"
            >
              <Receipt className="h-3.5 w-3.5" /> Track Order
            </button>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl flex-1 px-2 py-3 sm:px-4">
        {/* Popular categories — shortcuts, above vendors */}
        <section className="mb-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold">Popular categories</h2>
            <Link to="/shops" className="text-xs font-medium text-brand-600 hover:underline">See all</Link>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {CATEGORY_TILES.slice(0, 5).map((c) => (
              <Link
                key={c.label}
                to={`/shops?category=${encodeURIComponent(c.category)}`}
                className="flex flex-col items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white p-2 text-center transition hover:border-brand-300 hover:shadow-sm"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full text-brand-600 ring-1 ring-brand-200">
                  <c.icon className="h-3 w-3" />
                </div>
                <span className="text-[9px] font-medium leading-tight text-slate-600 sm:text-[10px]">{c.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured / nearby vendors */}
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner className="h-8 w-8" /></div>
        ) : (
          <>
            {nearby.length > 0 && (
              <Section title="Nearby vendors" subtitle="Closest to you right now">
                {nearby.map(({ v, d }) => (
                  <VendorCard key={v._id} v={v} distanceKm={d} />
                ))}
              </Section>
            )}

            <DemoNotice className="mb-3" />

            <DemoBanner placement="home" className="mb-3" />

            <Section title="Featured vendors" subtitle="Popular places to order from" seeAll vertical>
              {featured.map((v) => (
                <VendorCard key={v._id} v={v} horizontal />
              ))}
            </Section>

            {(!vendors || vendors.length === 0) && (
              <div className="py-12 text-center text-slate-500">No vendors yet.</div>
            )}
          </>
        )}

        {/* How It Works — compact horizontal stepper */}
        <section className="mt-2">
          <h2 className="mb-3 text-center text-sm font-bold">How it works</h2>
          <div className="relative grid grid-cols-3 gap-1 rounded-2xl border border-slate-200 bg-white px-2 py-4 shadow-sm">
            <div className="absolute left-[18%] right-[18%] top-[40px] border-t-2 border-dashed border-brand-100" />
            {STEPS.map((s, i) => (
              <div key={s.title} className="relative z-10 flex flex-col items-center px-1 text-center">
                <div className="relative mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-600 ring-4 ring-white">
                  <s.icon className="h-5 w-5" />
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[9px] font-bold text-white">
                    {i + 1}
                  </span>
                </div>
                <div className="text-[11px] font-bold leading-tight text-slate-800 sm:text-xs">{s.title}</div>
                <p className="mt-0.5 text-[10px] leading-tight text-slate-500">{s.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

function Section({
  title,
  subtitle,
  seeAll,
  vertical,
  children,
}: {
  title: string;
  subtitle?: string;
  seeAll?: boolean;
  vertical?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-5">
      <div className="mb-2 flex items-end justify-between">
        <div>
          <h2 className="text-sm font-bold">{title}</h2>
          {subtitle && <p className="text-[11px] text-slate-500">{subtitle}</p>}
        </div>
        {seeAll && (
          <Link to="/shops" className="text-xs font-medium text-brand-600 hover:underline">
            See all shops
          </Link>
        )}
      </div>
      <div
        className={
          vertical
            ? "flex flex-col gap-3"
            : "grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4"
        }
      >
        {children}
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------------
 * DESKTOP / TABLET LAYOUT — roomier, wider grid (md and up).
 * -------------------------------------------------------------------------- */
function DesktopHome({
  navigate, q, setQ, loc, locStatus, useMyLocation, submitSearch, trackOrder, vendors, isLoading, featured, nearby,
}: HomeView) {
  const quickChips = CATEGORY_TILES.slice(0, 4);
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-20 w-full max-w-[1400px] items-center justify-between px-10">
          <Link to="/" className="flex items-center gap-3">
            <img src="/PreSnaglogo.png" alt="PreSnag" className="h-12 w-12 object-contain" />
            <div className="leading-none">
              <div className="text-3xl font-black tracking-tight">
                <span className="text-slate-900">Pre</span><span className="text-brand-500">Snag</span>
              </div>
              <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Order Ahead. Skip The Queue.
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/shops" className="text-sm font-semibold text-slate-600 transition hover:text-brand-600">
              Browse Vendors
            </Link>
            <button
              onClick={trackOrder}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 transition hover:text-brand-600"
            >
              <Receipt className="h-4 w-4" /> Track Order
            </button>
            <a
              href="/partner"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-brand-500 px-5 py-2.5 text-sm font-semibold text-brand-600 transition hover:bg-brand-50"
            >
              <Store className="h-4 w-4" /> Become a Partner
            </a>
            <button
              onClick={useMyLocation}
              disabled={locStatus === "loading"}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${
                loc ? "bg-brand-50 text-brand-600" : "bg-brand-500 text-white shadow-sm shadow-brand-500/20 hover:bg-brand-600"
              }`}
            >
              {locStatus === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
              {loc ? "Location On" : "Use My Location"}
            </button>
          </div>
        </div>
      </header>

      {/* Hero — full-bleed gradient */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-500 via-orange-500 to-orange-600 text-white">
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-10 h-[28rem] w-[28rem] rounded-full bg-amber-300/20 blur-3xl" />

        <div className="relative mx-auto grid w-full max-w-[1400px] grid-cols-[1.1fr_0.9fr] items-center gap-12 px-10 py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
              🍴 No app · No signup · Order in seconds
            </span>
            <h1 className="mt-5 text-6xl font-extrabold leading-[1.05] tracking-tight xl:text-7xl">
              Order Ahead.
              <br />
              <span className="text-amber-200">Skip The Queue.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-brand-50/90">
              Discover nearby stalls, cafés & food courts. Order before you arrive and pick up without the wait.
            </p>

            <form
              onSubmit={submitSearch}
              className="mt-8 flex max-w-xl items-center gap-2 rounded-2xl bg-white p-2 shadow-2xl shadow-black/10"
            >
              <Search className="ml-3 h-5 w-5 shrink-0 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search vendors, food or categories…"
                className="h-12 flex-1 bg-transparent text-base text-slate-800 outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="h-12 shrink-0 rounded-xl bg-brand-500 px-7 text-sm font-bold text-white transition hover:bg-brand-600"
              >
                Search
              </button>
            </form>

            {/* Quick category chips */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-brand-50/80">Popular:</span>
              {quickChips.map((c) => (
                <Link
                  key={c.label}
                  to={`/shops?category=${encodeURIComponent(c.category)}`}
                  className="rounded-full bg-white/15 px-3 py-1 text-sm font-medium text-white backdrop-blur transition hover:bg-white/25"
                >
                  {c.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 -z-0 scale-90 rounded-full bg-white/20 blur-2xl" />
              <img src={HERO_IMG} alt="" className="relative h-96 w-auto object-contain drop-shadow-2xl" />
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-[1400px] flex-1 px-10 py-14">
        {/* Popular categories */}
        <section className="mb-14">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Popular Categories</h2>
              <p className="mt-1 text-slate-500">Pick a craving and explore vendors instantly.</p>
            </div>
            <Link to="/shops" className="text-sm font-semibold text-brand-600 hover:underline">See all</Link>
          </div>
          <div className="grid grid-cols-6 gap-6">
            {CATEGORY_TILES.map((c) => (
              <Link
                key={c.label}
                to={`/shops?category=${encodeURIComponent(c.category)}`}
                className="group flex flex-col items-center justify-center gap-4 rounded-3xl border border-slate-100 bg-white p-7 text-center shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-500/5"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 transition group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white">
                  <c.icon className="h-8 w-8" />
                </div>
                <span className="text-sm font-bold text-slate-700">{c.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Vendors */}
        {isLoading ? (
          <div className="flex justify-center py-24"><Spinner className="h-10 w-10" /></div>
        ) : (
          <>
            {nearby.length > 0 && (
              <DesktopSection title="Nearby Vendors" subtitle="Closest to your current location">
                {nearby.map(({ v, d }) => (
                  <VendorCard key={v._id} v={v} distanceKm={d} />
                ))}
              </DesktopSection>
            )}

            <DemoNotice className="mb-4 w-fit" />

            <DemoBanner placement="home" className="mb-4 w-fit" />

            <DesktopSection title="Featured Vendors" subtitle="Popular places to order from" seeAll>
              {featured.map((v) => (
                <VendorCard key={v._id} v={v} />
              ))}
            </DesktopSection>

            {(!vendors || vendors.length === 0) && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center text-slate-500">
                No vendors yet.
              </div>
            )}
          </>
        )}

        {/* How It Works */}
        <section className="mt-16 overflow-hidden rounded-3xl bg-white p-12 shadow-sm ring-1 ring-slate-100">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">How it works</h2>
            <p className="mt-2 text-slate-500">Three simple steps to skip the queue and grab your food.</p>
          </div>
          <div className="relative mx-auto mt-12 grid max-w-4xl grid-cols-3 gap-10">
            <div className="absolute left-[16%] right-[16%] top-9 border-t-2 border-dashed border-brand-100" />
            {STEPS.map((s, i) => (
              <div key={s.title} className="relative z-10 flex flex-col items-center text-center">
                <div className="relative mb-4 flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-brand-500 text-white shadow-lg shadow-brand-500/20 ring-8 ring-white">
                  <s.icon className="h-8 w-8" />
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-black text-brand-500 shadow ring-1 ring-slate-100">
                    {i + 1}
                  </span>
                </div>
                <div className="text-lg font-bold text-slate-800">{s.title}</div>
                <p className="mt-1 text-sm text-slate-500">{s.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

function DesktopSection({
  title,
  subtitle,
  seeAll,
  children,
}: {
  title: string;
  subtitle?: string;
  seeAll?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-14">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">{title}</h2>
          {subtitle && <p className="mt-1 text-slate-500">{subtitle}</p>}
        </div>
        {seeAll && (
          <Link to="/shops" className="text-sm font-semibold text-brand-600 hover:underline">
            See all shops
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">{children}</div>
    </section>
  );
}
