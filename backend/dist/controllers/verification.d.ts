import { Request, Response } from 'express';
/**
 * Generate a verification token
 */
export declare const generateVerificationToken: () => string;
/**
 * Send verification email to user
 * POST /api/verification/send
 */
export declare const sendVerification: (req: Request, res: Response) => Promise<void>;
/**
 * Verify email with token
 * POST /api/verification/verify
 */
export declare const verifyEmail: (req: Request, res: Response) => Promise<void>;
/**
 * Resend verification email
 * POST /api/verification/resend
 */
export declare const resendVerification: (req: Request, res: Response) => Promise<void>;
/**
 * Check verification status
 * GET /api/verification/status/:email
 */
export declare const checkVerificationStatus: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=verification.d.ts.map