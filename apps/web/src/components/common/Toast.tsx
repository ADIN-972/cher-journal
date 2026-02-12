import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

export default function Toast({
  message,
  type = 'info',
  duration = 5000,
  onClose
}: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const iconMap = {
    success: 'check_circle',
    error: 'error',
    info: 'info',
    warning: 'warning'
  };

  const colorClasses = {
    success: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300',
    error: 'bg-parchment dark:bg-background-dark/90 border-gold/30 dark:border-gold/20 text-charcoal dark:text-white',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300',
    warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
  };

  const iconColorClasses = {
    success: 'text-emerald-500 dark:text-emerald-400',
    error: 'text-gold/80 dark:text-gold/60',
    info: 'text-blue-500 dark:text-blue-400',
    warning: 'text-amber-500 dark:text-amber-400'
  };

  return (
    <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
      <div className={`${colorClasses[type]} border rounded-lg shadow-2xl backdrop-blur-sm max-w-md overflow-hidden`}>
        <div className="flex items-start gap-3 p-4">
          <span className={`material-symbols-outlined ${iconColorClasses[type]} flex-shrink-0`}>
            {iconMap[type]}
          </span>
          <p className="flex-1 text-sm leading-relaxed">
            {message}
          </p>
          <button
            onClick={onClose}
            className="flex-shrink-0 hover:opacity-70 transition-opacity">
            <span className="material-symbols-outlined text-lg">
              close
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
