import { User } from '@prisma/client';
import prisma from '../lib/prisma';
import { hashPassword, comparePassword } from '../auth/password';
import { generateToken } from '../auth/jwt';
import { UpdateProfileData, ProfileResponse, DeleteAccountResponse } from '../types/profile';

export interface RegisterData {
  // Basic Information
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
  
  // Extended Profile Information
  avatar?: string;
  bio?: string;
  phone?: string;
  location?: string;
  website?: string;
  company?: string;
  jobTitle?: string;
  timezone?: string;
  language?: string;
  acceptTerms: boolean;
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
      const { 
        email, 
        name, 
        password, 
        avatar,
        bio,
        phone,
        location,
        website,
        company,
        jobTitle,
        timezone,
        language = "en"
      } = data;

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

      // Create user with all profile data
      const user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          avatar,
          bio,
          phone,
          location,
          website,
          company,
          jobTitle,
          timezone,
          language,
          emailVerified: false // Context7 pattern: require email verification
        }
      });

      // Generate token
      const token = generateToken({
        userId: user.id,
        email: user.email
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      console.log('✅ User registered successfully with complete profile:', user.id);

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
    updateData: UpdateProfileData
  ): Promise<ProfileResponse> {
    try {
      console.log('🔄 Updating user profile:', { userId, updateData });

      // Validate user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!existingUser) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Update user profile with Context7 pattern
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
          emailVerified: true,
          createdAt: true,
          updatedAt: true
        }
      });

      console.log('✅ Profile updated successfully:', user.id);

      return {
        success: true,
        message: 'Profile updated successfully',
        user
      };
    } catch (error) {
      console.error('❌ Update user profile error:', error);
      return {
        success: false,
        message: 'Failed to update profile. Please try again.'
      };
    }
  }

  static async deleteUser(userId: string, password: string): Promise<DeleteAccountResponse> {
    try {
      console.log('🗑️ Attempting to delete user account:', userId);

      // Get user with password for verification
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Verify password before deletion (Context7 security pattern)
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        console.log('❌ Invalid password for account deletion');
        return {
          success: false,
          message: 'Invalid password. Account deletion failed.'
        };
      }

      // Delete user account
      await prisma.user.delete({
        where: { id: userId }
      });

      console.log('✅ User account deleted successfully:', userId);

      return {
        success: true,
        message: 'Account deleted successfully'
      };
    } catch (error) {
      console.error('❌ Delete user error:', error);
      return {
        success: false,
        message: 'Failed to delete account. Please try again.'
      };
    }
  }
}