"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileValidation = exports.resetPasswordValidation = exports.forgotPasswordValidation = exports.loginValidation = exports.registerValidation = void 0;
const express_validator_1 = require("express-validator");
exports.registerValidation = [
    // Basic Information (Required)
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    (0, express_validator_1.body)('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    (0, express_validator_1.body)('confirmPassword')
        .custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password confirmation does not match password');
        }
        return true;
    }),
    (0, express_validator_1.body)('acceptTerms')
        .isBoolean()
        .equals('true')
        .withMessage('You must accept the terms and conditions'),
    // Extended Profile Information (Optional)
    (0, express_validator_1.body)('bio')
        .optional({ values: 'falsy' }) // Context7 pattern: handle empty strings as optional
        .trim()
        .isLength({ max: 500 })
        .withMessage('Bio must be less than 500 characters'),
    (0, express_validator_1.body)('phone')
        .optional({ values: 'falsy' }) // Context7 pattern: handle empty strings as optional
        .trim()
        .matches(/^[\+]?[1-9][\d\s\-\(\)]{0,15}$/)
        .withMessage('Please provide a valid phone number'),
    (0, express_validator_1.body)('location')
        .optional({ values: 'falsy' }) // Context7 pattern: handle empty strings as optional
        .trim()
        .isLength({ max: 100 })
        .withMessage('Location must be less than 100 characters'),
    (0, express_validator_1.body)('website')
        .optional({ values: 'falsy' }) // Context7 pattern: handle empty strings as optional
        .trim()
        .custom((value) => {
        if (!value)
            return true; // Allow empty values
        try {
            new URL(value);
            return true;
        }
        catch {
            throw new Error('Please provide a valid website URL');
        }
    }),
    (0, express_validator_1.body)('company')
        .optional({ values: 'falsy' }) // Context7 pattern: handle empty strings as optional
        .trim()
        .isLength({ max: 100 })
        .withMessage('Company name must be less than 100 characters'),
    (0, express_validator_1.body)('jobTitle')
        .optional({ values: 'falsy' }) // Context7 pattern: handle empty strings as optional
        .trim()
        .isLength({ max: 100 })
        .withMessage('Job title must be less than 100 characters'),
    (0, express_validator_1.body)('timezone')
        .optional({ values: 'falsy' }) // Context7 pattern: handle empty strings as optional
        .trim()
        .isLength({ max: 50 })
        .withMessage('Invalid timezone'),
    (0, express_validator_1.body)('language')
        .optional({ values: 'falsy' }) // Context7 pattern: handle empty strings as optional
        .trim()
        .isLength({ min: 2, max: 5 })
        .withMessage('Invalid language code')
];
exports.loginValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required')
];
exports.forgotPasswordValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address')
];
exports.resetPasswordValidation = [
    (0, express_validator_1.body)('token')
        .notEmpty()
        .withMessage('Reset token is required'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    (0, express_validator_1.body)('confirmPassword')
        .custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password confirmation does not match password');
        }
        return true;
    })
];
exports.updateProfileValidation = [
    (0, express_validator_1.body)('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('bio')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Bio must not exceed 500 characters'),
    (0, express_validator_1.body)('phone')
        .optional()
        .trim()
        .isMobilePhone('any')
        .withMessage('Please provide a valid phone number'),
    (0, express_validator_1.body)('location')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Location must not exceed 100 characters'),
    (0, express_validator_1.body)('website')
        .optional()
        .trim()
        .isURL()
        .withMessage('Please provide a valid website URL'),
    (0, express_validator_1.body)('company')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Company must not exceed 100 characters'),
    (0, express_validator_1.body)('jobTitle')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Job title must not exceed 100 characters')
];
//# sourceMappingURL=auth.js.map