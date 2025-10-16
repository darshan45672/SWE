import { Request, Response, NextFunction } from 'express';
import { JWTService } from '../auth';
import { UnauthorizedError } from '@projectmanager/common';
import { RequestUser } from '@projectmanager/types';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: RequestUser;
    }
  }
}

const jwtService = new JWTService();

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const payload = jwtService.verifyAccessToken(token);

    // Attach user to request
    req.user = {
      userId: payload.userId,
      email: payload.email,
    };

    next();
  } catch (error) {
    next(error);
  }
}
