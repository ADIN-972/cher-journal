import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'timer-complete';

interface ToastAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  actions?: ToastAction[];
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  id,
  type,
  title,
  message,
  actions,
  onClose,
  duration = 5000,
}: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getStyles = () => {
    switch (type) {
      case 'timer-complete':
      case 'success':
        return {
          border: 'border-[#c5a059]/40',
          bg: 'bg-[#f5f1e8]',
          iconBg: 'bg-[#c5a059]/10',
          iconColor: 'text-[#c5a059]',
          icon: type === 'timer-complete' ? 'ink_pen' : 'check_circle',
          textColor: 'text-[#4a1e2c]',
          textSecondary: 'text-[#4a1e2c]/70',
          shadow: 'shadow-[0_10px_30px_rgba(197,160,89,0.15)]',
        };
      case 'error':
        return {
          border: 'border-[#ee2b5b]/40',
          bg: 'bg-[#fde8ed]',
          iconBg: 'bg-[#ee2b5b]/10',
          iconColor: 'text-[#ee2b5b]',
          icon: 'heart_broken',
          textColor: 'text-[#4a1e2c]',
          textSecondary: 'text-[#4a1e2c]/80',
          shadow: 'shadow-[0_10px_30px_rgba(238,43,91,0.1)]',
        };
      case 'info':
      default:
        return {
          border: 'border-[#c5a059]/40',
          bg: 'bg-[#f5f1e8]',
          iconBg: 'bg-[#c5a059]/10',
          iconColor: 'text-[#c5a059]',
          icon: 'info',
          textColor: 'text-[#4a1e2c]',
          textSecondary: 'text-[#4a1e2c]/70',
          shadow: 'shadow-[0_10px_30px_rgba(197,160,89,0.15)]',
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      className={`flex flex-col items-start justify-between gap-4 rounded-lg border ${styles.border} ${styles.bg} p-5 ${styles.shadow} transition-all duration-500 hover:scale-[1.02] min-w-[400px] max-w-[500px] animate-slide-in-right`}
    >
      <div className="flex items-start gap-4 w-full">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${styles.iconBg} ${styles.iconColor}`}
        >
          <span className="material-symbols-outlined">{styles.icon}</span>
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <p className={`${styles.textColor} text-lg font-bold italic leading-tight`}>
            {title}
          </p>
          <p className={`${styles.textSecondary} text-sm font-normal leading-normal`}>
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className={`${styles.textColor}/30 hover:${styles.textColor} transition-colors`}
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>

      {actions && actions.length > 0 && (
        <div className="w-full flex justify-end gap-3">
          {actions.map((action, index) =>
            action.variant === 'secondary' ? (
              <button
                key={index}
                onClick={() => {
                  action.onClick();
                  onClose();
                }}
                className={`${styles.textColor}/60 text-xs font-bold uppercase hover:${styles.textColor} transition-colors`}
              >
                {action.label}
              </button>
            ) : (
              <button
                key={index}
                onClick={() => {
                  action.onClick();
                  onClose();
                }}
                className={`flex items-center justify-center px-4 h-8 ${
                  type === 'error' ? 'bg-[#ee2b5b]' : 'bg-[#c5a059]'
                } text-white text-xs font-bold uppercase tracking-widest rounded-sm hover:opacity-90 transition-opacity shadow-lg ${
                  type === 'error' ? 'shadow-[#ee2b5b]/20' : 'shadow-[#c5a059]/20'
                }`}
              >
                {action.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
