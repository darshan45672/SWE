import { Request, Response } from 'express';
import * as twoFactorService from '../services/twoFactor';
import { comparePassword } from '../auth/password';
import prisma from '../lib/prisma';

/**
 * 2FA Controller - Handles Two-Factor Authentication endpoints
 */

/**
 * Setup 2FA - Generate secret and QR code
 * POST /api/2fa/setup
 */
export async function setup2FA(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Get user details from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if 2FA is already enabled
    const isEnabled = await twoFactorService.isTwoFactorEnabled(userId);
    if (isEnabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is already enabled'
      });
    }

    // Generate secret and QR code
    const setup = await twoFactorService.generateTwoFactorSecret(userId, user.email, user.name);

    res.json({
      success: true,
      data: {
        secret: setup.secret,
        qrCode: setup.qrCode,
        backupCodes: setup.backupCodes
      }
    });
  } catch (error) {
    console.error('Setup 2FA error:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({
      success: false,
      message: 'Failed to setup 2FA',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Enable 2FA - Verify token and enable
 * POST /api/2fa/enable
 * Body: { secret, token, backupCodes }
 */
export async function enable2FA(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const { secret, token, backupCodes } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (!secret || !token || !backupCodes || !Array.isArray(backupCodes)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data'
      });
    }

    // Verify the token
    const isValid = twoFactorService.verifyTwoFactorToken(secret, token);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

    // Enable 2FA
    await twoFactorService.enableTwoFactor(userId, secret, backupCodes);

    res.json({
      success: true,
      message: '2FA enabled successfully'
    });
  } catch (error) {
    console.error('Enable 2FA error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enable 2FA'
    });
  }
}

/**
 * Disable 2FA
 * POST /api/2fa/disable
 * Body: { password }
 */
export async function disable2FA(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const { password } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    // Verify password
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Disable 2FA
    await twoFactorService.disableTwoFactor(userId);

    res.json({
      success: true,
      message: '2FA disabled successfully'
    });
  } catch (error) {
    console.error('Disable 2FA error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disable 2FA'
    });
  }
}

/**
 * Verify 2FA code during login
 * POST /api/2fa/verify
 * Body: { userId, token, isBackupCode }
 */
export async function verify2FA(req: Request, res: Response) {
  try {
    const { userId, token, isBackupCode } = req.body;

    if (!userId || !token) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data'
      });
    }

    let isValid = false;

    if (isBackupCode) {
      // Verify backup code
      isValid = await twoFactorService.verifyBackupCode(userId, token);
    } else {
      // Verify TOTP token
      const secret = await twoFactorService.getTwoFactorSecret(userId);
      if (!secret) {
        return res.status(400).json({
          success: false,
          message: '2FA not enabled'
        });
      }
      isValid = twoFactorService.verifyTwoFactorToken(secret, token);
    }

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

    // Get user data and generate token for successful verification
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate token
    const { generateToken } = await import('../auth/jwt');
    const authToken = generateToken({
      userId: user.id,
      email: user.email
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Verification successful',
      token: authToken,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Verify 2FA error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify code'
    });
  }
}

/**
 * Get 2FA status
 * GET /api/2fa/status
 */
export async function get2FAStatus(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const isEnabled = await twoFactorService.isTwoFactorEnabled(userId);

    res.json({
      success: true,
      data: {
        enabled: isEnabled
      }
    });
  } catch (error) {
    console.error('Get 2FA status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get 2FA status'
    });
  }
}

/**
 * Regenerate backup codes
 * POST /api/2fa/regenerate-backup-codes
 * Body: { password }
 */
export async function regenerateBackupCodes(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const { password } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    // Verify password
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Check if 2FA is enabled
    const isEnabled = await twoFactorService.isTwoFactorEnabled(userId);
    if (!isEnabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is not enabled'
      });
    }

    // Regenerate backup codes
    const backupCodes = await twoFactorService.regenerateBackupCodes(userId);

    res.json({
      success: true,
      data: {
        backupCodes
      }
    });
  } catch (error) {
    console.error('Regenerate backup codes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to regenerate backup codes'
    });
  }
}
