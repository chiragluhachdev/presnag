import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MenuItem, SelectedAddon } from "@/lib/types";

export interface CartLine {
  lineKey: string;     // unique per (item + chosen add-ons)
  itemId: string;
  name: string;
  price: number;       // per-unit price INCLUDING chosen add-ons
  qty: number;
  image?: string;
  instructions: string;
  addons: SelectedAddon[];
}

// Stable key so the same item with different add-ons becomes a separate line.
function makeLineKey(itemId: string, addons: SelectedAddon[]): string {
  const sig = [...addons]
    .map((a) => `${a.group}:${a.label}`)
    .sort()
    .join("|");
  return sig ? `${itemId}::${sig}` : itemId;
}

interface CartState {
  vendorSlug: string | null;
  vendorName: string | null;
  lines: CartLine[];
  add: (vendorSlug: string, vendorName: string, item: MenuItem, addons?: SelectedAddon[]) => void;
  remove: (lineKey: string) => void;
  setQty: (lineKey: string, qty: number) => void;
  setInstructions: (lineKey: string, instructions: string) => void;
  clear: () => void;
  subtotal: () => number;
  count: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      vendorSlug: null,
      vendorName: null,
      lines: [],
      add: (vendorSlug, vendorName, item, addons = []) =>
        set((state) => {
          // Cart holds one vendor at a time; switching vendors resets it.
          let lines = state.lines;
          if (state.vendorSlug && state.vendorSlug !== vendorSlug) lines = [];
          const lineKey = makeLineKey(item._id, addons);
          const unitPrice = item.price + addons.reduce((s, a) => s + a.price, 0);
          const existing = lines.find((l) => l.lineKey === lineKey);
          if (existing) {
            lines = lines.map((l) => (l.lineKey === lineKey ? { ...l, qty: l.qty + 1 } : l));
          } else {
            lines = [
              ...lines,
              {
                lineKey,
                itemId: item._id,
                name: item.name,
                price: unitPrice,
                qty: 1,
                image: item.image,
                instructions: "",
                addons,
              },
            ];
          }
          return { lines, vendorSlug, vendorName };
        }),
      remove: (lineKey) =>
        set((state) => ({ lines: state.lines.filter((l) => l.lineKey !== lineKey) })),
      setQty: (lineKey, qty) =>
        set((state) => ({
          lines:
            qty <= 0
              ? state.lines.filter((l) => l.lineKey !== lineKey)
              : state.lines.map((l) => (l.lineKey === lineKey ? { ...l, qty } : l)),
        })),
      setInstructions: (lineKey, instructions) =>
        set((state) => ({
          lines: state.lines.map((l) => (l.lineKey === lineKey ? { ...l, instructions } : l)),
        })),
      clear: () => set({ lines: [], vendorSlug: null, vendorName: null }),
      subtotal: () => get().lines.reduce((s, l) => s + l.price * l.qty, 0),
      count: () => get().lines.reduce((s, l) => s + l.qty, 0),
    }),
    {
      name: "presnag_cart",
      version: 1,
      // Normalise carts saved before add-ons existed (no addons / lineKey).
      migrate: (persisted: any) => {
        if (!persisted) return persisted;
        const lines = (persisted.lines || []).map((l: any) => ({
          ...l,
          addons: Array.isArray(l.addons) ? l.addons : [],
          lineKey: l.lineKey || l.itemId,
        }));
        return { ...persisted, lines };
      },
    }
  )
);
