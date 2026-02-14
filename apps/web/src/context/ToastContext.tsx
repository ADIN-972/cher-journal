import React, { createContext, useState, useCallback } from 'react';
import { Toast, ToastContextType } from '../components/Toast/types';

export const ToastContext = createContext<(ToastContextType & {
  success: (title: string, message?: string, duration?: number) => void;
  error: (title: string, message?: string, duration?: number) => void;
  warning: (title: string, message?: string, duration?: number) => void;
  info: (title: string, message?: string, duration?: number) => void;
  promo: (title: string, message?: string, duration?: number) => void;
}) | undefined>(undefined);

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = generateId();
    const newToast: Toast = { ...toast, id };

    setToasts((prev) => [newToast, ...prev]);

    // Auto-dismiss if duration is specified
    if (toast.duration) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        toast.onClose?.();
      }, toast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  // Note: Default behavior is NO auto-dismiss. Toasts persist until user closes them or clicks an action.
  // Exception: Info toasts ALWAYS have a default duration (3 seconds) to prevent indefinite persistence
  // Pass duration if you want auto-dismiss for simple notifications.
  const success = useCallback((title: string, message?: string, duration?: number) => {
    addToast({ type: 'success', title, message: message || '', duration });
  }, [addToast]);

  const error = useCallback((title: string, message?: string, duration?: number) => {
    addToast({ type: 'error', title, message: message || '', duration });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string, duration?: number) => {
    addToast({ type: 'warning', title, message: message || '', duration });
  }, [addToast]);

  const info = useCallback((title: string, message?: string, duration?: number) => {
    // Info toasts default to 3 seconds if no duration specified
    addToast({ type: 'info', title, message: message || '', duration: duration ?? 3000 });
  }, [addToast]);

  const promo = useCallback((title: string, message?: string, duration?: number) => {
    addToast({ type: 'promo', title, message: message || '', duration });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAll, success, error, warning, info, promo }}>
      {children}
    </ToastContext.Provider>
  );
}
