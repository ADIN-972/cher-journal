import type { AppError } from '@/types';
import { ErrorCode } from '@/types';

export const handleApiError = (error: any): AppError => {
  // Network error (no response)
  if (!error.response) {
    return {
      code: ErrorCode.NETWORK_ERROR,
      message: error.message || 'Network error',
      userMessage: 'Unable to connect. Please check your internet connection.',
      statusCode: undefined,
    };
  }

  const { status, data } = error.response;
  const errorMessage = data?.message || error.message;

  // 400 - Validation error
  if (status === 400) {
    return {
      code: ErrorCode.VALIDATION_ERROR,
      message: errorMessage,
      userMessage: 'Invalid input. Please check your data.',
      statusCode: status,
      context: data?.details,
    };
  }

  // 401 - Unauthorized
  if (status === 401) {
    return {
      code: ErrorCode.UNAUTHORIZED,
      message: 'Unauthorized',
      userMessage: 'Your session expired. Please log in again.',
      statusCode: status,
    };
  }

  // 403 - Entitlement denied
  if (status === 403 && data?.code === 'ENTITLEMENT_DENIED') {
    return {
      code: ErrorCode.ENTITLEMENT_DENIED,
      message: 'Access denied',
      userMessage: 'You don\'t have access to this content. Please purchase or subscribe.',
      statusCode: status,
    };
  }

  // 404 - Not found
  if (status === 404) {
    return {
      code: ErrorCode.NOT_FOUND,
      message: 'Not found',
      userMessage: 'The resource was not found.',
      statusCode: status,
    };
  }

  // 5xx - Server error
  if (status >= 500) {
    return {
      code: ErrorCode.SERVER_ERROR,
      message: errorMessage,
      userMessage: 'Server error. Please try again later.',
      statusCode: status,
    };
  }

  // Default error
  return {
    code: ErrorCode.SERVER_ERROR,
    message: errorMessage,
    userMessage: 'An error occurred. Please try again.',
    statusCode: status,
  };
};
