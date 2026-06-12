import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Clock, MapPin, Plus, Minus, ShoppingBag, ArrowLeft, Trash2, SlidersHorizontal } from "lucide-react";
import { api } from "@/lib/api";
import { Vendor, Category, MenuItem, SelectedAddon } from "@/lib/types";
import { SiteHeader } from "@/components/SiteHeader";
import { Button, Spinner, Badge, Textarea } from "@/components/ui";
import { Modal } from "@/components/ui/modal";
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
  const [customizeItem, setCustomizeItem] = useState<MenuItem | null>(null);

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
  const visibleItems = items.filter((i) => {
    const matchCat = activeCat === "all" || i.categoryId === activeCat;
    const matchQ = !q || i.name.toLowerCase().includes(q.toLowerCase());
    return matchCat && matchQ;
  });

  const subtotal = cart.subtotal();

  return (
    <div className="flex min-h-screen w-full max-w-full flex-col overflow-x-hidden bg-slate-50 pb-24 lg:pb-0">
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
            <div className="flex min-w-0 items-center gap-3">
              <h1 className="min-w-0 break-words text-2xl font-extrabold drop-shadow-md sm:text-3xl lg:text-4xl">{vendor.name}</h1>
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

      <main className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col px-4 pt-5 md:px-10 md:pt-7">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px] lg:gap-8">
          {/* Menu */}
          <div className="min-w-0">
            {!vendor.isOpen && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800 shadow-sm flex items-center gap-2">
                <span className="text-base">🚫</span>
                <span>This store is currently closed. You cannot add items to your cart or place orders.</span>
              </div>
            )}
            {/* Search */}
            <div className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 shadow-sm focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search this menu…"
                className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>

            {/* Category chips */}
            <div className="sticky top-14 z-10 mt-3 flex w-full gap-2 overflow-x-auto bg-slate-50/95 py-2 backdrop-blur [scrollbar-width:none] md:top-20 [&::-webkit-scrollbar]:hidden">
              <Chip active={activeCat === "all"} onClick={() => setActiveCat("all")}>All</Chip>
              {categories.map((c) => (
                <Chip key={c._id} active={activeCat === c._id} onClick={() => setActiveCat(c._id)}>
                  {c.name}
                </Chip>
              ))}
            </div>

            {/* Items */}
            <div className="mt-3 flex flex-col gap-3 xl:grid xl:grid-cols-2">
              {visibleItems.length === 0 && (
                <p className="col-span-full py-10 text-center text-sm text-slate-400">No items found.</p>
              )}
              {visibleItems.map((item) => {
                const hasCustom = (item.customizations?.length ?? 0) > 0;
                // For plain items the line key == itemId; for customizable items
                // there can be several variant lines.
                const plainLine = !hasCustom ? cart.lines.find((l) => l.lineKey === item._id) : undefined;
                const qtyInCart = cart.lines.filter((l) => l.itemId === item._id).reduce((s, l) => s + l.qty, 0);
                return (
                  <div
                    key={item._id}
                    onClick={() => setCustomizeItem(item)}
                    className="flex w-full min-w-0 cursor-pointer items-center gap-2.5 overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-sm transition-colors hover:bg-slate-50/50 sm:gap-3 sm:p-3"
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className={cn(
                          "h-16 w-16 shrink-0 rounded-lg object-cover object-center sm:h-[80px] sm:w-[80px]",
                          !item.isAvailable && "grayscale"
                        )}
                      />
                    )}
                    <div className="flex min-w-0 flex-1 flex-col justify-center">
                      <h4 className="truncate text-sm font-bold sm:text-base">{item.name}</h4>
                      {item.description ? (
                        <p className="line-clamp-1 text-[10px] text-slate-500 sm:text-xs">{item.description}</p>
                      ) : null}

                      <div className="mt-1 flex items-center justify-between pb-1 sm:mt-2">
                        <span className="text-sm font-bold text-slate-900 sm:text-base leading-none">{rupees(item.price)}</span>
                        
                        <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                          {!item.isAvailable ? (
                            <Badge color="red">Unavailable</Badge>
                          ) : hasCustom ? (
                            <Button
                              size="sm"
                              variant="subtle"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCustomizeItem(item);
                              }}
                              disabled={!vendor.isOpen}
                              className="h-[28px] w-[64px] shrink-0 rounded-lg text-[11px] font-bold sm:h-8 sm:w-[72px] sm:text-xs"
                            >
                              + Add
                            </Button>
                          ) : plainLine ? (
                            <div
                              className="flex h-[28px] w-[64px] items-center justify-between rounded-lg border border-brand-200 bg-brand-50 px-1.5 sm:h-8 sm:w-[72px] sm:px-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  cart.setQty(item._id, plainLine.qty - 1);
                                }}
                                aria-label="Decrease"
                                disabled={!vendor.isOpen}
                                className="disabled:opacity-50"
                              >
                                <Minus className="h-3 w-3 text-brand-700 sm:h-3.5 sm:w-3.5" />
                              </button>
                              <span className="w-4 text-center text-[11px] font-bold text-brand-700 sm:w-5 sm:text-xs">{plainLine.qty}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  cart.setQty(item._id, plainLine.qty + 1);
                                }}
                                aria-label="Increase"
                                disabled={!vendor.isOpen}
                                className="disabled:opacity-50"
                              >
                                <Plus className="h-3 w-3 text-brand-700 sm:h-3.5 sm:w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="subtle"
                              onClick={(e) => {
                                e.stopPropagation();
                                cart.add(vendor.slug, vendor.name, item);
                              }}
                              disabled={!vendor.isOpen}
                              className="h-[28px] w-[64px] shrink-0 rounded-lg text-[11px] font-bold sm:h-8 sm:w-[72px] sm:text-xs"
                            >
                              + Add
                            </Button>
                          )}
                        </div>
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

      {customizeItem && (
        <CustomizeModal
          item={customizeItem}
          onClose={() => setCustomizeItem(null)}
          onAdd={(addons) => {
            cart.add(vendor.slug, vendor.name, customizeItem, addons);
            setCustomizeItem(null);
          }}
        />
      )}
    </div>
  );
}

