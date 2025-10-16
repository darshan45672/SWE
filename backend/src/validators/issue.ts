import { body, param } from 'express-validator';

// Create issue validation - Context7 pattern (Simplified)
export const createIssueValidation = [
  body('title')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Issue title must be between 2 and 200 characters'),
  
  body('description')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Issue description must not exceed 5000 characters'),
  
  body('status')
    .trim()
    .isIn(['TODO', 'IN_PROGRESS', 'DONE'])
    .withMessage('Status must be TODO, IN_PROGRESS, or DONE'),
  
  body('priority')
    .trim()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
    .withMessage('Priority must be LOW, MEDIUM, HIGH, or URGENT'),
  
  body('type')
    .trim()
    .isIn(['BUG', 'FEATURE', 'TASK', 'IMPROVEMENT'])
    .withMessage('Type must be BUG, FEATURE, TASK, or IMPROVEMENT'),
  
  body('projectId')
    .trim()
    .isMongoId()
    .withMessage('Valid project ID is required'),
  
  body('dueDate')
    .optional({ values: 'falsy' })
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters'),
];

// Update issue validation - Context7 pattern (Simplified)
export const updateIssueValidation = [
  param('id')
    .trim()
    .isMongoId()
    .withMessage('Invalid issue ID'),
  
  body('title')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Issue title must be between 2 and 200 characters'),
  
  body('description')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Issue description must not exceed 5000 characters'),
  
  body('status')
    .optional({ values: 'falsy' })
    .trim()
    .isIn(['TODO', 'IN_PROGRESS', 'DONE'])
    .withMessage('Status must be TODO, IN_PROGRESS, or DONE'),
  
  body('priority')
    .optional({ values: 'falsy' })
    .trim()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
    .withMessage('Priority must be LOW, MEDIUM, HIGH, or URGENT'),
  
  body('type')
    .optional({ values: 'falsy' })
    .trim()
    .isIn(['BUG', 'FEATURE', 'TASK', 'IMPROVEMENT'])
    .withMessage('Type must be BUG, FEATURE, TASK, or IMPROVEMENT'),
  
  body('dueDate')
    .optional({ values: 'falsy' })
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters'),
];

// Get issue by ID validation
export const getIssueValidation = [
  param('id')
    .trim()
    .isMongoId()
    .withMessage('Invalid issue ID'),
];

// Get issues by project validation
export const getIssuesByProjectValidation = [
  param('projectId')
    .trim()
    .isMongoId()
    .withMessage('Invalid project ID'),
];

// Delete issue validation
export const deleteIssueValidation = [
  param('id')
    .trim()
    .isMongoId()
    .withMessage('Invalid issue ID'),
];
