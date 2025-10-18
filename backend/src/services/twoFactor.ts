import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import prisma from '../lib/prisma';
import crypto from 'crypto';

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
export async function generateTwoFactorSecret(userId: string, userEmail: string, userName: string): Promise<TwoFactorSetup> {
  // Generate secret
  const secret = speakeasy.generateSecret({
    name: `SWE (${userEmail})`,
    issuer: 'SWE Project Management',
    length: 32
  });

  if (!secret.otpauth_url) {
    throw new Error('Failed to generate OTP auth URL');
  }

  // Generate QR code
  const qrCode = await QRCode.toDataURL(secret.otpauth_url);

  // Generate backup codes (10 codes, 8 characters each)
  const backupCodes = Array.from({ length: 10 }, () => 
    crypto.randomBytes(4).toString('hex').toUpperCase()
  );

  return {
    secret: secret.base32,
    qrCode,
    backupCodes
  };
}

/**
 * Verify a TOTP token
 */
export function verifyTwoFactorToken(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2 // Allow 2 time steps before/after for clock drift
  });
}

/**
 * Verify a backup code
 */
export async function verifyBackupCode(userId: string, code: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { twoFactorBackupCodes: true }
  });

  if (!user || !user.twoFactorBackupCodes) {
    return false;
  }

  const hashedCode = crypto.createHash('sha256').update(code).digest('hex');
  const codeIndex = user.twoFactorBackupCodes.indexOf(hashedCode);

  if (codeIndex === -1) {
    return false;
  }

  // Remove used backup code
  const updatedCodes = user.twoFactorBackupCodes.filter((_: string, index: number) => index !== codeIndex);
  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorBackupCodes: updatedCodes }
  });

  return true;
}

/**
 * Enable 2FA for a user
 */
export async function enableTwoFactor(userId: string, secret: string, backupCodes: string[]): Promise<void> {
  // Hash backup codes before storing
  const hashedBackupCodes = backupCodes.map(code => 
    crypto.createHash('sha256').update(code).digest('hex')
  );

  await prisma.user.update({
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
export async function disableTwoFactor(userId: string): Promise<void> {
  await prisma.user.update({
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
export async function isTwoFactorEnabled(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { twoFactorEnabled: true }
  });

  return user?.twoFactorEnabled || false;
}

/**
 * Get user's 2FA secret
 */
export async function getTwoFactorSecret(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { twoFactorSecret: true }
  });

  return user?.twoFactorSecret || null;
}

/**
 * Regenerate backup codes for a user
 */
export async function regenerateBackupCodes(userId: string): Promise<string[]> {
  // Generate new backup codes
  const backupCodes = Array.from({ length: 10 }, () => 
    crypto.randomBytes(4).toString('hex').toUpperCase()
  );

  // Hash and store
  const hashedBackupCodes = backupCodes.map(code => 
    crypto.createHash('sha256').update(code).digest('hex')
  );

  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorBackupCodes: hashedBackupCodes }
  });

  return backupCodes;
}
