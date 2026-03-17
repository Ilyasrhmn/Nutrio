import { ApiException } from '../api-client';

export interface UserFriendlyError {
  message: string;
  errors?: string[];
  statusCode: number;
}

/**
 * Maps technical API errors to user-friendly messages
 */
export function mapApiError(error: any): UserFriendlyError {
  if (error instanceof ApiException) {
    const details = error.details;
    
    // Handle validation errors from our new AllExceptionsFilter
    if (details?.errors && Array.isArray(details.errors)) {
      return {
        message: 'Please check your input:',
        errors: details.errors,
        statusCode: error.statusCode,
      };
    }

    // Handle specific status codes
    switch (error.statusCode) {
      case 401:
        return { message: 'Session expired. Please log in again.', statusCode: 401 };
      case 403:
        return { message: 'You do not have permission to perform this action.', statusCode: 403 };
      case 404:
        return { message: 'The requested resource was not found.', statusCode: 404 };
      case 409:
        return { message: 'This item already exists.', statusCode: 409 };
      case 500:
        return { message: 'A server error occurred. Please try again later.', statusCode: 500 };
    }

    return { message: error.message, statusCode: error.statusCode };
  }

  return {
    message: error.message || 'An unexpected error occurred.',
    statusCode: 0,
  };
}
