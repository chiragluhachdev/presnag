import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MenuItem } from "@/lib/types";

export interface CartLine {
  itemId: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
  instructions: string;
}

interface CartState {
  vendorSlug: string | null;
  vendorName: string | null;
  lines: CartLine[];
  add: (vendorSlug: string, vendorName: string, item: MenuItem) => void;
  remove: (itemId: string) => void;
  setQty: (itemId: string, qty: number) => void;
  setInstructions: (itemId: string, instructions: string) => void;
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
      add: (vendorSlug, vendorName, item) =>
        set((state) => {
          // Cart holds one vendor at a time; switching vendors resets it.
          let lines = state.lines;
          if (state.vendorSlug && state.vendorSlug !== vendorSlug) lines = [];
          const existing = lines.find((l) => l.itemId === item._id);
          if (existing) {
            lines = lines.map((l) =>
              l.itemId === item._id ? { ...l, qty: l.qty + 1 } : l
            );
          } else {
            lines = [
              ...lines,
              {
                itemId: item._id,
                name: item.name,
                price: item.price,
                qty: 1,
                image: item.image,
                instructions: "",
              },
            ];
          }
          return { lines, vendorSlug, vendorName };
        }),
      remove: (itemId) =>
        set((state) => ({ lines: state.lines.filter((l) => l.itemId !== itemId) })),
      setQty: (itemId, qty) =>
        set((state) => ({
          lines:
            qty <= 0
              ? state.lines.filter((l) => l.itemId !== itemId)
              : state.lines.map((l) => (l.itemId === itemId ? { ...l, qty } : l)),
        })),
      setInstructions: (itemId, instructions) =>
        set((state) => ({
          lines: state.lines.map((l) => (l.itemId === itemId ? { ...l, instructions } : l)),
        })),
      clear: () => set({ lines: [], vendorSlug: null, vendorName: null }),
      subtotal: () => get().lines.reduce((s, l) => s + l.price * l.qty, 0),
      count: () => get().lines.reduce((s, l) => s + l.qty, 0),
    }),
    { name: "presnag_cart" }
  )
);
