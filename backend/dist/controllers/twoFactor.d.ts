import { Request, Response } from 'express';
/**
 * 2FA Controller - Handles Two-Factor Authentication endpoints
 */
/**
 * Setup 2FA - Generate secret and QR code
 * POST /api/2fa/setup
 */
export declare function setup2FA(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Enable 2FA - Verify token and enable
 * POST /api/2fa/enable
 * Body: { secret, token, backupCodes }
 */
export declare function enable2FA(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Disable 2FA
 * POST /api/2fa/disable
 * Body: { password }
 */
export declare function disable2FA(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Verify 2FA code during login
 * POST /api/2fa/verify
 * Body: { userId, token, isBackupCode }
 */
export declare function verify2FA(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Get 2FA status
 * GET /api/2fa/status
 */
export declare function get2FAStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Regenerate backup codes
 * POST /api/2fa/regenerate-backup-codes
 * Body: { password }
 */
export declare function regenerateBackupCodes(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=twoFactor.d.ts.map