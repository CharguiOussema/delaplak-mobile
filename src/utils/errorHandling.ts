import { getApiErrorMessage } from '../services/api';

export const getErrorMessage = (error: unknown, fallback = 'An unexpected error occurred'): string => {
  const message = getApiErrorMessage(error);
  return message || fallback;
};

export const logError = (error: unknown, context?: string): void => {
  if (__DEV__) {
    console.error(context ? `[${context}]` : '[Error]', error);
  }
};
