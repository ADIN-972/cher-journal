import { create } from "zustand";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { storage, STORAGE_KEYS } from "../lib/storage";
import type { User } from "@cher-journal/types";

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const authMessages = {
  fr: {
    logoutSuccess: "Déconnexion réussie",
    logoutError: "Erreur lors de la déconnexion",
  },
  en: {
    logoutSuccess: "Logged out successfully",
    logoutError: "Error during logout",
  },
} as const;

const getAuthMessage = (key: keyof typeof authMessages.fr) => {
  const lang = storage.getString(STORAGE_KEYS.LANGUAGE, "fr") as "fr" | "en";
  return authMessages[lang][key];
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  login: async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    set({ user: response.data.user });
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
      set({ user: null });
      toast.success(getAuthMessage("logoutSuccess"));
    } catch (error) {
      toast.error(getAuthMessage("logoutError"));
      throw error;
    }
  },

  checkAuth: async () => {
    try {
      const response = await api.get("/auth/me");
      if (
        response.data.user.role === "ADMIN" ||
        response.data.user.role === "SUPERADMIN"
      ) {
        set({ user: response.data.user, loading: false });
      } else {
        set({ user: null, loading: false });
      }
    } catch (error) {
      set({ user: null, loading: false });
    }
  },
}));
