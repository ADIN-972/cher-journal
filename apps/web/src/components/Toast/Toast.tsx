import React, { useEffect, useState } from 'react';
import { Toast as ToastType } from './types';

interface ToastProps {
  toast: ToastType;
  onRemove: (id: string) => void;
}

const IconComponents = {
  success: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  ),
  promo: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  ),
};

const styles = {
  success: {
    border: 'border-l-4 border-eros-gold',
    iconBg: 'bg-eros-gold/20',
    iconColor: 'text-eros-gold',
  },
  error: {
    border: 'border-l-4 border-eros-pink',
    iconBg: 'bg-eros-pink/10',
    iconColor: 'text-eros-pink',
  },
  promo: {
    border: 'border-l-4 border-eros-lavender',
    iconBg: 'bg-eros-lavender/20',
    iconColor: 'text-eros-lavender',
  },
  warning: {
    border: 'border-l-4 border-eros-amber',
    iconBg: 'bg-eros-amber/20',
    iconColor: 'text-eros-amber',
  },
  info: {
    border: 'border-l-4 border-gray-300',
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-500',
  },
};

export function Toast({ toast, onRemove }: ToastProps) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (toast.duration) {
      // Initialize time remaining
      setTimeRemaining(Math.ceil(toast.duration / 1000));

      // Set up the auto-dismiss timer
      const dismissTimer = setTimeout(() => {
        onRemove(toast.id);
      }, toast.duration);

      // Update countdown every 100ms for smooth progress
      const countdownTimer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null) return null;
          const newTime = prev - 0.1;
          return newTime > 0 ? newTime : 0;
        });
      }, 100);

      return () => {
        clearTimeout(dismissTimer);
        clearInterval(countdownTimer);
      };
    }
    return;
  }, [toast.duration, toast.id, onRemove]);

  const style = styles[toast.type];

  // Progress bar animation style - converts duration to animation
  const progressBarStyle = toast.duration ? {
    animation: `shrink-progress ${toast.duration}ms linear forwards`,
  } : undefined;

  // Format time display
  const displayTime = timeRemaining !== null ? Math.ceil(timeRemaining) : null;

  return (
    <div
      className={`
        glass-notification p-5 rounded-lg flex flex-col gap-3
        ${style.border} transform transition-transform hover:-translate-x-2
        w-full max-w-md
      `}
    >
      {/* Main content wrapper */}
      <div className="flex items-start gap-4">
        <div className={`mt-1 w-10 h-10 flex-shrink-0 ${style.iconBg} rounded-full flex items-center justify-center ${style.iconColor}`}>
          {IconComponents[toast.type]}
        </div>

        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold italic text-gray-900 leading-tight">
              {toast.title}
            </h3>
            <button
              type="button"
              onClick={() => onRemove(toast.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              aria-label="Close notification"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </button>
          </div>

          <p className="text-gray-600 text-sm mt-1">{toast.message}</p>

          {toast.actions && toast.actions.length > 0 && (
            <div className="mt-4 flex justify-end space-x-4 items-center">
              {toast.actions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => {
                    action.onClick();
                    onRemove(toast.id);
                  }}
                  className={`text-xs font-bold uppercase tracking-wider transition-all ${
                    action.variant === 'primary'
                      ? getButtonStylePrimary(toast.type)
                      : getButtonStyleSecondary()
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Progress bar for auto-dismiss toasts (shown when no buttons or when duration exists) */}
      {toast.duration && (
        <div className="mt-2 space-y-2">
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${getProgressBarColor(toast.type)}`}
              style={progressBarStyle}
            />
          </div>
          {(!toast.actions || toast.actions.length === 0) && displayTime !== null && (
            <p className="text-xs text-gray-500 text-right font-medium">
              Fermeture dans {displayTime}s
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function getButtonStylePrimary(type: string): string {
  const styles: Record<string, string> = {
    success: 'bg-eros-gold text-white px-5 py-2 rounded hover:opacity-90',
    error: 'bg-eros-pink text-white px-5 py-2 rounded hover:opacity-90 shadow-lg shadow-eros-pink/20',
    promo: 'text-eros-lavender border border-eros-lavender px-5 py-2 rounded hover:bg-eros-lavender hover:text-white',
    warning: 'bg-eros-amber text-white px-5 py-2 rounded hover:opacity-90',
    info: 'text-gray-800 font-bold text-xs underline underline-offset-4 decoration-gray-400 hover:decoration-gray-600',
  };
  return styles[type] || styles.info;
}

function getButtonStyleSecondary(): string {
  return 'text-gray-500 text-[10px] font-bold uppercase tracking-widest hover:text-gray-800 transition-colors';
}

function getProgressBarColor(type: string): string {
  const colors: Record<string, string> = {
    success: 'bg-eros-gold',
    error: 'bg-eros-pink',
    promo: 'bg-eros-lavender',
    warning: 'bg-eros-amber',
    info: 'bg-gray-300',
  };
  return colors[type] || colors.info;
}
