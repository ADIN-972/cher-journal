import { useEffect } from 'react';
import * as NetInfo from '@react-native-community/netinfo';
import { useSyncStore } from '@/stores/syncStore';

/**
 * Monitor network state and auto-sync when online
 */
export const useOnlineSync = (): boolean => {
  const { setOnlineStatus, onlineStatus } = useSyncStore();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isConnected = state.isConnected === true;
      setOnlineStatus(isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, [setOnlineStatus]);

  return onlineStatus;
};
