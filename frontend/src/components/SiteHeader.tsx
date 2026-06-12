import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, Loader2, Receipt } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button, Label } from "@/components/ui";

/**
 * Shared site header — matches the Home screen header exactly.
 * Compact on mobile (logo + location icon); on md+ it mirrors Home's desktop
 * header: large logo, Browse Vendors, Track Order and a solid location button.
 */
export function SiteHeader() {
  const navigate = useNavigate();
  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [locStatus, setLocStatus] = useState<"idle" | "loading" | "denied">("idle");
  const [trackOpen, setTrackOpen] = useState(false);

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

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center justify-between px-4 md:h-20 md:px-10">
        <Link to="/" className="flex min-w-0 items-center gap-1.5 md:gap-3">
          <img src="/PreSnaglogo.png" alt="PreSnag" className="h-9 w-9 shrink-0 object-contain md:h-12 md:w-12" />
          <div className="leading-none min-w-0">
            <div className="text-lg font-black tracking-tight md:text-3xl">
              <span className="text-slate-900">Pre</span><span className="text-brand-500">Snag</span>
            </div>
            <div className="mt-0.5 text-[8px] font-semibold uppercase tracking-[0.18em] text-slate-500 md:mt-1 md:text-[10px] md:tracking-[0.22em]">
              Order Ahead. Skip The Queue.
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-3 md:gap-6">
          <Link to="/shops" className="hidden text-sm font-semibold text-slate-600 transition hover:text-brand-600 md:block">
            Browse Vendors
          </Link>
          <button
            onClick={() => setTrackOpen(true)}
            className="hidden items-center gap-1.5 text-sm font-semibold text-slate-600 transition hover:text-brand-600 md:inline-flex"
          >
            <Receipt className="h-4 w-4" /> Track Order
          </button>

          {/* Mobile — icon only */}
          <button
            onClick={useMyLocation}
            disabled={locStatus === "loading"}
            aria-label="Use my location"
            title={loc ? "Location on" : "Use my location"}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition disabled:opacity-60 md:hidden ${
              loc ? "bg-brand-50 text-brand-600" : "text-brand-600 hover:bg-brand-50"
            }`}
          >
            {locStatus === "loading" ? <Loader2 className="h-5 w-5 animate-spin" /> : <MapPin className="h-5 w-5" />}
          </button>

          {/* Desktop — solid pill (matches Home) */}
          <button
            onClick={useMyLocation}
            disabled={locStatus === "loading"}
            className={`hidden items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:opacity-60 md:inline-flex ${
              loc ? "bg-brand-50 text-brand-600" : "bg-brand-500 text-white shadow-sm shadow-brand-500/20 hover:bg-brand-600"
            }`}
          >
            {locStatus === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
            {loc ? "Location On" : "Use My Location"}
          </button>
        </div>
      </div>
    </header>

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
          <Button onClick={() => go()}><Receipt className="h-4 w-4" /> Track Order</Button>
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
        <p className="text-xs text-slate-400">You'll find your order number on the confirmation screen.</p>
      </form>
    </Modal>
  );
}
