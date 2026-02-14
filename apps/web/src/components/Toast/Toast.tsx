import React, { useEffect } from 'react';
import { Toast as ToastType } from './types';

interface ToastProps {
  toast: ToastType;
  onRemove: (id: string) => void;
}

export function Toast({ toast, onRemove }: ToastProps) {
  useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(() => {
        onRemove(toast.id);
      }, toast.duration);
      return () => clearTimeout(timer);
    }
    return;
  }, [toast.duration, toast.id, onRemove]);

  const styles = {
    success: {
      border: 'border-l-4 border-amber-400',
      bg: 'bg-gradient-to-r from-amber-50 to-amber-100',
      icon: '✓',
      title: 'text-amber-900',
      message: 'text-amber-800',
    },
    error: {
      border: 'border-l-4 border-pink-400',
      bg: 'bg-gradient-to-r from-pink-50 to-pink-100',
      icon: '✕',
      title: 'text-pink-900',
      message: 'text-pink-800',
    },
    promo: {
      border: 'border-l-4 border-purple-300',
      bg: 'bg-gradient-to-r from-purple-50 to-purple-100',
      icon: '🎁',
      title: 'text-purple-900',
      message: 'text-purple-800',
    },
    warning: {
      border: 'border-l-4 border-amber-500',
      bg: 'bg-gradient-to-r from-amber-50 to-orange-100',
      icon: '⚠',
      title: 'text-amber-900',
      message: 'text-amber-800',
    },
    info: {
      border: 'border-l-4 border-gray-400',
      bg: 'bg-gradient-to-r from-gray-50 to-gray-100',
      icon: 'ⓘ',
      title: 'text-gray-900',
      message: 'text-gray-800',
    },
  };

  const style = styles[toast.type];

  return (
    <div
      className={`
        ${style.border} ${style.bg}
        rounded-lg shadow-lg backdrop-blur-sm
        p-4 max-w-sm w-full
        flex gap-3 items-start
        animate-in fade-in slide-in-from-top-2 duration-300
      `}
    >
      <div className="flex-shrink-0 text-lg font-bold">{style.icon}</div>

      <div className="flex-grow min-w-0">
        <h3 className={`font-semibold text-sm ${style.title}`}>{toast.title}</h3>
        <p className={`text-sm mt-1 ${style.message}`}>{toast.message}</p>

        {toast.actions && toast.actions.length > 0 && (
          <div className="flex gap-2 mt-3">
            {toast.actions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => {
                  action.onClick();
                  onRemove(toast.id);
                }}
                className={`text-xs font-medium px-3 py-1 rounded transition-colors ${
                  action.variant === 'primary'
                    ? 'bg-amber-200 text-amber-900 hover:bg-amber-300'
                    : 'bg-white/50 text-gray-700 hover:bg-white/70'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
}
