import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authMiddleware } from './auth.middleware';

/**
 * Auth Routes
 * Defines all authentication endpoints
 */
export function createAuthRoutes(): Router {
  const router = Router();
  const authController = new AuthController();

  // Public routes
  router.post('/register', authController.register);
  router.post('/login', authController.login);
  router.post('/refresh', authController.refreshToken);
  router.post('/logout', authController.logout);
  router.post('/verify-email', authController.verifyEmail);

  // Protected routes (require authentication)
  router.post('/2fa/enable', authMiddleware, authController.enable2FA);
  router.post('/2fa/verify', authMiddleware, authController.verify2FA);
  router.post('/2fa/disable', authMiddleware, authController.disable2FA);

  return router;
}
