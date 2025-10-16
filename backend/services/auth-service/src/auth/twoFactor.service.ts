import speakeasy from 'speakeasy';
import { UnauthorizedError } from '@projectmanager/common';

/**
 * Two-Factor Authentication Service
 * Handles 2FA token generation and verification
 */
export class TwoFactorService {
  /**
   * Generate 2FA secret
   */
  generateSecret(email: string): {
    secret: string;
    qrCode: string;
  } {
    const secret = speakeasy.generateSecret({
      name: `ProjectManager (${email})`,
      length: 32,
    });

    return {
      secret: secret.base32,
      qrCode: secret.otpauth_url || '',
    };
  }

  /**
   * Verify 2FA token
   */
  verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps before/after
    });
  }

  /**
   * Generate backup codes
   */
  generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  }
}
