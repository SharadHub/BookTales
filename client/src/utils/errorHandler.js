import React from 'react';

export class AppError extends Error {
  constructor(message, code = 'APP_ERROR', statusCode = 500) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class NetworkError extends AppError {
  constructor(message = 'Network error occurred') {
    super(message, 'NETWORK_ERROR', 0);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends AppError {
  constructor(message, field = null) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
    this.field = field;
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 'AUTHORIZATION_ERROR', 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export const handleError = (error, context = 'unknown') => {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return data?.message || 'Invalid request data';
      case 401:
        return 'Please login to continue';
      case 403:
        return 'You do not have permission to perform this action';
      case 404:
        return 'The requested resource was not found';
      case 429:
        return 'Too many requests. Please try again later';
      case 500:
        return 'Server error. Please try again later';
      default:
        return data?.message || `Request failed with status ${status}`;
    }
  }

  if (error.request) {
    if (navigator.onLine) {
      return 'Unable to connect to the server. Please try again.';
    } else {
      return 'You are offline. Please check your internet connection.';
    }
  }

  return error.message || 'An unexpected error occurred';
};

export const withErrorHandling = async (asyncFn, context = 'operation') => {
  try {
    return await asyncFn();
  } catch (error) {
    const errorMessage = handleError(error, context);
    throw new AppError(errorMessage, error.code || 'ASYNC_ERROR');
  }
};

export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);

  const clearError = () => setError(null);

  const captureError = (error, context = 'unknown') => {
    const errorMessage = handleError(error, context);
    setError(errorMessage);
  };

  React.useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  return {
    error,
    setError,
    clearError,
    captureError
  };
};

export const withRetry = async (fn, maxRetries = 3, delay = 1000) => {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
        throw error;
      }

      if (i === maxRetries - 1) {
        throw error;
      }

      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }

  throw lastError;
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};
