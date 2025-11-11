"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteIssueValidation = exports.getIssuesByProjectValidation = exports.getIssueValidation = exports.updateIssueValidation = exports.createIssueValidation = void 0;
const express_validator_1 = require("express-validator");
// Create issue validation - Context7 pattern (Simplified)
exports.createIssueValidation = [
    (0, express_validator_1.body)('title')
        .trim()
        .isLength({ min: 2, max: 200 })
        .withMessage('Issue title must be between 2 and 200 characters'),
    (0, express_validator_1.body)('description')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 5000 })
        .withMessage('Issue description must not exceed 5000 characters'),
    (0, express_validator_1.body)('status')
        .trim()
        .isIn(['TODO', 'IN_PROGRESS', 'DONE'])
        .withMessage('Status must be TODO, IN_PROGRESS, or DONE'),
    (0, express_validator_1.body)('priority')
        .trim()
        .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
        .withMessage('Priority must be LOW, MEDIUM, HIGH, or URGENT'),
    (0, express_validator_1.body)('type')
        .trim()
        .isIn(['BUG', 'FEATURE', 'TASK', 'IMPROVEMENT'])
        .withMessage('Type must be BUG, FEATURE, TASK, or IMPROVEMENT'),
    (0, express_validator_1.body)('projectId')
        .trim()
        .isMongoId()
        .withMessage('Valid project ID is required'),
    (0, express_validator_1.body)('dueDate')
        .optional({ values: 'falsy' })
        .isISO8601()
        .withMessage('Due date must be a valid date'),
    (0, express_validator_1.body)('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array'),
    (0, express_validator_1.body)('tags.*')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Each tag must be between 1 and 50 characters'),
];
// Update issue validation - Context7 pattern (Simplified)
exports.updateIssueValidation = [
    (0, express_validator_1.param)('id')
        .trim()
        .isMongoId()
        .withMessage('Invalid issue ID'),
    (0, express_validator_1.body)('title')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ min: 2, max: 200 })
        .withMessage('Issue title must be between 2 and 200 characters'),
    (0, express_validator_1.body)('description')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 5000 })
        .withMessage('Issue description must not exceed 5000 characters'),
    (0, express_validator_1.body)('status')
        .optional({ values: 'falsy' })
        .trim()
        .isIn(['TODO', 'IN_PROGRESS', 'DONE'])
        .withMessage('Status must be TODO, IN_PROGRESS, or DONE'),
    (0, express_validator_1.body)('priority')
        .optional({ values: 'falsy' })
        .trim()
        .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
        .withMessage('Priority must be LOW, MEDIUM, HIGH, or URGENT'),
    (0, express_validator_1.body)('type')
        .optional({ values: 'falsy' })
        .trim()
        .isIn(['BUG', 'FEATURE', 'TASK', 'IMPROVEMENT'])
        .withMessage('Type must be BUG, FEATURE, TASK, or IMPROVEMENT'),
    (0, express_validator_1.body)('dueDate')
        .optional({ values: 'falsy' })
        .isISO8601()
        .withMessage('Due date must be a valid date'),
    (0, express_validator_1.body)('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array'),
    (0, express_validator_1.body)('tags.*')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Each tag must be between 1 and 50 characters'),
];
// Get issue by ID validation
exports.getIssueValidation = [
    (0, express_validator_1.param)('id')
        .trim()
        .isMongoId()
        .withMessage('Invalid issue ID'),
];
// Get issues by project validation
exports.getIssuesByProjectValidation = [
    (0, express_validator_1.param)('projectId')
        .trim()
        .isMongoId()
        .withMessage('Invalid project ID'),
];
// Delete issue validation
exports.deleteIssueValidation = [
    (0, express_validator_1.param)('id')
        .trim()
        .isMongoId()
        .withMessage('Invalid issue ID'),
];
//# sourceMappingURL=issue.js.map