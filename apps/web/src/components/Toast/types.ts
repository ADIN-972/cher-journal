export type ToastType = 'success' | 'error' | 'promo' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
}

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  actions?: ToastAction[];
  duration?: number; // ms, null = persist
  onClose?: () => void;
}

export interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string; // Returns toast ID
  removeToast: (id: string) => void;
  clearAll: () => void;
}
