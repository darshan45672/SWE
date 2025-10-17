import { Router } from 'express';
import { requireAuth } from '../auth/middleware';
import * as twoFactorController from '../controllers/twoFactor';

const router = Router();

/**
 * 2FA Routes
 * All routes require authentication except verify (used during login)
 */

// Get 2FA status
router.get('/status', requireAuth, twoFactorController.get2FAStatus);

// Setup 2FA - Generate QR code
router.post('/setup', requireAuth, twoFactorController.setup2FA);

// Enable 2FA - Verify and activate
router.post('/enable', requireAuth, twoFactorController.enable2FA);

// Disable 2FA - Requires password
router.post('/disable', requireAuth, twoFactorController.disable2FA);

// Verify 2FA code (public - used during login)
router.post('/verify', twoFactorController.verify2FA);

// Regenerate backup codes
router.post('/regenerate-backup-codes', requireAuth, twoFactorController.regenerateBackupCodes);

export default router;
