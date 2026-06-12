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
    <div className={`flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 ${className}`}>
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
      <p className="text-xs leading-snug text-amber-800">{b.message}</p>
    </div>
  );
}
