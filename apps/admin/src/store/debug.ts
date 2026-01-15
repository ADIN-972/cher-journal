import { create } from "zustand";

interface DebugState {
  debugMode: boolean;
  toggleDebugMode: () => void;
  setDebugMode: (enabled: boolean) => void;
}

export const useDebugStore = create<DebugState>((set) => ({
  debugMode: localStorage.getItem("debug-mode") === "true",

  toggleDebugMode: () => {
    set((state) => {
      const newValue = !state.debugMode;
      localStorage.setItem("debug-mode", String(newValue));
      return { debugMode: newValue };
    });
  },

  setDebugMode: (enabled: boolean) => {
    localStorage.setItem("debug-mode", String(enabled));
    set({ debugMode: enabled });
  },
}));
