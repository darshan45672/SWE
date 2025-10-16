import { body, param } from 'express-validator';

// Workspace creation validation - Context7 pattern with comprehensive validation
export const createWorkspaceValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Workspace name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage('Workspace name can only contain letters, numbers, spaces, hyphens, and underscores'),
  
  body('icon')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 10 })
    .withMessage('Icon must not exceed 10 characters'),
  
  body('color')
    .optional({ values: 'falsy' })
    .trim()
    .custom((value) => {
      // Allow empty string or valid Tailwind color class
      if (!value || value === '') return true;
      return /^(bg|text|border)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)$/.test(value);
    })
    .withMessage('Color must be a valid Tailwind CSS color class'),
];

// Get workspace by ID validation
export const getWorkspaceValidation = [
  param('id')
    .trim()
    .isMongoId()
    .withMessage('Invalid workspace ID'),
];

// Update workspace validation
export const updateWorkspaceValidation = [
  param('id')
    .trim()
    .isMongoId()
    .withMessage('Invalid workspace ID'),
  
  body('name')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Workspace name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage('Workspace name can only contain letters, numbers, spaces, hyphens, and underscores'),
  
  body('icon')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 10 })
    .withMessage('Icon must not exceed 10 characters'),
  
  body('color')
    .optional({ values: 'falsy' })
    .trim()
    .matches(/^(bg|text|border)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)$/)
    .withMessage('Color must be a valid Tailwind CSS color class'),
];

// Delete workspace validation
export const deleteWorkspaceValidation = [
  param('id')
    .trim()
    .isMongoId()
    .withMessage('Invalid workspace ID'),
];
