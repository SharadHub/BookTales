const mongoose = require('mongoose');
const multer = require('multer');
const jwt = require('jsonwebtoken');

class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409, 'CONFLICT');
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT');
  }
}

const handleMongoError = (err) => {
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    return new ConflictError(`${field} '${value}' already exists`);
  }

  if (err.name === 'CastError') {
    return new ValidationError(`Invalid ${err.path}: ${err.value}`);
  }

  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    return new ValidationError('Validation failed', details);
  }

  if (err.name === 'DocumentNotFoundError') {
    return new NotFoundError('Document');
  }

  return err;
};

const handleJWTError = (err) => {
  if (err.name === 'JsonWebTokenError') {
    return new AuthenticationError('Invalid token');
  }
  if (err.name === 'TokenExpiredError') {
    return new AuthenticationError('Token expired');
  }
  return err;
};

const handleMulterError = (err) => {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return new ValidationError('File too large', [{ field: 'file', message: 'Maximum file size is 5MB' }]);
      case 'LIMIT_UNEXPECTED_FILE':
        return new ValidationError('Unexpected file field', [{ field: 'file', message: 'Invalid file field name' }]);
      case 'LIMIT_FILE_COUNT':
        return new ValidationError('Only one file allowed', [{ field: 'file', message: 'Only one file allowed' }]);
      default:
        return new ValidationError('File upload failed', [{ field: 'file', message: err.message }]);
    }
  }
  return err;
};

const handleSyntaxError = (err) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return new ValidationError('Invalid JSON format');
  }
  return err;
};

const globalErrorHandler = (err, req, res, next) => {
  let error = err;

  error = handleSyntaxError(error);
  error = handleMongoError(error);
  error = handleJWTError(error);
  error = handleMulterError(error);

  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';
  error.code = error.code || 'INTERNAL_ERROR';

  const response = {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      status: error.statusCode
    }
  };

  if (error.details) {
    response.error.details = error.details;
  }

  if (process.env.NODE_ENV === 'development' && !error.isOperational) {
    response.error.stack = error.stack;
  }

  res.status(error.statusCode).json(response);
};

const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`,
      status: 404
    }
  });
};

const setupUnhandledRejectionHandler = () => {
  process.on('unhandledRejection', (err) => {
    process.exit(1);
  });
};

const setupUncaughtExceptionHandler = () => {
  process.on('uncaughtException', (err) => {
    process.exit(1);
  });
};

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  globalErrorHandler,
  notFoundHandler,
  setupUnhandledRejectionHandler,
  setupUncaughtExceptionHandler
};
