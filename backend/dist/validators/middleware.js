"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleValidationErrors = handleValidationErrors;
const express_validator_1 = require("express-validator");
// Context7 pattern: Consistent error response format
function handleValidationErrors(req, res, next) {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => ({
            field: error.type === 'field' ? error.path : 'general',
            message: error.msg
        }));
        // Context7 pattern: Return first error message for better UX
        const firstError = errorMessages[0];
        const userMessage = errorMessages.length === 1
            ? firstError.message
            : `${firstError.message} (and ${errorMessages.length - 1} more error${errorMessages.length > 2 ? 's' : ''})`;
        res.status(400).json({
            success: false,
            message: userMessage,
            errors: errorMessages
        });
        return;
    }
    next();
}
//# sourceMappingURL=middleware.js.map