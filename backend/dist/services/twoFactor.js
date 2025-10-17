"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTwoFactorSecret = generateTwoFactorSecret;
exports.verifyTwoFactorToken = verifyTwoFactorToken;
exports.verifyBackupCode = verifyBackupCode;
exports.enableTwoFactor = enableTwoFactor;
exports.disableTwoFactor = disableTwoFactor;
exports.isTwoFactorEnabled = isTwoFactorEnabled;
exports.getTwoFactorSecret = getTwoFactorSecret;
exports.regenerateBackupCodes = regenerateBackupCodes;
const speakeasy_1 = __importDefault(require("speakeasy"));
const qrcode_1 = __importDefault(require("qrcode"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const crypto_1 = __importDefault(require("crypto"));
/**
 * Generate a new 2FA secret and QR code for a user
 */
async function generateTwoFactorSecret(userId, userEmail, userName) {
    // Generate secret
    const secret = speakeasy_1.default.generateSecret({
        name: `SWE (${userEmail})`,
        issuer: 'SWE Project Management',
        length: 32
    });
    if (!secret.otpauth_url) {
        throw new Error('Failed to generate OTP auth URL');
    }
    // Generate QR code
    const qrCode = await qrcode_1.default.toDataURL(secret.otpauth_url);
    // Generate backup codes (10 codes, 8 characters each)
    const backupCodes = Array.from({ length: 10 }, () => crypto_1.default.randomBytes(4).toString('hex').toUpperCase());
    return {
        secret: secret.base32,
        qrCode,
        backupCodes
    };
}
/**
 * Verify a TOTP token
 */
function verifyTwoFactorToken(secret, token) {
    return speakeasy_1.default.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 2 // Allow 2 time steps before/after for clock drift
    });
}
/**
 * Verify a backup code
 */
async function verifyBackupCode(userId, code) {
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
        select: { twoFactorBackupCodes: true }
    });
    if (!user || !user.twoFactorBackupCodes) {
        return false;
    }
    const hashedCode = crypto_1.default.createHash('sha256').update(code).digest('hex');
    const codeIndex = user.twoFactorBackupCodes.indexOf(hashedCode);
    if (codeIndex === -1) {
        return false;
    }
    // Remove used backup code
    const updatedCodes = user.twoFactorBackupCodes.filter((_, index) => index !== codeIndex);
    await prisma_1.default.user.update({
        where: { id: userId },
        data: { twoFactorBackupCodes: updatedCodes }
    });
    return true;
}
/**
 * Enable 2FA for a user
 */
async function enableTwoFactor(userId, secret, backupCodes) {
    // Hash backup codes before storing
    const hashedBackupCodes = backupCodes.map(code => crypto_1.default.createHash('sha256').update(code).digest('hex'));
    await prisma_1.default.user.update({
        where: { id: userId },
        data: {
            twoFactorEnabled: true,
            twoFactorSecret: secret,
            twoFactorBackupCodes: hashedBackupCodes
        }
    });
}
/**
 * Disable 2FA for a user
 */
async function disableTwoFactor(userId) {
    await prisma_1.default.user.update({
        where: { id: userId },
        data: {
            twoFactorEnabled: false,
            twoFactorSecret: null,
            twoFactorBackupCodes: []
        }
    });
}
/**
 * Check if user has 2FA enabled
 */
async function isTwoFactorEnabled(userId) {
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
        select: { twoFactorEnabled: true }
    });
    return user?.twoFactorEnabled || false;
}
/**
 * Get user's 2FA secret
 */
async function getTwoFactorSecret(userId) {
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
        select: { twoFactorSecret: true }
    });
    return user?.twoFactorSecret || null;
}
/**
 * Regenerate backup codes for a user
 */
async function regenerateBackupCodes(userId) {
    // Generate new backup codes
    const backupCodes = Array.from({ length: 10 }, () => crypto_1.default.randomBytes(4).toString('hex').toUpperCase());
    // Hash and store
    const hashedBackupCodes = backupCodes.map(code => crypto_1.default.createHash('sha256').update(code).digest('hex'));
    await prisma_1.default.user.update({
        where: { id: userId },
        data: { twoFactorBackupCodes: hashedBackupCodes }
    });
    return backupCodes;
}
//# sourceMappingURL=twoFactor.js.map