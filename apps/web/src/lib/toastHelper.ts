import { Toast, ToastAction } from '../components/Toast/types';

/**
 * Toast Helper Functions
 * Simplified API for common toast scenarios with pre-configured actions
 */

export interface ToastOptions {
  title: string;
  message: string;
  actions?: ToastAction[];
  duration?: number; // Optional - null/undefined means toast persists until manual close
}

/**
 * Success Toast - Chapter/Volume unlocked or purchase confirmed
 */
export function createSuccessToast(
  title: string,
  message: string,
  primaryAction?: {
    label: string;
    onClick: () => void;
  }
): Omit<Toast, 'id'> {
  const actions: ToastAction[] = [];

  if (primaryAction) {
    actions.push({
      label: primaryAction.label,
      onClick: primaryAction.onClick,
      variant: 'primary',
    });
  }

  return {
    type: 'success',
    title,
    message,
    actions: actions.length > 0 ? actions : undefined,
  };
}

/**
 * Error Toast - Payment failed or validation error
 */
export function createErrorToast(
  title: string,
  message: string,
  retryAction?: () => void,
  skipAction?: () => void
): Omit<Toast, 'id'> {
  const actions: ToastAction[] = [];

  if (skipAction) {
    actions.push({
      label: 'Plus tard',
      onClick: skipAction,
    });
  }

  if (retryAction) {
    actions.push({
      label: 'Réessayer',
      onClick: retryAction,
      variant: 'primary',
    });
  }

  return {
    type: 'error',
    title,
    message,
    actions: actions.length > 0 ? actions : undefined,
  };
}

/**
 * Promo Toast - Special offer or limited bundle
 */
export function createPromoToast(
  title: string,
  message: string,
  discoverAction?: {
    label?: string;
    onClick: () => void;
  }
): Omit<Toast, 'id'> {
  const actions: ToastAction[] = [];

  if (discoverAction) {
    actions.push({
      label: discoverAction.label || 'Découvrir l\'offre',
      onClick: discoverAction.onClick,
      variant: 'primary',
    });
  }

  return {
    type: 'promo',
    title,
    message,
    actions: actions.length > 0 ? actions : undefined,
  };
}

/**
 * Warning Toast - Subscription expiring or urgent action needed
 */
export function createWarningToast(
  title: string,
  message: string,
  primaryAction?: {
    label: string;
    onClick: () => void;
  }
): Omit<Toast, 'id'> {
  const actions: ToastAction[] = [];

  if (primaryAction) {
    actions.push({
      label: primaryAction.label,
      onClick: primaryAction.onClick,
      variant: 'primary',
    });
  }

  return {
    type: 'warning',
    title,
    message,
    actions: actions.length > 0 ? actions : undefined,
  };
}

/**
 * Info Toast - Update notification or general information
 */
export function createInfoToast(
  title: string,
  message: string,
  viewAction?: {
    label: string;
    onClick: () => void;
  }
): Omit<Toast, 'id'> {
  const actions: ToastAction[] = [];

  if (viewAction) {
    actions.push({
      label: viewAction.label,
      onClick: viewAction.onClick,
      variant: 'primary',
    });
  }

  return {
    type: 'info',
    title,
    message,
    actions: actions.length > 0 ? actions : undefined,
  };
}

/**
 * Recommendation Toast - Content discovery suggestion
 */
export function createRecommendationToast(
  title: string,
  message: string,
  discoverAction?: {
    label?: string;
    onClick: () => void;
  }
): Omit<Toast, 'id'> {
  return createPromoToast(title, message, discoverAction);
}

/**
 * Achievement Toast - Unlock badge or milestone
 */
export function createAchievementToast(
  title: string,
  message: string,
  claimAction?: {
    label?: string;
    onClick: () => void;
  }
): Omit<Toast, 'id'> {
  const actions: ToastAction[] = [];

  if (claimAction) {
    actions.push({
      label: claimAction.label || 'Réclamer',
      onClick: claimAction.onClick,
      variant: 'primary',
    });
  }

  return {
    type: 'success',
    title,
    message,
    actions: actions.length > 0 ? actions : undefined,
  };
}

/**
 * Navigation Toast - Navigate to another page
 */
export function createNavigationToast(
  type: 'success' | 'error' | 'info' | 'warning' | 'promo',
  title: string,
  message: string,
  navigateTo?: string,
  buttonLabel?: string
): Omit<Toast, 'id'> {
  const actions: ToastAction[] = [];

  if (navigateTo) {
    actions.push({
      label: buttonLabel || 'Accéder',
      onClick: () => {
        window.location.href = navigateTo;
      },
      variant: 'primary',
    });
  }

  return {
    type,
    title,
    message,
    actions: actions.length > 0 ? actions : undefined,
  };
}

/**
 * Refresh Toast - Offer page refresh option
 */
export function createRefreshToast(
  type: 'success' | 'error' | 'info' | 'warning' | 'promo',
  title: string,
  message: string,
  showRefreshButton?: boolean,
  buttonLabel?: string
): Omit<Toast, 'id'> {
  const actions: ToastAction[] = [];

  if (showRefreshButton) {
    actions.push({
      label: buttonLabel || 'Rafraîchir',
      onClick: () => {
        window.location.reload();
      },
      variant: 'primary',
    });
  }

  return {
    type,
    title,
    message,
    actions: actions.length > 0 ? actions : undefined,
  };
}

/**
 * Simple one-button toast
 */
export function createSimpleToast(
  type: 'success' | 'error' | 'info' | 'warning' | 'promo',
  title: string,
  message: string,
  buttonLabel?: string,
  onButtonClick?: () => void
): Omit<Toast, 'id'> {
  const actions: ToastAction[] = [];

  if (buttonLabel && onButtonClick) {
    actions.push({
      label: buttonLabel,
      onClick: onButtonClick,
      variant: 'primary',
    });
  }

  return {
    type,
    title,
    message,
    actions: actions.length > 0 ? actions : undefined,
  };
}
