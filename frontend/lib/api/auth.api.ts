/**
 * Authentication API Service
 * Handles all authentication-related API calls
 */

import apiClient, { ApiResponse } from '../api-client';

// Auth Types (extending existing types)
export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  isEmailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface TwoFactorSetupResponse {
  secret: string;
  qrCode: string;
  backupCodes?: string[];
}

/**
 * Auth API Service
 */
export const authApi = {
  /**
   * Register a new user
   */
  async register(payload: RegisterPayload): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', payload);
    
    // Store tokens if registration successful
    if (response.data.success && response.data.data) {
      const { accessToken, refreshToken } = response.data.data.tokens;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  },

  /**
   * Login user
   */
  async login(payload: LoginPayload): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', payload);
    
    // Store tokens if login successful
    if (response.data.success && response.data.data) {
      const { accessToken, refreshToken } = response.data.data.tokens;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  },

  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse<void>> {
    const refreshToken = localStorage.getItem('refreshToken');
    
    try {
      const response = await apiClient.post<ApiResponse<void>>('/auth/logout', {
        refreshToken,
      });
      return response.data;
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<ApiResponse<AuthTokens>> {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await apiClient.post<ApiResponse<{ tokens: AuthTokens }>>('/auth/refresh', {
      refreshToken,
    });
    
    // Store new tokens
    if (response.data.success && response.data.data) {
      const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
    }
    
    return {
      success: response.data.success,
      data: response.data.data?.tokens,
      error: response.data.error,
    };
  },

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<ApiResponse<User>> {
    const response = await apiClient.post<ApiResponse<User>>('/auth/verify-email', {
      token,
    });
    
    // Update user in local storage
    if (response.data.success && response.data.data) {
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    
    return response.data;
  },

  /**
   * Enable 2FA
   */
  async enable2FA(): Promise<ApiResponse<TwoFactorSetupResponse>> {
    const response = await apiClient.post<ApiResponse<TwoFactorSetupResponse>>('/auth/2fa/enable');
    return response.data;
  },

  /**
   * Verify 2FA setup
   */
  async verify2FA(code: string): Promise<ApiResponse<{ user: User; backupCodes: string[] }>> {
    const response = await apiClient.post<ApiResponse<{ user: User; backupCodes: string[] }>>(
      '/auth/2fa/verify',
      { code }
    );
    
    // Update user in local storage
    if (response.data.success && response.data.data) {
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  },

  /**
   * Disable 2FA
   */
  async disable2FA(password: string): Promise<ApiResponse<User>> {
    const response = await apiClient.post<ApiResponse<User>>('/auth/2fa/disable', {
      password,
    });
    
    // Update user in local storage
    if (response.data.success && response.data.data) {
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    
    return response.data;
  },

  /**
   * Get current user from local storage
   */
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    
    const token = localStorage.getItem('accessToken');
    return !!token;
  },
};

export default authApi;
