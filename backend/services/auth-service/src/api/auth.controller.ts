import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../auth';
import { asyncHandler, ValidationError } from '@projectmanager/common';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  verifyEmailSchema,
  verify2FASchema,
  disable2FASchema,
} from './validators';

/**
 * Auth Controller
 * Handles HTTP requests for authentication
 * Following Controller Pattern
 */
export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * POST /auth/register
   * Register a new user
   */
  register = asyncHandler(async (req: Request, res: Response) => {
    // Validate request body
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors[0].message);
    }

    const result = await this.authService.register(parsed.data);

    res.status(201).json({
      success: true,
      data: result,
    });
  });

  /**
   * POST /auth/login
   * Login user
   */
  login = asyncHandler(async (req: Request, res: Response) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors[0].message);
    }

    const result = await this.authService.login(parsed.data);

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  /**
   * POST /auth/refresh
   * Refresh access token
   */
  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const parsed = refreshTokenSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors[0].message);
    }

    const result = await this.authService.refreshToken(parsed.data.refreshToken);

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  /**
   * POST /auth/logout
   * Logout user
   */
  logout = asyncHandler(async (req: Request, res: Response) => {
    const parsed = refreshTokenSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors[0].message);
    }

    await this.authService.logout(parsed.data.refreshToken);

    res.status(200).json({
      success: true,
      data: { message: 'Logged out successfully' },
    });
  });

  /**
   * POST /auth/verify-email
   * Verify user email
   */
  verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const parsed = verifyEmailSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors[0].message);
    }

    await this.authService.verifyEmail(parsed.data.token);

    res.status(200).json({
      success: true,
      data: { message: 'Email verified successfully' },
    });
  });

  /**
   * POST /auth/2fa/enable
   * Enable 2FA for user
   */
  enable2FA = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error('User not authenticated');
    }

    const result = await this.authService.enable2FA(req.user.userId);

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  /**
   * POST /auth/2fa/verify
   * Verify and activate 2FA
   */
  verify2FA = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error('User not authenticated');
    }

    const parsed = verify2FASchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors[0].message);
    }

    await this.authService.verify2FA(req.user.userId, parsed.data.code);

    res.status(200).json({
      success: true,
      data: { message: 'Two-factor authentication enabled successfully' },
    });
  });

  /**
   * POST /auth/2fa/disable
   * Disable 2FA
   */
  disable2FA = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error('User not authenticated');
    }

    const parsed = disable2FASchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors[0].message);
    }

    await this.authService.disable2FA(req.user.userId, parsed.data.password);

    res.status(200).json({
      success: true,
      data: { message: 'Two-factor authentication disabled successfully' },
    });
  });
}
