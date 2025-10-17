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
  // 2FA fields
  requires2FA?: boolean;
  userId?: string;
  // Email verification fields
  requiresVerification?: boolean;
  email?: string;
}

export class AuthService {
  static async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Context7 Debug Pattern: Log incoming data for analysis
      console.log('🔍 Context7 Registration Debug - Incoming data:', {
        email: data.email,
        name: data.name,
        hasPassword: !!data.password,
        hasConfirmPassword: !!data.confirmPassword,
        acceptTerms: data.acceptTerms,
        // Extended profile fields
        avatar: data.avatar || 'undefined',
        bio: data.bio || 'undefined', 
        phone: data.phone || 'undefined',
        location: data.location || 'undefined',
        website: data.website || 'undefined',
        company: data.company || 'undefined',
        jobTitle: data.jobTitle || 'undefined',
        timezone: data.timezone || 'undefined',
        language: data.language || 'undefined'
      });

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

      // Context7 Security Pattern: Enhanced validation
      if (!email || !name || !password) {
        return {
          success: false,
          message: 'Required fields (email, name, password) are missing'
        };
      }

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

      // Context7 Data Preparation Pattern: Prepare user data for database
      const userData = {
        email,
        name,
        password: hashedPassword,
        avatar: avatar || undefined,
        bio: bio || undefined,
        phone: phone || undefined,
        location: location || undefined,
        website: website || undefined,
        company: company || undefined,
        jobTitle: jobTitle || undefined,
        timezone: timezone || undefined,
        language: language || "en",
        emailVerified: false // Email verification required - user must verify email before full access
      };

      console.log('🔍 Context7 Database Debug - Data being saved:', {
        ...userData,
        password: '*** HIDDEN ***'
      });

      // Create user with all profile data
      const user = await prisma.user.create({
        data: userData
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

      // Check if email is verified
      if (!user.emailVerified) {
        return {
          success: false,
          message: 'Please verify your email address to continue',
          requiresVerification: true,
          email: user.email
        };
      }

      // Check if 2FA is enabled
      if (user.twoFactorEnabled) {
        return {
          success: true,
          message: '2FA verification required',
          requires2FA: true,
          userId: user.id
        };
      }

      // Generate token (normal login without 2FA)
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
          emailVerified: true,
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

      // Check if email is being updated and if it's already in use
      if (updateData.email && updateData.email !== existingUser.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email: updateData.email }
        });

        if (emailExists) {
          return {
            success: false,
            message: 'Email address is already in use'
          };
        }
      }

      // Context7 pattern: Clean empty optional fields
      const cleanedData: any = {};
      Object.keys(updateData).forEach(key => {
        const value = updateData[key as keyof UpdateProfileData];
        if (value !== undefined && value !== '') {
          cleanedData[key] = value;
        } else if (value === '') {
          cleanedData[key] = null; // Set to null for empty strings
        }
      });

      // Update user profile with Context7 pattern
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          ...cleanedData,
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

      return {
        success: true,
        message: 'Profile updated successfully',
        user
      };
    } catch (error) {
      console.error('Update user profile error:', error);
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