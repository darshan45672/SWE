"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../controllers/auth");
const middleware_1 = require("../auth/middleware");
const auth_2 = require("../validators/auth");
const profile_1 = require("../validators/profile");
const middleware_2 = require("../validators/middleware");
const router = (0, express_1.Router)();
// Public routes
router.post('/register', auth_2.registerValidation, middleware_2.handleValidationErrors, auth_1.AuthController.register);
router.post('/login', auth_2.loginValidation, middleware_2.handleValidationErrors, auth_1.AuthController.login);
router.post('/logout', auth_1.AuthController.logout);
// Protected routes
router.get('/profile', middleware_1.requireAuth, auth_1.AuthController.getProfile);
router.put('/profile', middleware_1.requireAuth, profile_1.updateProfileValidation, middleware_2.handleValidationErrors, auth_1.AuthController.updateProfile);
router.delete('/account', middleware_1.requireAuth, profile_1.deleteAccountValidation, middleware_2.handleValidationErrors, auth_1.AuthController.deleteAccount);
router.get('/verify', middleware_1.requireAuth, auth_1.AuthController.verifyToken);
exports.default = router;
//# sourceMappingURL=routes.js.map