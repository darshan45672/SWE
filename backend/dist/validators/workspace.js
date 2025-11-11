"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteWorkspaceValidation = exports.updateWorkspaceValidation = exports.getWorkspaceValidation = exports.createWorkspaceValidation = void 0;
const express_validator_1 = require("express-validator");
// Workspace creation validation - Context7 pattern with comprehensive validation
exports.createWorkspaceValidation = [
    (0, express_validator_1.body)('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Workspace name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z0-9\s\-_]+$/)
        .withMessage('Workspace name can only contain letters, numbers, spaces, hyphens, and underscores'),
    (0, express_validator_1.body)('description')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must not exceed 500 characters'),
    (0, express_validator_1.body)('icon')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 10 })
        .withMessage('Icon must not exceed 10 characters'),
    (0, express_validator_1.body)('color')
        .optional({ values: 'falsy' })
        .trim()
        .custom((value) => {
        // Allow empty string or valid hex color or Tailwind color class
        if (!value || value === '')
            return true;
        // Check for hex color
        if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value))
            return true;
        // Check for Tailwind color class
        return /^(bg|text|border)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)$/.test(value);
    })
        .withMessage('Color must be a valid hex color (#RRGGBB) or Tailwind CSS color class'),
];
// Get workspace by ID validation
exports.getWorkspaceValidation = [
    (0, express_validator_1.param)('id')
        .trim()
        .isMongoId()
        .withMessage('Invalid workspace ID'),
];
// Update workspace validation
exports.updateWorkspaceValidation = [
    (0, express_validator_1.param)('id')
        .trim()
        .isMongoId()
        .withMessage('Invalid workspace ID'),
    (0, express_validator_1.body)('name')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Workspace name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z0-9\s\-_]+$/)
        .withMessage('Workspace name can only contain letters, numbers, spaces, hyphens, and underscores'),
    (0, express_validator_1.body)('description')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must not exceed 500 characters'),
    (0, express_validator_1.body)('icon')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 10 })
        .withMessage('Icon must not exceed 10 characters'),
    (0, express_validator_1.body)('color')
        .optional({ values: 'falsy' })
        .trim()
        .custom((value) => {
        if (!value || value === '')
            return true;
        if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value))
            return true;
        return /^(bg|text|border)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)$/.test(value);
    })
        .withMessage('Color must be a valid hex color (#RRGGBB) or Tailwind CSS color class'),
];
// Delete workspace validation
exports.deleteWorkspaceValidation = [
    (0, express_validator_1.param)('id')
        .trim()
        .isMongoId()
        .withMessage('Invalid workspace ID'),
];
//# sourceMappingURL=workspace.js.map