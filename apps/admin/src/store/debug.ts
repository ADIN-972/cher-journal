import { create } from "zustand";
import { storage, STORAGE_KEYS } from "../lib/storage";

interface DebugState {
  debugMode: boolean;
  toggleDebugMode: () => void;
  setDebugMode: (enabled: boolean) => void;
}

export const useDebugStore = create<DebugState>((set) => ({
  debugMode: storage.get<boolean>(STORAGE_KEYS.DEBUG_MODE, false),

  toggleDebugMode: () => {
    set((state) => {
      const newValue = !state.debugMode;
      storage.set(STORAGE_KEYS.DEBUG_MODE, newValue);
      return { debugMode: newValue };
    });
  },

  setDebugMode: (enabled: boolean) => {
    storage.set(STORAGE_KEYS.DEBUG_MODE, enabled);
    set({ debugMode: enabled });
  },
}));
