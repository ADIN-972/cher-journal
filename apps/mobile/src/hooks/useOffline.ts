import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useSyncStore } from '@stores/syncStore';

export const useOffline = () => {
  const [isOnline, setIsOnline] = useState(true);
  const setOnlineStatus = useSyncStore((state) => state.setOnlineStatus);

  useEffect(() => {
    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = !!(state.isConnected && state.isInternetReachable);
      setIsOnline(online);
      setOnlineStatus(online);
    });

    // Check initial network state
    NetInfo.fetch().then((state) => {
      const online = !!(state.isConnected && state.isInternetReachable);
      setIsOnline(online);
      setOnlineStatus(online);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return isOnline;
};
