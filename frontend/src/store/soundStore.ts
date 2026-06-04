import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SoundState {
  enabled: boolean;
  toggle: () => void;
  setEnabled: (v: boolean) => void;
}

// Vendor new-order sound preference, shared across the dashboard + persisted.
export const useSound = create<SoundState>()(
  persist(
    (set) => ({
      enabled: true,
      toggle: () => set((s) => ({ enabled: !s.enabled })),
      setEnabled: (v) => set({ enabled: v }),
    }),
    { name: "presnag_vendor_sound" }
  )
);
