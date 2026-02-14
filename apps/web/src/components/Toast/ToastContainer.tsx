import React from 'react';
import { useToast } from '../../hooks/useToast';
import { Toast } from './Toast';

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div
      className="
        fixed top-4 right-4 z-50
        flex flex-col gap-3
        pointer-events-none
      "
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onRemove={removeToast} />
        </div>
      ))}
    </div>
  );
}
