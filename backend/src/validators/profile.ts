import { body } from 'express-validator';

// Profile update validation - Context7 pattern
export const updateProfileValidation = [
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
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location must not exceed 100 characters'),
  
  body('website')
    .optional()
    .trim()
    .custom((value) => {
      if (value && !value.match(/^https?:\/\/.+/)) {
        throw new Error('Website must be a valid URL starting with http:// or https://');
      }
      return true;
    }),
  
  body('timezone')
    .optional()
    .isIn([
      'America/New_York',
      'America/Chicago', 
      'America/Denver',
      'America/Los_Angeles',
      'Europe/London',
      'Europe/Paris',
      'Asia/Tokyo',
      'Asia/Shanghai',
      'Australia/Sydney'
    ])
    .withMessage('Invalid timezone'),
  
  body('language')
    .optional()
    .isIn(['en', 'es', 'fr', 'de', 'ja', 'zh'])
    .withMessage('Invalid language'),
  
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

// Account deletion confirmation validation
export const deleteAccountValidation = [
  body('confirmationText')
    .equals('DELETE')
    .withMessage('You must type DELETE to confirm account deletion'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required to delete account')
];