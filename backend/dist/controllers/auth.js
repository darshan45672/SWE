"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_1 = require("../services/auth");
const jwt_1 = require("../auth/jwt");
const email_1 = require("../services/email");
const verification_1 = require("./verification");
const prisma_1 = __importDefault(require("../lib/prisma"));
class AuthController {
    static async register(req, res) {
        try {
            console.log('🎯 Context7 Controller Debug - Raw request body received:', {
                ...req.body,
                password: '*** HIDDEN ***',
                confirmPassword: '*** HIDDEN ***'
            });
            const registerData = req.body;
            const result = await auth_1.AuthService.register(registerData);
            if (result.success && result.token && result.user) {
                // Generate verification token
                const verificationToken = (0, verification_1.generateVerificationToken)();
                const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
                // Update user with verification token
                await prisma_1.default.user.update({
                    where: { id: result.user.id },
                    data: {
                        verificationToken,
                        verificationTokenExpiry,
                    },
                });
                // Send verification email (async, don't wait)
                (0, email_1.sendVerificationEmail)(result.user.email, result.user.name, verificationToken)
                    .then(() => {
                    console.log('✅ Verification email sent to:', result.user.email);
                })
                    .catch((error) => {
                    console.error('❌ Failed to send verification email:', error);
                    // Don't fail registration if email fails
                });
                // Set HTTP-only cookie for security
                (0, jwt_1.setTokenCookie)(res, result.token);
                res.status(201).json({
                    success: true,
                    message: result.message,
                    user: result.user,
                    token: result.token,
                    emailVerificationSent: true,
                });
            }
            else {
                res.status(400).json({
                    success: false,
                    message: result.message
                });
            }
        }
        catch (error) {
            console.error('Registration controller error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error during registration'
            });
        }
    }
    static async login(req, res) {
        try {
            const loginData = req.body;
            const result = await auth_1.AuthService.login(loginData);
            // Check if 2FA is required
            if (result.success && result.requires2FA && result.userId) {
                res.status(200).json({
                    success: true,
                    message: result.message,
                    requires2FA: true,
                    userId: result.userId
                });
                return;
            }
            // Normal login with token
            if (result.success && result.token) {
                // Set HTTP-only cookie for security
                (0, jwt_1.setTokenCookie)(res, result.token);
                res.status(200).json({
                    success: true,
                    message: result.message,
                    user: result.user,
                    token: result.token
                });
            }
            else {
                res.status(401).json({
                    success: false,
                    message: result.message
                });
            }
        }
        catch (error) {
            console.error('Login controller error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error during login'
            });
        }
    }
    static async logout(req, res) {
        try {
            // Clear the authentication cookie
            (0, jwt_1.clearTokenCookie)(res);
            res.status(200).json({
                success: true,
                message: 'Logout successful'
            });
        }
        catch (error) {
            console.error('Logout controller error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error during logout'
            });
        }
    }
    static async getProfile(req, res) {
        try {
            const userId = req.user.userId;
            const user = await auth_1.AuthService.getUserProfile(userId);
            if (user) {
                res.status(200).json({
                    success: true,
                    user
                });
            }
            else {
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
        }
        catch (error) {
            console.error('Get profile controller error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error while fetching profile'
            });
        }
    }
    static async updateProfile(req, res) {
        try {
            const userId = req.user.userId;
            const updateData = req.body;
            const result = await auth_1.AuthService.updateUserProfile(userId, updateData);
            if (result.success) {
                res.status(200).json(result);
            }
            else {
                res.status(400).json(result);
            }
        }
        catch (error) {
            console.error('Update profile controller error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error while updating profile'
            });
        }
    }
    static async deleteAccount(req, res) {
        try {
            const userId = req.user.userId;
            const { password } = req.body;
            console.log('🗑️ Account deletion request:', { userId });
            if (!password) {
                res.status(400).json({
                    success: false,
                    message: 'Password is required to delete account'
                });
                return;
            }
            const result = await auth_1.AuthService.deleteUser(userId, password);
            if (result.success) {
                // Clear the authentication cookie
                (0, jwt_1.clearTokenCookie)(res);
                res.status(200).json(result);
            }
            else {
                res.status(400).json(result);
            }
        }
        catch (error) {
            console.error('Delete account controller error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error while deleting account'
            });
        }
    }
    static async verifyToken(req, res) {
        try {
            // Context7 pattern: Verify token is valid through middleware
            const userId = req.user.userId;
            const user = await auth_1.AuthService.getUserProfile(userId);
            if (user) {
                res.status(200).json({
                    success: true,
                    message: 'Token is valid',
                    user
                });
            }
            else {
                // Context7 pattern: Token is valid but user doesn't exist (e.g., DB was flushed)
                res.status(404).json({
                    success: false,
                    message: 'User not found. Please sign in again.',
                    error: 'USER_NOT_FOUND'
                });
            }
        }
        catch (error) {
            console.error('Verify token controller error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error while verifying token',
                error: 'INTERNAL_ERROR'
            });
        }
    }
    static async updatePassword(req, res) {
        try {
            const userId = req.user.userId;
            const { currentPassword, newPassword } = req.body;
            console.log('🔐 Password update request for user:', userId);
            console.log('🔐 Request body keys:', Object.keys(req.body));
            console.log('🔐 Has currentPassword:', !!currentPassword);
            console.log('🔐 Has newPassword:', !!newPassword);
            if (!currentPassword || !newPassword) {
                console.log('❌ Missing required fields');
                res.status(400).json({
                    success: false,
                    message: 'Current password and new password are required'
                });
                return;
            }
            const result = await auth_1.AuthService.updatePassword(userId, currentPassword, newPassword);
            console.log('🔐 Service result:', result);
            if (result.success) {
                res.status(200).json(result);
            }
            else {
                res.status(400).json(result);
            }
        }
        catch (error) {
            console.error('Update password controller error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error while updating password'
            });
        }
    }
    static async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            console.log('🔐 Forgot password request for email:', email);
            if (!email) {
                res.status(400).json({
                    success: false,
                    message: 'Email is required'
                });
                return;
            }
            const result = await auth_1.AuthService.forgotPassword(email);
            // Always return 200 to prevent email enumeration
            res.status(200).json(result);
        }
        catch (error) {
            console.error('Forgot password controller error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error while processing password reset request'
            });
        }
    }
    static async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;
            console.log('🔐 Reset password request');
            if (!token || !newPassword) {
                res.status(400).json({
                    success: false,
                    message: 'Token and new password are required'
                });
                return;
            }
            const result = await auth_1.AuthService.resetPassword(token, newPassword);
            if (result.success) {
                res.status(200).json(result);
            }
            else {
                res.status(400).json(result);
            }
        }
        catch (error) {
            console.error('Reset password controller error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error while resetting password'
            });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.js.map