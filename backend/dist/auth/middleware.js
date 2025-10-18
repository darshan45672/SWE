"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.optionalAuth = optionalAuth;
exports.isAuthenticated = isAuthenticated;
const jwt_1 = require("./jwt");
// Middleware that requires authentication
function requireAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        const token = (0, jwt_1.extractTokenFromHeader)(authHeader);
        if (!token) {
            res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication required. Please provide a valid token.',
            });
            return;
        }
        const payload = (0, jwt_1.verifyToken)(token);
        req.user = payload;
        next();
    }
    catch (error) {
        res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid or expired token',
        });
    }
}
// Middleware that allows optional authentication
function optionalAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        const token = (0, jwt_1.extractTokenFromHeader)(authHeader);
        if (token) {
            try {
                const payload = (0, jwt_1.verifyToken)(token);
                req.user = payload;
            }
            catch (error) {
                // Token is invalid but we continue without setting user
                console.warn('Invalid token provided in optional auth:', error);
            }
        }
        next();
    }
    catch (error) {
        // Continue without authentication
        next();
    }
}
// Utility function to check if request is authenticated
function isAuthenticated(req) {
    return !!req.user;
}
//# sourceMappingURL=middleware.js.map