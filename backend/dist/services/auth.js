"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const password_1 = require("../auth/password");
const jwt_1 = require("../auth/jwt");
const crypto_1 = __importDefault(require("crypto"));
class AuthService {
    static async register(data) {
        try {
            // Context7 Debug Pattern: Log incoming data for analysis
            console.log('🔍 Context7 Registration Debug - Incoming data:', {
                email: data.email,
                name: data.name,
                hasPassword: !!data.password,
                hasConfirmPassword: !!data.confirmPassword,
                acceptTerms: data.acceptTerms,
                // Extended profile fields
                avatar: data.avatar || 'undefined',
                bio: data.bio || 'undefined',
                phone: data.phone || 'undefined',
                location: data.location || 'undefined',
                website: data.website || 'undefined',
                company: data.company || 'undefined',
                jobTitle: data.jobTitle || 'undefined',
                timezone: data.timezone || 'undefined',
                language: data.language || 'undefined'
            });
            const { email, name, password, avatar, bio, phone, location, website, company, jobTitle, timezone, language = "en" } = data;
            // Context7 Security Pattern: Enhanced validation
            if (!email || !name || !password) {
                return {
                    success: false,
                    message: 'Required fields (email, name, password) are missing'
                };
            }
            // Check if user already exists
            const existingUser = await prisma_1.default.user.findUnique({
                where: { email }
            });
            if (existingUser) {
                return {
                    success: false,
                    message: 'User with this email already exists'
                };
            }
            // Hash password
            const hashedPassword = await (0, password_1.hashPassword)(password);
            // Context7 Data Preparation Pattern: Prepare user data for database
            const userData = {
                email,
                name,
                password: hashedPassword,
                avatar: avatar || undefined,
                bio: bio || undefined,
                phone: phone || undefined,
                location: location || undefined,
                website: website || undefined,
                company: company || undefined,
                jobTitle: jobTitle || undefined,
                timezone: timezone || undefined,
                language: language || "en",
                emailVerified: false // Email verification required - user must verify email before full access
            };
            console.log('🔍 Context7 Database Debug - Data being saved:', {
                ...userData,
                password: '*** HIDDEN ***'
            });
            // Create user with all profile data
            const user = await prisma_1.default.user.create({
                data: userData
            });
            // Generate token
            const token = (0, jwt_1.generateToken)({
                userId: user.id,
                email: user.email
            });
            // Remove password from response
            const { password: _, ...userWithoutPassword } = user;
            console.log('✅ User registered successfully with complete profile:', user.id);
            return {
                success: true,
                user: userWithoutPassword,
                token,
                message: 'Account created successfully'
            };
        }
        catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                message: 'Failed to create account. Please try again.'
            };
        }
    }
    static async login(data) {
        try {
            const { email, password } = data;
            // Find user by email
            const user = await prisma_1.default.user.findUnique({
                where: { email }
            });
            if (!user) {
                return {
                    success: false,
                    message: 'Invalid email or password'
                };
            }
            // Verify password
            const isPasswordValid = await (0, password_1.comparePassword)(password, user.password);
            if (!isPasswordValid) {
                return {
                    success: false,
                    message: 'Invalid email or password'
                };
            }
            // Check if email is verified
            if (!user.emailVerified) {
                return {
                    success: false,
                    message: 'Please verify your email address to continue',
                    requiresVerification: true,
                    email: user.email
                };
            }
            // Check if 2FA is enabled
            if (user.twoFactorEnabled) {
                return {
                    success: true,
                    message: '2FA verification required',
                    requires2FA: true,
                    userId: user.id
                };
            }
            // Generate token (normal login without 2FA)
            const token = (0, jwt_1.generateToken)({
                userId: user.id,
                email: user.email
            });
            // Remove password from response
            const { password: _, ...userWithoutPassword } = user;
            return {
                success: true,
                user: userWithoutPassword,
                token,
                message: 'Login successful'
            };
        }
        catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: 'Login failed. Please try again.'
            };
        }
    }
    static async getUserProfile(userId) {
        try {
            const user = await prisma_1.default.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    emailVerified: true,
                    avatar: true,
                    bio: true,
                    phone: true,
                    location: true,
                    website: true,
                    timezone: true,
                    language: true,
                    company: true,
                    jobTitle: true,
                    createdAt: true,
                    updatedAt: true
                }
            });
            return user;
        }
        catch (error) {
            console.error('Get user profile error:', error);
            return null;
        }
    }
    static async updateUserProfile(userId, updateData) {
        try {
            // Validate user exists
            const existingUser = await prisma_1.default.user.findUnique({
                where: { id: userId }
            });
            if (!existingUser) {
                return {
                    success: false,
                    message: 'User not found'
                };
            }
            // Check if email is being updated and if it's already in use
            if (updateData.email && updateData.email !== existingUser.email) {
                const emailExists = await prisma_1.default.user.findUnique({
                    where: { email: updateData.email }
                });
                if (emailExists) {
                    return {
                        success: false,
                        message: 'Email address is already in use'
                    };
                }
            }
            // Context7 pattern: Clean empty optional fields
            const cleanedData = {};
            Object.keys(updateData).forEach(key => {
                const value = updateData[key];
                if (value !== undefined && value !== '') {
                    cleanedData[key] = value;
                }
                else if (value === '') {
                    cleanedData[key] = null; // Set to null for empty strings
                }
            });
            // Update user profile with Context7 pattern
            const user = await prisma_1.default.user.update({
                where: { id: userId },
                data: {
                    ...cleanedData,
                    updatedAt: new Date()
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    avatar: true,
                    bio: true,
                    phone: true,
                    location: true,
                    website: true,
                    timezone: true,
                    language: true,
                    company: true,
                    jobTitle: true,
                    emailVerified: true,
                    createdAt: true,
                    updatedAt: true
                }
            });
            return {
                success: true,
                message: 'Profile updated successfully',
                user
            };
        }
        catch (error) {
            console.error('Update user profile error:', error);
            return {
                success: false,
                message: 'Failed to update profile. Please try again.'
            };
        }
    }
    static async deleteUser(userId, password) {
        try {
            console.log('🗑️ Attempting to delete user account:', userId);
            // Get user with password for verification
            const user = await prisma_1.default.user.findUnique({
                where: { id: userId }
            });
            if (!user) {
                return {
                    success: false,
                    message: 'User not found'
                };
            }
            // Verify password before deletion (Context7 security pattern)
            const isPasswordValid = await (0, password_1.comparePassword)(password, user.password);
            if (!isPasswordValid) {
                console.log('❌ Invalid password for account deletion');
                return {
                    success: false,
                    message: 'Invalid password. Account deletion failed.'
                };
            }
            // Delete user account
            await prisma_1.default.user.delete({
                where: { id: userId }
            });
            console.log('✅ User account deleted successfully:', userId);
            return {
                success: true,
                message: 'Account deleted successfully'
            };
        }
        catch (error) {
            console.error('❌ Delete user error:', error);
            return {
                success: false,
                message: 'Failed to delete account. Please try again.'
            };
        }
    }
    static async updatePassword(userId, currentPassword, newPassword) {
        try {
            console.log('🔐 Attempting to update password for user:', userId);
            console.log('🔐 Current password length:', currentPassword?.length || 0);
            console.log('🔐 New password length:', newPassword?.length || 0);
            // Get user with password for verification
            const user = await prisma_1.default.user.findUnique({
                where: { id: userId }
            });
            if (!user) {
                console.log('❌ User not found:', userId);
                return {
                    success: false,
                    message: 'User not found'
                };
            }
            console.log('✅ User found:', user.id, user.email);
            console.log('🔐 Stored password hash:', user.password.substring(0, 20) + '...');
            // Verify current password (Context7 security pattern)
            const isPasswordValid = await (0, password_1.comparePassword)(currentPassword, user.password);
            console.log('🔐 Password comparison result:', isPasswordValid);
            if (!isPasswordValid) {
                console.log('❌ Invalid current password');
                return {
                    success: false,
                    message: 'Current password is incorrect'
                };
            }
            // Hash new password
            const hashedNewPassword = await (0, password_1.hashPassword)(newPassword);
            console.log('🔐 New password hashed successfully');
            // Update password
            await prisma_1.default.user.update({
                where: { id: userId },
                data: {
                    password: hashedNewPassword,
                    updatedAt: new Date()
                }
            });
            console.log('✅ Password updated successfully for user:', userId);
            return {
                success: true,
                message: 'Password updated successfully'
            };
        }
        catch (error) {
            console.error('❌ Update password error:', error);
            return {
                success: false,
                message: 'Failed to update password. Please try again.'
            };
        }
    }
    static async forgotPassword(email) {
        try {
            console.log('🔐 Forgot password request for email:', email);
            // Find user by email
            const user = await prisma_1.default.user.findUnique({
                where: { email }
            });
            // Context7 security pattern: Don't reveal if email exists
            if (!user) {
                console.log('❌ User not found for email:', email);
                // Still return success to prevent email enumeration
                return {
                    success: true,
                    message: 'If an account with that email exists, a password reset link has been sent.'
                };
            }
            // Generate reset token
            const resetToken = crypto_1.default.randomBytes(32).toString('hex');
            const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
            // Save reset token to database
            await prisma_1.default.user.update({
                where: { id: user.id },
                data: {
                    resetToken,
                    resetTokenExpiry
                }
            });
            console.log('✅ Reset token generated for user:', user.id);
            // Send password reset email (async, don't wait)
            const { sendPasswordResetEmail } = require('./email');
            // Context7 pattern: Log reset URL for development/testing
            const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;
            console.log('🔗 Password reset URL:', resetUrl);
            // Pass just the token - email service will construct the full URL
            sendPasswordResetEmail(user.email, user.name || 'User', resetToken)
                .then(() => {
                console.log('✅ Password reset email sent to:', user.email);
            })
                .catch((error) => {
                console.error('❌ Failed to send password reset email:', error);
            });
            return {
                success: true,
                message: 'If an account with that email exists, a password reset link has been sent.'
            };
        }
        catch (error) {
            console.error('❌ Forgot password error:', error);
            return {
                success: false,
                message: 'Failed to process password reset request. Please try again.'
            };
        }
    }
    static async resetPassword(token, newPassword) {
        try {
            console.log('🔐 Password reset request with token');
            // Find user by reset token
            const user = await prisma_1.default.user.findFirst({
                where: {
                    resetToken: token,
                    resetTokenExpiry: {
                        gt: new Date() // Token not expired
                    }
                }
            });
            if (!user) {
                console.log('❌ Invalid or expired reset token');
                return {
                    success: false,
                    message: 'Invalid or expired reset token. Please request a new password reset link.'
                };
            }
            // Hash new password
            const hashedPassword = await (0, password_1.hashPassword)(newPassword);
            // Update password and clear reset token
            await prisma_1.default.user.update({
                where: { id: user.id },
                data: {
                    password: hashedPassword,
                    resetToken: null,
                    resetTokenExpiry: null,
                    updatedAt: new Date()
                }
            });
            console.log('✅ Password reset successfully for user:', user.id);
            return {
                success: true,
                message: 'Password has been reset successfully. You can now sign in with your new password.'
            };
        }
        catch (error) {
            console.error('❌ Reset password error:', error);
            return {
                success: false,
                message: 'Failed to reset password. Please try again.'
            };
        }
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.js.map