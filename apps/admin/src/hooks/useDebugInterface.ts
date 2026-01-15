import { useAuthStore } from "../store/auth";
import { useDebugStore } from "../store/debug";

export const useDebugInterface = () => {
  const user = useAuthStore((state) => state.user);
  const debugMode = useDebugStore((state) => state.debugMode);
  const toggleDebugMode = useDebugStore((state) => state.toggleDebugMode);

  // Only superadmin can use debug mode
  const isSuperAdmin = user?.role === "SUPERADMIN";
  const canDebug = isSuperAdmin && debugMode;

  return {
    canDebug,
    debugMode,
    isSuperAdmin,
    toggleDebugMode,
  };
};
