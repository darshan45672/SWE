import { Request, Response } from 'express';
import { AuthService, RegisterData, LoginData } from '../services/auth';
import { setTokenCookie, clearTokenCookie } from '../auth/jwt';
import { AuthenticatedRequest } from '../auth/middleware';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const registerData: RegisterData = req.body;
      const result = await AuthService.register(registerData);

      if (result.success && result.token) {
        // Set HTTP-only cookie for security
        setTokenCookie(res, result.token);
        
        res.status(201).json({
          success: true,
          message: result.message,
          user: result.user,
          token: result.token
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      console.error('Registration controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during registration'
      });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const loginData: LoginData = req.body;
      const result = await AuthService.login(loginData);

      if (result.success && result.token) {
        // Set HTTP-only cookie for security
        setTokenCookie(res, result.token);
        
        res.status(200).json({
          success: true,
          message: result.message,
          user: result.user,
          token: result.token
        });
      } else {
        res.status(401).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      console.error('Login controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during login'
      });
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    try {
      // Clear the authentication cookie
      clearTokenCookie(res);
      
      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during logout'
      });
    }
  }

  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user.userId;
      const user = await AuthService.getUserProfile(userId);

      if (user) {
        res.status(200).json({
          success: true,
          user
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
    } catch (error) {
      console.error('Get profile controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching profile'
      });
    }
  }

  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user.userId;
      const updateData = req.body;

      const user = await AuthService.updateUserProfile(userId, updateData);

      if (user) {
        res.status(200).json({
          success: true,
          message: 'Profile updated successfully',
          user
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
    } catch (error) {
      console.error('Update profile controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating profile'
      });
    }
  }

  static async deleteAccount(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user.userId;
      const success = await AuthService.deleteUser(userId);

      if (success) {
        // Clear the authentication cookie
        clearTokenCookie(res);
        
        res.status(200).json({
          success: true,
          message: 'Account deleted successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
    } catch (error) {
      console.error('Delete account controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while deleting account'
      });
    }
  }

  static async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      // If we reach here, the token is valid (due to requireAuth middleware)
      const userId = (req as AuthenticatedRequest).user.userId;
      const user = await AuthService.getUserProfile(userId);

      if (user) {
        res.status(200).json({
          success: true,
          message: 'Token is valid',
          user
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
    } catch (error) {
      console.error('Verify token controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while verifying token'
      });
    }
  }
}