function CustomizeModal({
  item, onClose, onAdd,
}: { item: MenuItem; onClose: () => void; onAdd: (addons: SelectedAddon[]) => void }) {
  const groups = (item.customizations || []).filter(g => g.isActive);
  
  const [picks, setPicks] = useState<Record<string, Set<string>>>(() => {
    const init: Record<string, Set<string>> = {};
    groups.forEach((g) => {
      const defaultOpts = g.options.filter(o => o.isDefault && o.isAvailable && !o.isHidden).map(o => o.id);
      if (defaultOpts.length > 0) {
        init[g.id] = new Set(g.type === "single" ? [defaultOpts[0]] : defaultOpts);
      } else if (g.type === "single" && g.options.length > 0) {
        const firstAvailable = g.options.find(o => o.isAvailable && !o.isHidden);
        init[g.id] = new Set(firstAvailable ? [firstAvailable.id] : []);
      } else {
        init[g.id] = new Set();
      }
    });
    return init;
  });

  function toggle(groupId: string, type: "single" | "multi", optionId: string, max?: number) {
    setPicks((p) => {
      const next = { ...p };
      const set = new Set(next[groupId] || []);
      if (type === "single") {
        next[groupId] = new Set([optionId]);
      } else {
        if (set.has(optionId)) {
          set.delete(optionId);
        } else {
          if (max && set.size >= max) return p; 
          set.add(optionId);
        }
        next[groupId] = set;
      }
      return next;
    });
  }

  const visibleGroups = groups.filter(g => {
    if (g.dependency?.groupId && g.dependency?.optionId) {
      return picks[g.dependency.groupId]?.has(g.dependency.optionId);
    }
    return true;
  });

  const addons: SelectedAddon[] = visibleGroups.flatMap((g) =>
    g.options
      .filter((o) => picks[g.id]?.has(o.id) && o.isAvailable && !o.isHidden)
      .map((o) => {
        return { group: g.name, label: o.label, price: o.priceType === "fixed" ? o.price : 0 };
      })
  );

  const total = item.price + addons.reduce((s, a) => s + a.price, 0);

  const missingRequired = visibleGroups.some((g) => {
    const count = picks[g.id]?.size || 0;
    if (g.required && count === 0) return true;
    if (g.minSelections > 0 && count < g.minSelections) return true;
    return false;
  });

  return (
    <Modal
      open
      onClose={onClose}
      title={item.name}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onAdd(addons)} disabled={missingRequired}>
            <Plus className="h-4 w-4" /> Add — {rupees(total)}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {item.description && <p className="text-xs text-slate-500">{item.description}</p>}
        {visibleGroups.map((g) => (
          <div key={g.id}>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-slate-800">{g.name}</h4>
              <span className="text-[10px] font-medium text-slate-400">
                {g.required ? "Required" : g.type === "single" ? "Pick one" : "Optional"}
                {g.type === "multi" && g.maxSelections ? ` (Max ${g.maxSelections})` : ""}
              </span>
            </div>
            {g.description && <p className="text-[11px] text-slate-500 mb-2">{g.description}</p>}
            <div className="space-y-1.5">
              {g.options.filter(o => o.isAvailable && !o.isHidden).map((o) => {
                const checked = picks[g.id]?.has(o.id) ?? false;
                let displayPrice = "";
                if (o.priceType === "fixed" && o.price > 0) displayPrice = `+ ${rupees(o.price)}`;
                if (o.priceType === "free") displayPrice = "Free";

                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => toggle(g.id, g.type, o.id, g.maxSelections)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition",
                      checked ? "border-brand-500 bg-brand-50/40 ring-1 ring-brand-500" : "border-slate-200 hover:border-slate-300"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span className={cn(
                        "flex h-4 w-4 items-center justify-center border shrink-0",
                        g.type === "single" ? "rounded-full" : "rounded",
                        checked ? "border-brand-500 bg-brand-500" : "border-slate-300"
                      )}>
                        {checked && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </span>
                      <span className="flex flex-col">
                        <span>{o.label}</span>
                        {o.description && <span className="text-[10px] text-slate-400">{o.description}</span>}
                      </span>
                    </span>
                    <span className="text-xs font-medium text-slate-500">{displayPrice}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Modal>
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
          <div key={l.lineKey} className="border-b border-slate-100 pb-3 last:border-0">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-medium">{l.name}</span>
              <span className="shrink-0 text-sm font-semibold">{rupees(l.price * l.qty)}</span>
            </div>
            {(l.addons ?? []).length > 0 && (
              <p className="mt-0.5 text-[11px] text-slate-400">{(l.addons ?? []).map((a) => a.label).join(", ")}</p>
            )}
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-3 rounded-lg border border-slate-200 px-2 py-1">
                <button onClick={() => cart.setQty(l.lineKey, l.qty - 1)} disabled={!isOpen} className="disabled:opacity-50"><Minus className="h-3.5 w-3.5" /></button>
                <span className="w-4 text-center text-sm font-semibold">{l.qty}</span>
                <button onClick={() => cart.setQty(l.lineKey, l.qty + 1)} disabled={!isOpen} className="disabled:opacity-50"><Plus className="h-3.5 w-3.5" /></button>
              </div>
              <button onClick={() => cart.remove(l.lineKey)} disabled={!isOpen} className="text-slate-400 hover:text-red-500 disabled:opacity-50">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <Textarea
              rows={1}
              placeholder="Special instructions (optional)"
              value={l.instructions}
              onChange={(e) => cart.setInstructions(l.lineKey, e.target.value)}
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
