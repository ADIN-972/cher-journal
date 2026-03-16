export enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  ENTITLEMENT_DENIED = 'ENTITLEMENT_DENIED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  OFFLINE = 'OFFLINE',
  NOT_FOUND = 'NOT_FOUND',
}

export interface AppError {
  code: ErrorCode;
  message: string;
  userMessage: string;
  context?: any;
  statusCode?: number;
}
