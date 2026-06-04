import { create } from "zustand";
import { AuthUser } from "@/lib/types";
import { setToken, getToken } from "@/lib/api";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  setAuth: (user: AuthUser, token: string) => void;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: getToken(),
  setAuth: (user, token) => {
    setToken(token);
    set({ user, token });
  },
  setUser: (user) => set({ user }),
  logout: () => {
    setToken(null);
    set({ user: null, token: null });
  },
}));
