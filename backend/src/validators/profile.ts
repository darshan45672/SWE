import { body } from 'express-validator';

// Profile update validation - Context7 pattern with comprehensive validation
export const updateProfileValidation = [
  body('name')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .optional({ values: 'falsy' })
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('bio')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters'),
  
  body('phone')
    .optional({ values: 'falsy' })
    .trim()
    .matches(/^[1-9]\d{0,14}$/)
    .withMessage('Please provide a valid phone number (digits only, 1-15 characters)'),
  
  body('location')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location must not exceed 100 characters'),
  
  body('website')
    .optional({ values: 'falsy' })
    .trim()
    .custom((value) => {
      if (value && value !== '' && !value.match(/^https?:\/\/.+/)) {
        throw new Error('Website must be a valid URL starting with http:// or https://');
      }
      return true;
    }),
  
  body('timezone')
    .optional({ values: 'falsy' })
    .isIn([
      'UTC',
      'US/Eastern',
      'US/Central',
      'US/Mountain',
      'US/Pacific',
      'Europe/London',
      'Europe/Paris',
      'Europe/Berlin',
      'Asia/Tokyo',
      'Asia/Shanghai',
      'Asia/Kolkata',
      'Australia/Sydney'
    ])
    .withMessage('Invalid timezone selection'),
  
  body('language')
    .optional({ values: 'falsy' })
    .isIn(['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'])
    .withMessage('Invalid language selection'),
  
  body('company')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company name must not exceed 100 characters'),
  
  body('jobTitle')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Job title must not exceed 100 characters'),

  body('avatar')
    .optional({ values: 'falsy' })
    .trim()
    .isURL()
    .withMessage('Avatar must be a valid URL')
];

// Account deletion confirmation validation
export const deleteAccountValidation = [
  body('confirmationText')
    .equals('DELETE')
    .withMessage('You must type DELETE to confirm account deletion'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required to delete account')
];

// Password update validation - Context7 pattern
export const updatePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .matches(/[^A-Za-z0-9]/)
    .withMessage('Password must contain at least one special character'),
  
  body('newPassword')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    })
];