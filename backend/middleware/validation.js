const { body, param, validationResult } = require('express-validator');

// Helper to check validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        status: 400,
        details: errors.array().map(e => ({
          field: e.path,
          message: e.msg
        }))
      }
    });
  }
  next();
};

// Auth validations
const registerValidation = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: parseInt(process.env.PASSWORD_MIN_LENGTH) || 6 })
      .withMessage(`Password must be at least ${process.env.PASSWORD_MIN_LENGTH || 6} characters`)
    .custom((value) => {
      const minLength = parseInt(process.env.PASSWORD_MIN_LENGTH) || 6;
      const requireUppercase = process.env.PASSWORD_REQUIRE_UPPERCASE === 'true';
      const requireLowercase = process.env.PASSWORD_REQUIRE_LOWERCASE === 'true';
      const requireNumbers = process.env.PASSWORD_REQUIRE_NUMBERS === 'true';
      
      if (requireUppercase && !/[A-Z]/.test(value)) {
        throw new Error('Password must contain at least one uppercase letter');
      }
      if (requireLowercase && !/[a-z]/.test(value)) {
        throw new Error('Password must contain at least one lowercase letter');
      }
      if (requireNumbers && !/\d/.test(value)) {
        throw new Error('Password must contain at least one number');
      }
      
      return true;
    }),
  handleValidationErrors
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

// Book validations
const bookValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 200 }).withMessage('Title must be under 200 characters'),
  body('author')
    .trim()
    .notEmpty().withMessage('Author is required')
    .isLength({ max: 100 }).withMessage('Author must be under 100 characters'),
  body('isbn')
    .optional()
    .trim()
    .matches(/^(?=(?:[^0-9]*[0-9]){10}(?:(?:[^0-9]*[0-9]){3})?$)[\d-]+$/).withMessage('Invalid ISBN format'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Category must be under 50 characters'),
  body('genre')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Genre must be under 50 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description must be under 2000 characters'),
  body('publishedYear')
    .optional()
    .isInt({ min: 1000, max: new Date().getFullYear() + 1 }).withMessage('Invalid published year'),
  handleValidationErrors
];

// Review validations
const reviewValidation = [
  body('bookId')
    .notEmpty().withMessage('Book ID is required')
    .isMongoId().withMessage('Invalid book ID format'),
  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('reviewText')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Review must be under 1000 characters'),
  handleValidationErrors
];

const reviewBookIdParamValidation = [
  param('bookId')
    .notEmpty().withMessage('Book ID is required')
    .isMongoId().withMessage('Invalid book ID format'),
  handleValidationErrors
];

// User validations (admin)
const userValidation = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .optional()
    .isLength({ min: parseInt(process.env.PASSWORD_MIN_LENGTH) || 6 })
      .withMessage(`Password must be at least ${process.env.PASSWORD_MIN_LENGTH || 6} characters`)
    .custom((value) => {
      if (!value) return true; // Optional field
      
      const requireUppercase = process.env.PASSWORD_REQUIRE_UPPERCASE === 'true';
      const requireLowercase = process.env.PASSWORD_REQUIRE_LOWERCASE === 'true';
      const requireNumbers = process.env.PASSWORD_REQUIRE_NUMBERS === 'true';
      
      if (requireUppercase && !/[A-Z]/.test(value)) {
        throw new Error('Password must contain at least one uppercase letter');
      }
      if (requireLowercase && !/[a-z]/.test(value)) {
        throw new Error('Password must contain at least one lowercase letter');
      }
      if (requireNumbers && !/\d/.test(value)) {
        throw new Error('Password must contain at least one number');
      }
      
      return true;
    }),
  body('role')
    .optional()
    .isIn(['user', 'admin']).withMessage('Role must be user or admin'),
  handleValidationErrors
];

const userIdParamValidation = [
  param('id')
    .notEmpty().withMessage('User ID is required')
    .isMongoId().withMessage('Invalid user ID format'),
  handleValidationErrors
];

// Book ID param validation
const bookIdParamValidation = [
  param('id')
    .notEmpty().withMessage('Book ID is required')
    .isMongoId().withMessage('Invalid book ID format'),
  handleValidationErrors
];

module.exports = {
  registerValidation,
  loginValidation,
  bookValidation,
  reviewValidation,
  reviewBookIdParamValidation,
  userValidation,
  userIdParamValidation,
  bookIdParamValidation
};
