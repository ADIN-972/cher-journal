import { useState, useEffect, useRef } from 'react';
import { NotificationService } from '../lib/notifications';

interface WaitTimerProps {
  remainingMs: number;
  onComplete?: () => void;
  variant?: 'inline' | 'badge' | 'large';
  chapterTitle?: string;
  volumeNumber?: number;
}

export default function WaitTimer({
  remainingMs,
  onComplete,
  variant = 'inline',
  chapterTitle,
  volumeNumber,
}: WaitTimerProps) {
  const [currentRemainingMs, setCurrentRemainingMs] = useState(remainingMs);
  const notificationSentRef = useRef(false);

  // Update internal state when prop changes
  useEffect(() => {
    setCurrentRemainingMs(remainingMs);
    // Reset notification flag when remainingMs changes
    if (remainingMs > 0) {
      notificationSentRef.current = false;
    }
  }, [remainingMs]);

  // Countdown timer that updates every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRemainingMs((prev) => {
        if (prev <= 0) {
          clearInterval(interval);

          // Send notification on completion (only once)
          if (!notificationSentRef.current && chapterTitle && volumeNumber) {
            NotificationService.showTimerComplete(chapterTitle, volumeNumber);
            notificationSentRef.current = true;
          }

          if (onComplete) onComplete();
          return 0;
        }
        const newTime = prev - 1000;
        if (newTime <= 0) {
          clearInterval(interval);

          // Send notification on completion (only once)
          if (!notificationSentRef.current && chapterTitle && volumeNumber) {
            NotificationService.showTimerComplete(chapterTitle, volumeNumber);
            notificationSentRef.current = true;
          }

          if (onComplete) onComplete();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onComplete, chapterTitle, volumeNumber]);
  const formatTime = (ms: number): string => {
    if (ms <= 0) {
      if (onComplete) onComplete();
      return 'Disponible maintenant !';
    }

    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}j ${remainingHours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, '0')}min`;
    } else if (minutes > 0) {
      return `${minutes}min ${seconds.toString().padStart(2, '0')}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getProgressPercentage = (ms: number): number => {
    // Assuming max wait is 24h = 86400000ms
    const maxWait = 24 * 60 * 60 * 1000;
    return Math.max(0, Math.min(100, ((maxWait - ms) / maxWait) * 100));
  };

  const isComplete = currentRemainingMs <= 0;
  const percentage = getProgressPercentage(currentRemainingMs);

  if (variant === 'badge') {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
          isComplete
            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
        }`}>
        <span className="material-symbols-outlined text-base">
          {isComplete ? 'check_circle' : 'schedule'}
        </span>
        <span>{formatTime(currentRemainingMs)}</span>
      </div>
    );
  }

  if (variant === 'large') {
    return (
      <div className="bg-gradient-to-br from-parchment via-parchment to-parchment/80 dark:from-background-dark/60 dark:via-background-dark/60 dark:to-background-dark/40 border border-gold/20 dark:border-gold/10 rounded-2xl p-8 backdrop-blur-sm">
        <div className="text-center">
          <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/10 dark:bg-gold/5">
            <span className="material-symbols-outlined text-4xl text-gold/80 dark:text-gold/60">
              {isComplete ? 'check_circle' : 'schedule'}
            </span>
          </div>
          <h3 className="text-2xl font-serif font-bold text-charcoal dark:text-white mb-2">
            {isComplete ? 'Volume disponible !' : 'Temps restant'}
          </h3>
          <p className="text-4xl font-bold text-gold dark:text-gold-light mb-6">
            {formatTime(currentRemainingMs)}
          </p>
          {!isComplete && (
            <div className="w-full bg-gold/10 dark:bg-gold/5 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-gold-dark to-gold transition-all duration-1000 ease-out"
                style={{ width: `${percentage}%` }}
              />
            </div>
          )}
          {isComplete && (
            <p className="text-sm text-charcoal/60 dark:text-white/60 mt-4">
              Vous pouvez maintenant lire ce volume gratuitement
            </p>
          )}
        </div>
      </div>
    );
  }

  // inline variant (default)
  return (
    <div
      className={`flex items-center gap-2 ${
        isComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
      }`}>
      <span className="material-symbols-outlined text-base">
        {isComplete ? 'check_circle' : 'schedule'}
      </span>
      <span className="text-sm font-medium">{formatTime(currentRemainingMs)}</span>
    </div>
  );
}
