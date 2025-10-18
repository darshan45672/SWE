import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader, JwtPayload } from './jwt';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

// Middleware that requires authentication
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  try {
    // Try to get token from Authorization header first
    const authHeader = req.headers.authorization;
    let token = extractTokenFromHeader(authHeader);
    
    // If no Authorization header, try to get token from cookie
    if (!token && req.cookies && req.cookies['auth-token']) {
      token = req.cookies['auth-token'];
    }

    if (!token) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required. Please provide a valid token.',
      });
      return;
    }

    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    });
  }
}

// Middleware that allows optional authentication
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      try {
        const payload = verifyToken(token);
        req.user = payload;
      } catch (error) {
        // Token is invalid but we continue without setting user
        console.warn('Invalid token provided in optional auth:', error);
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
}

// Utility function to check if request is authenticated
export function isAuthenticated(req: Request): req is AuthenticatedRequest {
  return !!req.user;
}