import { useState, useEffect } from 'react';
import { api } from '../api';

interface WaitStatus {
  isActive: boolean;
  unlocksAt?: Date;
  remainingMs?: number;
}

interface StartWaitResult {
  unlocksAt: Date;
  remainingMs: number;
}

export function useWaitToRead(chapterId: string, volumeNumber: number) {
  const [waitStatus, setWaitStatus] = useState<WaitStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(0);

  // Fetch wait status on mount
  useEffect(() => {
    fetchWaitStatus();
  }, [chapterId, volumeNumber]);

  // Update countdown timer
  useEffect(() => {
    if (!waitStatus?.isActive || !waitStatus.remainingMs) return;

    setRemainingTime(waitStatus.remainingMs);

    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        const newTime = prev - 1000;
        if (newTime <= 0) {
          clearInterval(interval);
          // Refresh wait status when timer completes
          fetchWaitStatus();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [waitStatus]);

  const fetchWaitStatus = async () => {
    try {
      const response = await api.get<{ success: boolean; data: WaitStatus }>(
        `/wait/status?chapterId=${chapterId}&volumeNumber=${volumeNumber}`
      );
      setWaitStatus(response.data.data);
    } catch (err: any) {
      console.error('Failed to fetch wait status:', err);
    }
  };

  const startWait = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post<{ success: boolean; data: StartWaitResult }>(
        '/wait/start',
        {
          chapterId,
          volumeNumber,
        }
      );

      const result = response.data.data;
      setWaitStatus({
        isActive: true,
        unlocksAt: new Date(result.unlocksAt),
        remainingMs: result.remainingMs,
      });

      return result;
    } catch (err: any) {
      const errorCode = err.response?.data?.error?.code;
      const errorMessage = err.response?.data?.error?.message;

      switch (errorCode) {
        case 'WAIT_ALREADY_ACTIVE':
          setError('Un timer est déjà actif pour ce chapitre');
          break;
        case 'MAX_PENDING_CHAPTERS_REACHED':
          setError('Vous avez atteint le maximum de chapitres en attente simultanément');
          break;
        case 'VOLUME_IS_FREE':
          setError('Ce volume est gratuit, pas besoin d\'attendre');
          break;
        case 'REQUIRES_UPGRADE':
          setError('Ce volume nécessite un achat');
          break;
        default:
          setError(errorMessage || 'Erreur lors du démarrage du timer');
      }

      throw err;
    } finally {
      setLoading(false);
    }
  };

  const formatTimeRemaining = (ms: number): string => {
    if (ms <= 0) return 'Disponible maintenant';

    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    } else if (minutes > 0) {
      return `${minutes}min ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return {
    waitStatus,
    loading,
    error,
    remainingTime,
    startWait,
    fetchWaitStatus,
    formatTimeRemaining,
    isWaitActive: waitStatus?.isActive || false,
    canRead: waitStatus?.isActive && remainingTime <= 0,
  };
}
