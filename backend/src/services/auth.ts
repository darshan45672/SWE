import { User } from '@prisma/client';
import prisma from '../lib/prisma';
import { hashPassword, comparePassword } from '../auth/password';
import { generateToken } from '../auth/jwt';

export interface RegisterData {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: any; // Using any to avoid type complexity with Prisma generated types
  token?: string;
  message: string;
}

export class AuthService {
  static async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const { email, name, password } = data;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return {
          success: false,
          message: 'User with this email already exists'
        };
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword
        }
      });

      // Generate token
      const token = generateToken({
        userId: user.id,
        email: user.email
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return {
        success: true,
        user: userWithoutPassword,
        token,
        message: 'Account created successfully'
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Failed to create account. Please try again.'
      };
    }
  }

  static async login(data: LoginData): Promise<AuthResponse> {
    try {
      const { email, password } = data;

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // Verify password
      const isPasswordValid = await comparePassword(password, user.password);

      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // Generate token
      const token = generateToken({
        userId: user.id,
        email: user.email
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return {
        success: true,
        user: userWithoutPassword,
        token,
        message: 'Login successful'
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Login failed. Please try again.'
      };
    }
  }

  static async getUserProfile(userId: string): Promise<any | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          bio: true,
          phone: true,
          location: true,
          website: true,
          timezone: true,
          language: true,
          company: true,
          jobTitle: true,
          createdAt: true,
          updatedAt: true
        }
      });

      return user;
    } catch (error) {
      console.error('Get user profile error:', error);
      return null;
    }
  }

  static async updateUserProfile(
    userId: string, 
    updateData: Partial<any>
  ): Promise<any | null> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          ...updateData,
          updatedAt: new Date()
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          bio: true,
          phone: true,
          location: true,
          website: true,
          timezone: true,
          language: true,
          company: true,
          jobTitle: true,
          createdAt: true,
          updatedAt: true
        }
      });

      return user;
    } catch (error) {
      console.error('Update user profile error:', error);
      return null;
    }
  }

  static async deleteUser(userId: string): Promise<boolean> {
    try {
      await prisma.user.delete({
        where: { id: userId }
      });
      return true;
    } catch (error) {
      console.error('Delete user error:', error);
      return false;
    }
  }
}