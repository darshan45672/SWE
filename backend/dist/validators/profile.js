"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAccountValidation = exports.updateProfileValidation = void 0;
const express_validator_1 = require("express-validator");
// Profile update validation - Context7 pattern with comprehensive validation
exports.updateProfileValidation = [
    (0, express_validator_1.body)('name')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('email')
        .optional({ values: 'falsy' })
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    (0, express_validator_1.body)('bio')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 500 })
        .withMessage('Bio must not exceed 500 characters'),
    (0, express_validator_1.body)('phone')
        .optional({ values: 'falsy' })
        .trim()
        .matches(/^[1-9]\d{0,14}$/)
        .withMessage('Please provide a valid phone number (digits only, 1-15 characters)'),
    (0, express_validator_1.body)('location')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 100 })
        .withMessage('Location must not exceed 100 characters'),
    (0, express_validator_1.body)('website')
        .optional({ values: 'falsy' })
        .trim()
        .custom((value) => {
        if (value && value !== '' && !value.match(/^https?:\/\/.+/)) {
            throw new Error('Website must be a valid URL starting with http:// or https://');
        }
        return true;
    }),
    (0, express_validator_1.body)('timezone')
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
    (0, express_validator_1.body)('language')
        .optional({ values: 'falsy' })
        .isIn(['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'])
        .withMessage('Invalid language selection'),
    (0, express_validator_1.body)('company')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 100 })
        .withMessage('Company name must not exceed 100 characters'),
    (0, express_validator_1.body)('jobTitle')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 100 })
        .withMessage('Job title must not exceed 100 characters'),
    (0, express_validator_1.body)('avatar')
        .optional({ values: 'falsy' })
        .trim()
        .isURL()
        .withMessage('Avatar must be a valid URL')
];
// Account deletion confirmation validation
exports.deleteAccountValidation = [
    (0, express_validator_1.body)('confirmationText')
        .equals('DELETE')
        .withMessage('You must type DELETE to confirm account deletion'),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required to delete account')
];
//# sourceMappingURL=profile.js.map