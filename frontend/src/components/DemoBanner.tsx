import { useQuery } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { api } from "@/lib/api";

export interface PublicSettings {
  maintenanceMode: boolean;
  paymentProvider?: string;
  demoBanner?: { enabled: boolean; message: string; showOnHome: boolean; showOnCheckout: boolean };
}

/** Admin-controlled notice banner. Renders only when enabled for this placement. */
export function DemoBanner({ placement, className = "" }: { placement: "home" | "checkout"; className?: string }) {
  const { data } = useQuery({
    queryKey: ["public-settings"],
    queryFn: () => api<PublicSettings>("/api/public/settings"),
    staleTime: 15000,
  });
  const b = data?.demoBanner;
  if (!b?.enabled || !b.message?.trim()) return null;
  if (placement === "home" && !b.showOnHome) return null;
  if (placement === "checkout" && !b.showOnCheckout) return null;

  return (
    <div
      className={`flex items-center gap-4 rounded-xl border border-orange-230/60 bg-gradient-to-r from-orange-50 via-amber-50/70 to-orange-50/40 px-2 py-1 shadow-[0_1px_3px_rgba(234,88,12,0.08)] ring-1 ring-inset ring-white/40 ${className}`}
      role="status"
    >
      <Info className="h-5 w-5 shrink-0 text-orange-500" />
      <p className="text-[11px] leading-snug text-orange-900/90">{b.message}</p>
    </div>
  );
}
