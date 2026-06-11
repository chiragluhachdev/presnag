import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Clock, MapPin, Plus, Minus, ShoppingBag, ArrowLeft, Trash2, Store } from "lucide-react";
import { api } from "@/lib/api";
import { Vendor, Category, MenuItem } from "@/lib/types";
import { SiteHeader } from "@/components/SiteHeader";
import { Button, Spinner, Badge, Textarea } from "@/components/ui";
import { useCart } from "@/store/cartStore";
import { rupees, cn } from "@/lib/utils";

interface VendorData {
  vendor: Vendor;
  categories: Category[];
  items: MenuItem[];
}

export default function VendorPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [activeCat, setActiveCat] = useState<string>("all");
  const [cartOpen, setCartOpen] = useState(false);

  const cart = useCart();

  const { data, isLoading } = useQuery({
    queryKey: ["vendor", slug],
    queryFn: () => api<VendorData>(`/api/public/vendors/${slug}`),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }
  if (!data) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-slate-500">Vendor not found.</p>
        <Link to="/" className="text-brand-600 underline">Back to home</Link>
      </div>
    );
  }

  const { vendor, categories, items } = data;

  // A closed stall's menu cannot be viewed at all.
  if (!vendor.isOpen) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <SiteHeader />
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
            <Clock className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900">{vendor.name} is currently closed</h1>
            <p className="mt-1 text-sm text-slate-500">
              This stall isn't accepting orders right now. Please check back during its opening hours.
            </p>
            {vendor.openingHours && (
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                <Clock className="h-3.5 w-3.5" /> {vendor.openingHours}
              </p>
            )}
          </div>
          <Link
            to="/shops"
            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600"
          >
            <Store className="h-4 w-4" /> Browse other stalls
          </Link>
        </div>
      </div>
    );
  }

  const visibleItems = items.filter((i) => {
    const matchCat = activeCat === "all" || i.categoryId === activeCat;
    const matchQ = !q || i.name.toLowerCase().includes(q.toLowerCase());
    return matchCat && matchQ;
  });

  const subtotal = cart.subtotal();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 pb-24 lg:pb-0">
      <SiteHeader />

      {/* Hero banner — contained, rounded, bordered, responsive */}
      <div className="mx-auto w-full max-w-[1400px] px-4 pt-4 md:px-10 md:pt-6">
        {/* Back (normal, above the banner) */}
        <Link
          to="/shops"
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 transition hover:text-brand-600"
        >
          <ArrowLeft className="h-4 w-4" /> Back to shops
        </Link>

        <div className="relative h-44 w-full overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-brand-500 to-orange-600 shadow-sm sm:h-56 lg:h-80">
          {vendor.banner && (
            <img src={vendor.banner} alt="" className="h-full w-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10" />

          {/* Overlaid details */}
          <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-5 lg:p-6">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold drop-shadow-md sm:text-3xl lg:text-4xl">{vendor.name}</h1>
              <span
                className={cn(
                  "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold",
                  vendor.isOpen ? "bg-green-500 text-white" : "bg-red-500 text-white"
                )}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                {vendor.isOpen ? "Open" : "Closed"}
              </span>
            </div>
            {vendor.description && (
              <p className="mt-1 line-clamp-2 max-w-2xl text-sm text-white/85 sm:text-base">{vendor.description}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-white/90 sm:text-sm">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> {vendor.prepTime} min prep
              </span>
              {vendor.address && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> {vendor.address}
                </span>
              )}
              {vendor.openingHours && (
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-white/60" /> {vendor.openingHours}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 pt-5 md:px-10 md:pt-7">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:gap-8">
          {/* Menu */}
          <div>
            {!vendor.isOpen && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800 shadow-sm flex items-center gap-2">
                <span className="text-base">🚫</span>
                <span>This store is currently closed. You cannot add items to your cart or place orders.</span>
              </div>
            )}
            {/* Search */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 shadow-sm focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search this menu…"
                className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>

            {/* Category chips */}
            <div className="sticky top-14 z-10 -mx-4 mt-3 flex gap-2 overflow-x-auto bg-slate-50/95 px-4 py-2 backdrop-blur [scrollbar-width:none] md:top-20 [&::-webkit-scrollbar]:hidden">
              <Chip active={activeCat === "all"} onClick={() => setActiveCat("all")}>All</Chip>
              {categories.map((c) => (
                <Chip key={c._id} active={activeCat === c._id} onClick={() => setActiveCat(c._id)}>
                  {c.name}
                </Chip>
              ))}
            </div>

            {/* Items */}
            <div className="mt-3 grid gap-3 xl:grid-cols-2">
              {visibleItems.length === 0 && (
                <p className="col-span-full py-10 text-center text-sm text-slate-400">No items found.</p>
              )}
              {visibleItems.map((item) => {
                const line = cart.lines.find((l) => l.itemId === item._id);
                return (
                  <div
                    key={item._id}
                    className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className={cn(
                          "h-24 w-24 shrink-0 rounded-lg object-cover",
                          !item.isAvailable && "grayscale"
                        )}
                      />
                    )}
                    <div className="flex min-w-0 flex-1 flex-col">
                      <h4 className="font-semibold text-slate-800">{item.name}</h4>
                      <p className="mt-0.5 line-clamp-2 text-xs text-slate-500 sm:text-sm">{item.description}</p>

                      <div className="mt-auto flex items-center justify-between pt-2">
                        <span className="font-bold text-slate-900">{rupees(item.price)}</span>
                        {!item.isAvailable ? (
                          <Badge color="red">Unavailable</Badge>
                        ) : line ? (
                          <div className="flex items-center gap-3 rounded-lg border border-brand-200 bg-brand-50 px-2 py-1">
                            <button onClick={() => cart.setQty(item._id, line.qty - 1)} aria-label="Decrease" disabled={!vendor.isOpen} className="disabled:opacity-50">
                              <Minus className="h-4 w-4 text-brand-700" />
                            </button>
                            <span className="w-5 text-center text-sm font-bold text-brand-700">{line.qty}</span>
                            <button onClick={() => cart.setQty(item._id, line.qty + 1)} aria-label="Increase" disabled={!vendor.isOpen} className="disabled:opacity-50">
                              <Plus className="h-4 w-4 text-brand-700" />
                            </button>
                          </div>
                        ) : (
                          <Button size="sm" variant="subtle" onClick={() => cart.add(vendor.slug, vendor.name, item)} disabled={!vendor.isOpen}>
                            <Plus className="h-4 w-4" /> Add
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cart (desktop) */}
          <div className="hidden lg:block">
            <CartPanel onCheckout={() => navigate("/checkout")} isOpen={vendor.isOpen} />
          </div>
        </div>
      </main>

      {/* Mobile cart bar */}
      {cart.count() > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white p-3 lg:hidden">
          <Button className="w-full" size="lg" onClick={() => setCartOpen(true)}>
            <ShoppingBag className="h-5 w-5" /> View Cart ({cart.count()}) · {rupees(subtotal)}
          </Button>
        </div>
      )}

      {/* Mobile cart drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCartOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-slate-50 p-4">
            <CartPanel onCheckout={() => navigate("/checkout")} isOpen={vendor.isOpen} />
          </div>
        </div>
      )}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold transition",
        active
          ? "border-brand-500 bg-brand-500 text-white shadow-sm"
          : "border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-600"
      )}
    >
      {children}
    </button>
  );
}

function CartPanel({ onCheckout, isOpen }: { onCheckout: () => void; isOpen: boolean }) {
  const cart = useCart();
  const subtotal = cart.subtotal();

  if (cart.lines.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-400">
        <ShoppingBag className="mx-auto mb-2 h-8 w-8" />
        Your cart is empty
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-24">
      <h3 className="mb-3 flex items-center justify-between font-bold text-slate-800">
        Your Order
        <button onClick={cart.clear} disabled={!isOpen} className="text-xs font-medium text-red-500 hover:underline disabled:opacity-50">
          Clear
        </button>
      </h3>
      <div className="space-y-3">
        {cart.lines.map((l) => (
          <div key={l.itemId} className="border-b border-slate-100 pb-3 last:border-0">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-medium">{l.name}</span>
              <span className="shrink-0 text-sm font-semibold">{rupees(l.price * l.qty)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-3 rounded-lg border border-slate-200 px-2 py-1">
                <button onClick={() => cart.setQty(l.itemId, l.qty - 1)} disabled={!isOpen} className="disabled:opacity-50"><Minus className="h-3.5 w-3.5" /></button>
                <span className="w-4 text-center text-sm font-semibold">{l.qty}</span>
                <button onClick={() => cart.setQty(l.itemId, l.qty + 1)} disabled={!isOpen} className="disabled:opacity-50"><Plus className="h-3.5 w-3.5" /></button>
              </div>
              <button onClick={() => cart.remove(l.itemId)} disabled={!isOpen} className="text-slate-400 hover:text-red-500 disabled:opacity-50">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <Textarea
              rows={1}
              placeholder="Special instructions (optional)"
              value={l.instructions}
              onChange={(e) => cart.setInstructions(l.itemId, e.target.value)}
              disabled={!isOpen}
              className="mt-2 text-xs"
            />
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-sm text-slate-500">Subtotal</span>
        <span className="font-bold">{rupees(subtotal)}</span>
      </div>
      <Button className="mt-3 w-full" size="lg" onClick={onCheckout} disabled={!isOpen}>
        {!isOpen ? "Store is Closed" : "Proceed to Checkout"}
      </Button>
    </div>
  );
}
