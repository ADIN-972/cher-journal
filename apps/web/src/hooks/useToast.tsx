import { useState, useCallback } from 'react';
import Toast, { ToastType } from '../components/common/Toast';

interface ToastConfig {
  message: string;
  type?: ToastType;
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<Array<ToastConfig & { id: number }>>([]);
  const [nextId, setNextId] = useState(0);

  const showToast = useCallback((config: ToastConfig) => {
    const id = nextId;
    setNextId(id + 1);
    setToasts(prev => [...prev, { ...config, id }]);
  }, [nextId]);

  const hideToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const ToastContainer = useCallback(() => (
    <>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => hideToast(toast.id)}
        />
      ))}
    </>
  ), [toasts, hideToast]);

  return {
    showToast,
    ToastContainer
  };
}
