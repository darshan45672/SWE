import { body, ValidationChain } from 'express-validator';

export const registerValidation: ValidationChain[] = [
  // Basic Information (Required)
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),

  body('acceptTerms')
    .isBoolean()
    .equals('true')
    .withMessage('You must accept the terms and conditions'),

  // Extended Profile Information (Optional)
  body('bio')
    .optional({ values: 'falsy' }) // Context7 pattern: handle empty strings as optional
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),

  body('phone')
    .optional({ values: 'falsy' }) // Context7 pattern: handle empty strings as optional
    .trim()
    .matches(/^[\+]?[1-9][\d\s\-\(\)]{0,15}$/)
    .withMessage('Please provide a valid phone number'),

  body('location')
    .optional({ values: 'falsy' }) // Context7 pattern: handle empty strings as optional
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location must be less than 100 characters'),

  body('website')
    .optional({ values: 'falsy' }) // Context7 pattern: handle empty strings as optional
    .trim()
    .custom((value) => {
      if (!value) return true; // Allow empty values
      try {
        new URL(value);
        return true;
      } catch {
        throw new Error('Please provide a valid website URL');
      }
    }),

  body('company')
    .optional({ values: 'falsy' }) // Context7 pattern: handle empty strings as optional
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company name must be less than 100 characters'),

  body('jobTitle')
    .optional({ values: 'falsy' }) // Context7 pattern: handle empty strings as optional
    .trim()
    .isLength({ max: 100 })
    .withMessage('Job title must be less than 100 characters'),

  body('timezone')
    .optional({ values: 'falsy' }) // Context7 pattern: handle empty strings as optional
    .trim()
    .isLength({ max: 50 })
    .withMessage('Invalid timezone'),

  body('language')
    .optional({ values: 'falsy' }) // Context7 pattern: handle empty strings as optional
    .trim()
    .isLength({ min: 2, max: 5 })
    .withMessage('Invalid language code')
];

export const loginValidation: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export const forgotPasswordValidation: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
];

export const resetPasswordValidation: ValidationChain[] = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    })
];

export const updateProfileValidation: ValidationChain[] = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters'),
  
  body('phone')
    .optional()
    .trim()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location must not exceed 100 characters'),
  
  body('website')
    .optional()
    .trim()
    .isURL()
    .withMessage('Please provide a valid website URL'),
  
  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company must not exceed 100 characters'),
  
  body('jobTitle')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Job title must not exceed 100 characters')
];