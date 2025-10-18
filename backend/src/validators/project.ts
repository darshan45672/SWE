import { body, param } from 'express-validator';

// Project creation validation - Context7 pattern with comprehensive validation
export const createProjectValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Project name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage('Project name can only contain letters, numbers, spaces, hyphens, and underscores'),
  
  body('description')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  
  body('workspaceId')
    .trim()
    .isMongoId()
    .withMessage('Invalid workspace ID'),
];

// Get project by ID validation
export const getProjectValidation = [
  param('id')
    .trim()
    .isMongoId()
    .withMessage('Invalid project ID'),
];

// Get projects by workspace validation
export const getProjectsByWorkspaceValidation = [
  param('workspaceId')
    .trim()
    .isMongoId()
    .withMessage('Invalid workspace ID'),
];

// Update project validation
export const updateProjectValidation = [
  param('id')
    .trim()
    .isMongoId()
    .withMessage('Invalid project ID'),
  
  body('name')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Project name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage('Project name can only contain letters, numbers, spaces, hyphens, and underscores'),
  
  body('description')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
];

// Delete project validation
export const deleteProjectValidation = [
  param('id')
    .trim()
    .isMongoId()
    .withMessage('Invalid project ID'),
];
