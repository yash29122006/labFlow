import { HttpErrorResponse } from '@angular/common/http';

export function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof HttpErrorResponse) {
    if (error.error) {
      if (typeof error.error === 'string' && error.error.trim().length > 0) {
        return error.error;
      }
      if (typeof error.error === 'object') {
        if (error.error.message && typeof error.error.message === 'string') {
          return error.error.message;
        }
        if (error.error.error && typeof error.error.error === 'string') {
          return error.error.error;
        }
        // Check for Spring validation errors array or map
        if (error.error.errors && Array.isArray(error.error.errors)) {
          const fieldErrors = error.error.errors
            .map((e: any) => e.defaultMessage || e.message)
            .filter(Boolean)
            .join(', ');
          if (fieldErrors) return fieldErrors;
        }
      }
    }

    if (error.status === 400) {
      return fallbackMessage || 'Invalid request data. Please check all fields and try again.';
    }
    if (error.status === 401) {
      return 'Authentication required or session expired. Please sign in again.';
    }
    if (error.status === 403) {
      return 'You do not have permission to perform this action.';
    }
    if (error.status === 404) {
      return 'The requested resource was not found.';
    }
    if (error.status >= 500) {
      return fallbackMessage || 'Server error occurred. Please try again later.';
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}
