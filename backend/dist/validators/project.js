"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProjectValidation = exports.updateProjectValidation = exports.getProjectsByWorkspaceValidation = exports.getProjectValidation = exports.createProjectValidation = void 0;
const express_validator_1 = require("express-validator");
// Project creation validation - Context7 pattern with comprehensive validation
exports.createProjectValidation = [
    (0, express_validator_1.body)('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Project name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z0-9\s\-_]+$/)
        .withMessage('Project name can only contain letters, numbers, spaces, hyphens, and underscores'),
    (0, express_validator_1.body)('description')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must not exceed 500 characters'),
    (0, express_validator_1.body)('workspaceId')
        .trim()
        .isMongoId()
        .withMessage('Invalid workspace ID'),
];
// Get project by ID validation
exports.getProjectValidation = [
    (0, express_validator_1.param)('id')
        .trim()
        .isMongoId()
        .withMessage('Invalid project ID'),
];
// Get projects by workspace validation
exports.getProjectsByWorkspaceValidation = [
    (0, express_validator_1.param)('workspaceId')
        .trim()
        .isMongoId()
        .withMessage('Invalid workspace ID'),
];
// Update project validation
exports.updateProjectValidation = [
    (0, express_validator_1.param)('id')
        .trim()
        .isMongoId()
        .withMessage('Invalid project ID'),
    (0, express_validator_1.body)('name')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Project name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z0-9\s\-_]+$/)
        .withMessage('Project name can only contain letters, numbers, spaces, hyphens, and underscores'),
    (0, express_validator_1.body)('description')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must not exceed 500 characters'),
];
// Delete project validation
exports.deleteProjectValidation = [
    (0, express_validator_1.param)('id')
        .trim()
        .isMongoId()
        .withMessage('Invalid project ID'),
];
//# sourceMappingURL=project.js.map