/**
 * Helper functions to integrate messages.ts with useToast hook
 * Provides convenient methods to show toasts with pre-defined messages
 */

import { getMessage, getErrorMessage, extractErrorCode, MessageType } from './messages';

export interface ToastContext {
  success: (title: string, message?: string, duration?: number) => void;
  error: (title: string, message?: string, duration?: number) => void;
  warning: (title: string, message?: string, duration?: number) => void;
  info: (title: string, message?: string, duration?: number) => void;
  promo: (title: string, message?: string, duration?: number) => void;
}

/**
 * Show an error toast from a code or error object
 * @param toast - Toast context from useToast hook
 * @param errorCodeOrError - Error code string, error object, or error message
 * @example
 * showErrorToast(toast, 'CHAPTER_NOT_FOUND');
 * showErrorToast(toast, error);
 * showErrorToast(toast, 'Chapitre introuvable');
 */
export function showErrorToast(toast: ToastContext, errorCodeOrError: any): void {
  const { title, description } = getErrorMessage(errorCodeOrError);
  toast.error(title, description, 5000);
}

/**
 * Show a success toast from a code
 * @param toast - Toast context from useToast hook
 * @param code - Success message code
 * @example
 * showSuccessToast(toast, 'PURCHASE_SUCCESSFUL');
 */
export function showSuccessToast(toast: ToastContext, code: string): void {
  const message = getMessage(code);
  if (message.type === MessageType.SUCCESS) {
    toast.success(message.title, message.description, 4000);
  }
}

/**
 * Show an info toast from a code
 * @param toast - Toast context from useToast hook
 * @param code - Info message code
 * @example
 * showInfoToast(toast, 'WAIT_COMPLETED');
 */
export function showInfoToast(toast: ToastContext, code: string): void {
  const message = getMessage(code);
  if (message.type === MessageType.INFO) {
    toast.info(message.title, message.description, 3000);
  }
}

/**
 * Show a warning toast from a code
 * @param toast - Toast context from useToast hook
 * @param code - Warning message code
 * @example
 * showWarningToast(toast, 'LIMITED_TIME_OFFER');
 */
export function showWarningToast(toast: ToastContext, code: string): void {
  const message = getMessage(code);
  if (message.type === MessageType.WARNING) {
    toast.warning(message.title, message.description, 4000);
  }
}

/**
 * Show a promo toast from a code
 * @param toast - Toast context from useToast hook
 * @param code - Promo message code
 * @example
 * showPromoToast(toast, 'EXCLUSIVE_BUNDLE');
 * showPromoToast(toast, 'PERSONALIZED_RECOMMENDATION');
 */
export function showPromoToast(toast: ToastContext, code: string): void {
  const message = getMessage(code);
  toast.promo(message.title, message.description, 6000);
}

/**
 * Handle an error and show appropriate toast
 * Useful for catch blocks
 * @param toast - Toast context from useToast hook
 * @param error - Error object or message
 * @example
 * try {
 *   await api.getChapter(id);
 * } catch (error) {
 *   handleErrorToast(toast, error);
 * }
 */
export function handleErrorToast(toast: ToastContext, error: any): void {
  showErrorToast(toast, error);
}

/**
 * Show multiple toasts sequentially
 * Useful for displaying operation results with multiple messages
 * @param toast - Toast context from useToast hook
 * @param messages - Array of { code, type } objects
 * @example
 * showMultipleToasts(toast, [
 *   { code: 'PURCHASE_SUCCESSFUL', type: 'success' },
 *   { code: 'LIMITED_TIME_OFFER', type: 'warning' }
 * ]);
 */
export function showMultipleToasts(
  toast: ToastContext,
  messages: Array<{ code: string; type: keyof Omit<ToastContext, never> }>,
  delayBetween: number = 500
): void {
  messages.forEach((msg, index) => {
    setTimeout(() => {
      const toastMethod = toast[msg.type];
      const message = getMessage(msg.code);
      toastMethod(message.title, message.description);
    }, index * delayBetween);
  });
}
