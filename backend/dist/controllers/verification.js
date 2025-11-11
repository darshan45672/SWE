"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkVerificationStatus = exports.resendVerification = exports.verifyEmail = exports.sendVerification = exports.generateVerificationToken = void 0;
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const email_1 = require("../services/email");
/**
 * Generate a verification token
 */
const generateVerificationToken = () => {
    return crypto_1.default.randomBytes(32).toString('hex');
};
exports.generateVerificationToken = generateVerificationToken;
/**
 * Send verification email to user
 * POST /api/verification/send
 */
const sendVerification = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({
                success: false,
                message: 'Email is required',
            });
            return;
        }
        // Find user
        const user = await prisma_1.default.user.findUnique({
            where: { email },
        });
        if (!user) {
            // Don't reveal if user exists or not
            res.status(200).json({
                success: true,
                message: 'If an account exists with this email, a verification link has been sent.',
            });
            return;
        }
        if (user.emailVerified) {
            res.status(400).json({
                success: false,
                message: 'Email is already verified',
            });
            return;
        }
        // Generate token and expiry (24 hours)
        const verificationToken = (0, exports.generateVerificationToken)();
        const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
        // Update user with token
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: {
                verificationToken,
                verificationTokenExpiry,
            },
        });
        // Send verification email
        try {
            await (0, email_1.sendVerificationEmail)(user.email, user.name, verificationToken);
        }
        catch (emailError) {
            console.error('Email sending error:', emailError);
            res.status(500).json({
                success: false,
                message: 'Failed to send verification email. Please check email configuration.',
                error: process.env.NODE_ENV === 'development' ? String(emailError) : undefined,
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Verification email sent successfully',
        });
    }
    catch (error) {
        console.error('Send verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send verification email',
            error: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        });
    }
};
exports.sendVerification = sendVerification;
/**
 * Verify email with token
 * POST /api/verification/verify
 */
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            res.status(400).json({
                success: false,
                message: 'Verification token is required',
            });
            return;
        }
        console.log('🔍 Verifying token:', token.substring(0, 10) + '...');
        // Find user with this token
        const user = await prisma_1.default.user.findFirst({
            where: {
                verificationToken: token,
            },
        });
        console.log('🔍 User found with token:', user ? user.email : 'none');
        if (!user) {
            // Check if any user exists with this email (maybe already verified)
            // This is a fallback - we can't get email from token alone
            res.status(400).json({
                success: false,
                message: 'Invalid or expired verification token',
            });
            return;
        }
        // Check if already verified
        if (user.emailVerified) {
            console.log('✅ User already verified:', user.email);
            // Return success instead of error - user is already verified
            res.status(200).json({
                success: true,
                message: 'Email is already verified',
                data: {
                    email: user.email,
                    name: user.name,
                    alreadyVerified: true,
                },
            });
            return;
        }
        // Check if token has expired
        if (user.verificationTokenExpiry && user.verificationTokenExpiry < new Date()) {
            console.log('❌ Token expired for:', user.email);
            res.status(400).json({
                success: false,
                message: 'Verification token has expired. Please request a new one.',
            });
            return;
        }
        // Verify email
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                verificationToken: null,
                verificationTokenExpiry: null,
            },
        });
        // Send success email
        try {
            await (0, email_1.sendVerificationSuccessEmail)(user.email, user.name);
        }
        catch (emailError) {
            console.error('Error sending success email:', emailError);
            // Don't fail the verification if success email fails
        }
        res.status(200).json({
            success: true,
            message: 'Email verified successfully',
            data: {
                email: user.email,
                name: user.name,
            },
        });
    }
    catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify email',
        });
    }
};
exports.verifyEmail = verifyEmail;
/**
 * Resend verification email
 * POST /api/verification/resend
 */
const resendVerification = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({
                success: false,
                message: 'Email is required',
            });
            return;
        }
        // Find user
        const user = await prisma_1.default.user.findUnique({
            where: { email },
        });
        if (!user) {
            // Don't reveal if user exists or not
            res.status(200).json({
                success: true,
                message: 'If an account exists with this email, a verification link has been sent.',
            });
            return;
        }
        if (user.emailVerified) {
            res.status(400).json({
                success: false,
                message: 'Email is already verified',
            });
            return;
        }
        // Check rate limiting (optional: can't resend within 1 minute)
        if (user.verificationTokenExpiry) {
            const tokenAge = Date.now() - (new Date(user.verificationTokenExpiry).getTime() - 24 * 60 * 60 * 1000);
            if (tokenAge < 60 * 1000) { // Less than 1 minute
                res.status(429).json({
                    success: false,
                    message: 'Please wait before requesting another verification email',
                });
                return;
            }
        }
        // Generate new token
        const verificationToken = (0, exports.generateVerificationToken)();
        const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
        // Update user with new token
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: {
                verificationToken,
                verificationTokenExpiry,
            },
        });
        // Send verification email
        try {
            await (0, email_1.sendVerificationEmail)(user.email, user.name, verificationToken);
        }
        catch (emailError) {
            console.error('Email sending error:', emailError);
            res.status(500).json({
                success: false,
                message: 'Failed to send verification email. Please check email configuration.',
                error: process.env.NODE_ENV === 'development' ? String(emailError) : undefined,
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Verification email resent successfully',
        });
    }
    catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to resend verification email',
            error: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        });
    }
};
exports.resendVerification = resendVerification;
/**
 * Check verification status
 * GET /api/verification/status/:email
 */
const checkVerificationStatus = async (req, res) => {
    try {
        const { email } = req.params;
        if (!email) {
            res.status(400).json({
                success: false,
                message: 'Email is required',
            });
            return;
        }
        const user = await prisma_1.default.user.findUnique({
            where: { email },
            select: {
                emailVerified: true,
                verificationTokenExpiry: true,
            },
        });
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: {
                verified: user.emailVerified,
                tokenExpiry: user.verificationTokenExpiry,
            },
        });
    }
    catch (error) {
        console.error('Check verification status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check verification status',
        });
    }
};
exports.checkVerificationStatus = checkVerificationStatus;
//# sourceMappingURL=verification.js.map