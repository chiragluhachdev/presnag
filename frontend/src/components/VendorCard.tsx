import { Link } from "react-router-dom";
import { Clock, Navigation, ChevronRight, MapPin } from "lucide-react";
import { Vendor } from "@/lib/types";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

function StatusPill({ open }: { open: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
        open ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", open ? "bg-green-500" : "bg-red-400")} />
      {open ? "Open" : "Closed"}
    </span>
  );
}

export function VendorCard({
  v,
  distanceKm,
  horizontal,
}: {
  v: Vendor;
  distanceKm?: number;
  horizontal?: boolean;
}) {
  // Row layout — image on the left, details on the right (used in the featured list).
  if (horizontal) {
    return (
      <Link
        to={`/vendor/${v.slug}`}
        className="group relative flex items-stretch gap-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
      >
        <div className="relative h-[88px] w-[104px] shrink-0 overflow-hidden rounded-xl bg-slate-100">
          {v.banner && (
            <img
              src={v.banner}
              alt={v.name}
              className={cn(
                "h-full w-full object-cover transition duration-300 group-hover:scale-105",
                !v.isOpen && "grayscale"
              )}
            />
          )}
          {!v.isOpen && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="text-[10px] font-bold uppercase tracking-wide text-white">Closed</span>
            </div>
          )}
          {v.logo && (
            <img
              src={v.logo}
              alt=""
              className="absolute bottom-1 left-1 h-7 w-7 rounded-lg border-2 border-white object-cover shadow-sm"
            />
          )}
        </div>

        <div className="flex flex-1 flex-col justify-center gap-1.5 pr-6">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-[15px] font-bold text-slate-800">{v.name}</h3>
            <StatusPill open={v.isOpen} />
          </div>

          <span className="w-fit rounded-md bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-600">
            {v.category}
          </span>

          <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3 text-slate-400" /> {v.prepTime} min
            </span>
            {distanceKm != null && (
              <>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span className="inline-flex items-center gap-1 text-brand-600">
                  <Navigation className="h-3 w-3" /> {distanceKm.toFixed(1)} km away
                </span>
              </>
            )}
          </div>

          {v.address && (
            <span className="flex items-center gap-1 truncate text-[11px] text-slate-400">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{v.address}</span>
            </span>
          )}
        </div>

        <ChevronRight className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-brand-500" />
      </Link>
    );
  }

  // Default — banner on top, details below (used in grids).
  return (
    <Link
      to={`/vendor/${v.slug}`}
      className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative h-24 overflow-hidden bg-slate-100">
        {v.banner && (
          <img src={v.banner} alt={v.name} className="h-full w-full object-cover transition group-hover:scale-105" />
        )}
        <div className="absolute right-1.5 top-1.5">
          <Badge color={v.isOpen ? "green" : "red"}>{v.isOpen ? "Open" : "Closed"}</Badge>
        </div>
        {distanceKm != null && (
          <div className="absolute left-1.5 top-1.5">
            <Badge color="blue">
              <Navigation className="mr-1 h-3 w-3" /> {distanceKm.toFixed(1)} km
            </Badge>
          </div>
        )}
      </div>
      <div className="p-2.5">
        <h3 className="truncate text-sm font-semibold text-slate-800">{v.name}</h3>
        <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-slate-500">
          <Badge color="orange">{v.category}</Badge>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> {v.prepTime} min
          </span>
        </div>
        {v.address && (
          <span className="mt-1 flex items-center gap-1 truncate text-[11px] text-slate-400">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{v.address}</span>
          </span>
        )}
      </div>
    </Link>
  );
}
