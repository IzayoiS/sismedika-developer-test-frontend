// stores/auth.ts
import { create } from "zustand";

interface User {
  fullname: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,

  setUser: (user: User) => set({ user }),

  clearUser: () => set({ user: null }),
}));
