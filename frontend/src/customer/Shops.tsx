import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Store, X } from "lucide-react";
import { api } from "@/lib/api";
import { Vendor } from "@/lib/types";
import { PublicFooter } from "@/components/PublicNav";
import { SiteHeader } from "@/components/SiteHeader";
import { VendorCard } from "@/components/VendorCard";
import { Spinner } from "@/components/ui";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "Tea Stall", "Café", "Bakery", "Juice Corner", "Fast Food", "Food Court"];

export default function Shops() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  const category = params.get("category") || "All";

  const setCategory = (c: string) => {
    if (c === "All") params.delete("category");
    else params.set("category", c);
    setParams(params, { replace: true });
  };

  const { data: vendors, isLoading } = useQuery({
    queryKey: ["vendors", q, category],
    queryFn: () =>
      api<Vendor[]>(`/api/public/vendors?q=${encodeURIComponent(q)}&category=${encodeURIComponent(category)}`),
  });

  const sortedVendors = vendors ? [...vendors].sort((a, b) => {
    if (a.isOpen && !b.isOpen) return -1;
    if (!a.isOpen && b.isOpen) return 1;
    return 0;
  }) : [];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />

      {/* Search + filter band */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1400px] px-4 py-4 sm:py-5 md:px-10 md:py-7">
          <h1 className="text-lg font-bold tracking-tight sm:text-2xl md:text-3xl">Browse Shops</h1>
          <p className="text-xs text-slate-500 sm:text-sm md:mt-1 md:text-base">
            Local stalls, cafés, bakeries & food courts near you.
          </p>

          {/* Search */}
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 shadow-sm focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100 md:mt-5 md:max-w-2xl">
            <Search className="h-4 w-4 shrink-0 text-slate-400 md:h-5 md:w-5" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search vendors, food or categories"
              className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400 md:h-12 md:text-base"
            />
            {q && (
              <button onClick={() => setQ("")} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Category chips */}
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] md:mt-4 md:flex-wrap [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition sm:text-sm md:px-5 md:py-2",
                  category === c
                    ? "border-brand-500 bg-brand-500 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-600"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-5 sm:py-6 md:px-10 md:py-8">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner className="h-8 w-8" />
          </div>
        ) : !vendors || vendors.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
            <Store className="h-8 w-8 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">No shops found.</p>
            <p className="text-xs text-slate-400">Try a different search or category.</p>
          </div>
        ) : (
          <>
            <p className="mb-3 text-xs font-medium text-slate-500 md:mb-5 md:text-sm">
              {vendors.length} {vendors.length === 1 ? "shop" : "shops"}
              {category !== "All" && <> in <span className="font-semibold text-slate-700">{category}</span></>}
            </p>

            {/* Mobile — horizontal row cards, stacked (same as Home featured) */}
            <div className="flex flex-col gap-3 md:hidden">
              {sortedVendors.map((v) => (
                <VendorCard key={v._id} v={v} horizontal />
              ))}
            </div>

            {/* Tablet / desktop — banner-top grid (same card as Home desktop) */}
            <div className="hidden gap-6 md:grid md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
              {sortedVendors.map((v) => (
                <VendorCard key={v._id} v={v} />
              ))}
            </div>
          </>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
