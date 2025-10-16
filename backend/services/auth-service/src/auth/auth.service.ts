import { UserRepository, SessionRepository } from '../database';
import { PasswordService } from './password.service';
import { JWTService } from './jwt.service';
import { TwoFactorService } from './twoFactor.service';
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from '@projectmanager/common';
import { AuthResponse, UserResponse } from '@projectmanager/types';
import crypto from 'crypto';

/**
 * Auth Service - Business Logic Layer
 * Handles all authentication-related business logic
 * Following Service Layer Pattern
 */
export class AuthService {
  private userRepository: UserRepository;
  private sessionRepository: SessionRepository;
  private passwordService: PasswordService;
  private jwtService: JWTService;
  private twoFactorService: TwoFactorService;

  constructor() {
    this.userRepository = new UserRepository();
    this.sessionRepository = new SessionRepository();
    this.passwordService = new PasswordService();
    this.jwtService = new JWTService();
    this.twoFactorService = new TwoFactorService();
  }

  /**
   * Register a new user
   */
  async register(data: {
    email: string;
    password: string;
    name?: string;
  }): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Validate password strength
    const passwordValidation = this.passwordService.validateStrength(data.password);
    if (!passwordValidation.isValid) {
      throw new BadRequestError(
        passwordValidation.errors.join(', '),
        'WEAK_PASSWORD'
      );
    }

    // Hash password
    const hashedPassword = await this.passwordService.hash(data.password);

    // Generate email verification token
    const emailVerifyToken = crypto.randomBytes(32).toString('hex');

    // Create user
    const user = await this.userRepository.create({
      email: data.email,
      password: hashedPassword,
      name: data.name,
    });

    // Update with email verify token
    await this.userRepository.update(user.id, { emailVerifyToken });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email);

    // TODO: Send verification email

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  /**
   * Login user
   */
  async login(data: {
    email: string;
    password: string;
    twoFactorCode?: string;
  }): Promise<AuthResponse> {
    // Find user
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await this.passwordService.compare(
      data.password,
      user.password
    );
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check 2FA if enabled
    if (user.twoFactorEnabled) {
      if (!data.twoFactorCode) {
        throw new UnauthorizedError('Two-factor code required', 'TWO_FACTOR_REQUIRED');
      }

      if (!user.twoFactorSecret) {
        throw new UnauthorizedError('Two-factor not properly configured');
      }

      const is2FAValid = this.twoFactorService.verifyToken(
        user.twoFactorSecret,
        data.twoFactorCode
      );

      if (!is2FAValid) {
        throw new UnauthorizedError('Invalid two-factor code');
      }
    }

    // Update last login
    await this.userRepository.update(user.id, {
      lastLoginAt: new Date(),
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    // Verify refresh token
    const payload = this.jwtService.verifyRefreshToken(refreshToken);

    // Find session
    const session = await this.sessionRepository.findByRefreshToken(refreshToken);
    if (!session) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Check if session expired
    if (session.expiresAt < new Date()) {
      await this.sessionRepository.deleteByRefreshToken(refreshToken);
      throw new UnauthorizedError('Refresh token expired');
    }

    // Generate new tokens
    const tokens = await this.generateTokens(payload.userId, session.user.email);

    // Delete old session
    await this.sessionRepository.deleteByRefreshToken(refreshToken);

    return {
      user: this.sanitizeUser(session.user),
      tokens,
    };
  }

  /**
   * Logout user
   */
  async logout(refreshToken: string): Promise<void> {
    await this.sessionRepository.deleteByRefreshToken(refreshToken);
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<void> {
    const user = await this.userRepository.findByEmailVerifyToken(token);
    if (!user) {
      throw new BadRequestError('Invalid or expired verification token');
    }

    await this.userRepository.update(user.id, {
      emailVerified: true,
      emailVerifyToken: null,
    });
  }

  /**
   * Enable 2FA
   */
  async enable2FA(userId: string): Promise<{ secret: string; qrCode: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.twoFactorEnabled) {
      throw new BadRequestError('Two-factor authentication already enabled');
    }

    const { secret, qrCode } = this.twoFactorService.generateSecret(user.email);

    // Save secret (temporary, will be confirmed when user verifies)
    await this.userRepository.update(userId, {
      twoFactorSecret: secret,
    });

    return { secret, qrCode };
  }

  /**
   * Verify and activate 2FA
   */
  async verify2FA(userId: string, code: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.twoFactorSecret) {
      throw new BadRequestError('Two-factor setup not initiated');
    }

    const isValid = this.twoFactorService.verifyToken(user.twoFactorSecret, code);
    if (!isValid) {
      throw new BadRequestError('Invalid verification code');
    }

    await this.userRepository.update(userId, {
      twoFactorEnabled: true,
    });
  }

  /**
   * Disable 2FA
   */
  async disable2FA(userId: string, password: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify password
    const isPasswordValid = await this.passwordService.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid password');
    }

    await this.userRepository.update(userId, {
      twoFactorEnabled: false,
      twoFactorSecret: null,
    });
  }

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(userId: string, email: string) {
    const accessToken = this.jwtService.generateAccessToken({
      userId,
      email,
    });

    const tokenId = crypto.randomUUID();
    const refreshToken = this.jwtService.generateRefreshToken({
      userId,
      email,
      tokenId,
    });

    // Save refresh token in database
    await this.sessionRepository.create({
      userId,
      refreshToken,
      expiresAt: this.jwtService.getRefreshTokenExpiry(),
    });

    return { accessToken, refreshToken };
  }

  /**
   * Sanitize user object (remove sensitive data)
   */
  private sanitizeUser(user: any): UserResponse {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      emailVerified: user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
