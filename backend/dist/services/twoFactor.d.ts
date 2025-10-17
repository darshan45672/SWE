/**
 * 2FA Service - Handles Two-Factor Authentication
 * Using TOTP (Time-based One-Time Password) with speakeasy
 */
export interface TwoFactorSetup {
    secret: string;
    qrCode: string;
    backupCodes: string[];
}
/**
 * Generate a new 2FA secret and QR code for a user
 */
export declare function generateTwoFactorSecret(userId: string, userEmail: string, userName: string): Promise<TwoFactorSetup>;
/**
 * Verify a TOTP token
 */
export declare function verifyTwoFactorToken(secret: string, token: string): boolean;
/**
 * Verify a backup code
 */
export declare function verifyBackupCode(userId: string, code: string): Promise<boolean>;
/**
 * Enable 2FA for a user
 */
export declare function enableTwoFactor(userId: string, secret: string, backupCodes: string[]): Promise<void>;
/**
 * Disable 2FA for a user
 */
export declare function disableTwoFactor(userId: string): Promise<void>;
/**
 * Check if user has 2FA enabled
 */
export declare function isTwoFactorEnabled(userId: string): Promise<boolean>;
/**
 * Get user's 2FA secret
 */
export declare function getTwoFactorSecret(userId: string): Promise<string | null>;
/**
 * Regenerate backup codes for a user
 */
export declare function regenerateBackupCodes(userId: string): Promise<string[]>;
//# sourceMappingURL=twoFactor.d.ts.map