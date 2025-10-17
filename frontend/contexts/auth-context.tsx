'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  SignInFormData, 
  RegisterFormData,
  AuthResponse,
  ProfileResponse,
  DeleteAccountResponse,
  UpdateProfileFormData,
  DeleteAccountFormData,
  AuthResponseWith2FA,
  TwoFactorSetupData,
  TwoFactorSetupResponse,
  TwoFactorStatusResponse,
  TwoFactorRegenerateCodesResponse,
} from '@/types/auth';
import { User } from '@/types/auth';
import * as twoFactorAPI from '@/lib/api/two-factor';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  requires2FA: boolean;
  pendingUserId: string | null;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (data: RegisterFormData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfileFormData) => Promise<ProfileResponse>;
  deleteAccount: (data: DeleteAccountFormData) => Promise<DeleteAccountResponse>;
  isAuthenticated: boolean;
  // 2FA methods
  verify2FA: (token: string, isBackupCode?: boolean) => Promise<AuthResponse>;
  get2FAStatus: () => Promise<TwoFactorStatusResponse>;
  setup2FA: () => Promise<TwoFactorSetupResponse>;
  enable2FA: (secret: string, token: string, backupCodes: string[]) => Promise<AuthResponse>;
  disable2FA: (password: string) => Promise<AuthResponse>;
  regenerateBackupCodes: (password: string) => Promise<TwoFactorRegenerateCodesResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): React.ReactElement {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [requires2FA, setRequires2FA] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = localStorage.getItem('auth-token');
        if (savedToken) {
          setToken(savedToken);
          
          // Context7 pattern: Add timeout to prevent hanging
          const controller = new AbortController();
          const timeoutId = setTimeout(() => {
            controller.abort();
          }, 5000); // 5 second timeout
          
          try {
            // Verify token with backend
            const response = await fetch(`${API_BASE_URL}/api/v1/auth/verify`, {
              headers: {
                'Authorization': `Bearer ${savedToken}`,
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (response.ok) {
              const data = await response.json();
              if (data.success && data.user) {
                setUser(data.user);
              } else {
                // Token is invalid or user not found, clear it
                localStorage.removeItem('auth-token');
                document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                setToken(null);
              }
            } else {
              // Token verification failed (401, 404, etc.), clear it
              localStorage.removeItem('auth-token');
              document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
              setToken(null);
            }
          } catch (fetchError: any) {
            clearTimeout(timeoutId);
            
            // Clear stale token on any error
            localStorage.removeItem('auth-token');
            document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            setToken(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('auth-token');
        document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        try {
          const errorData = JSON.parse(errorText);
          const errorMessage = errorData.message || `Server error: ${response.status}`;
          
          return {
            success: false,
            message: errorMessage,
          };
        } catch (parseError) {
          return {
            success: false,
            message: `Server error: ${response.status} - ${errorText}`,
          };
        }
      }

      const data: AuthResponseWith2FA = await response.json();

      // Check if 2FA is required
      if (data.success && data.requires2FA && data.userId) {
        setRequires2FA(true);
        setPendingUserId(data.userId);
        return {
          success: true,
          message: '2FA verification required',
        };
      }

      // Normal login flow (no 2FA)
      if (data.success && data.user && data.token) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('auth-token', data.token);
        
        // Also set a cookie for middleware
        document.cookie = `auth-token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
        
        // Reset 2FA state
        setRequires2FA(false);
        setPendingUserId(null);
      }

      return data;
    } catch (error) {
      console.error('Login network error:', error);
      return {
        success: false,
        message: 'Network error occurred during login. Please check your connection and try again.',
      };
    }
  };

  const register = async (formData: RegisterFormData): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        try {
          const errorData = JSON.parse(errorText);
          const errorMessage = errorData.message || `Server error: ${response.status}`;
          
          return {
            success: false,
            message: errorMessage,
          };
        } catch (parseError) {
          return {
            success: false,
            message: `Server error: ${response.status} - ${errorText}`,
          };
        }
      }

      const data: AuthResponse = await response.json();

      if (data.success && data.user && data.token) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('auth-token', data.token);
        
        // Also set a cookie for middleware
        document.cookie = `auth-token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
      }

      return data;
    } catch (error) {
      console.error('Registration network error:', error);
      return {
        success: false,
        message: 'Network error occurred during registration. Please check your connection and try again.',
      };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (token) {
        await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless of API call success
      setUser(null);
      setToken(null);
      localStorage.removeItem('auth-token');
      
      // Clear the cookie
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      // Redirect to sign-in page after logout
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/signin';
      }
    }
  };

  const updateProfile = async (data: UpdateProfileFormData): Promise<ProfileResponse> => {
    try {
      if (!token) {
        return {
          success: false,
          message: 'Not authenticated',
        };
      }

      // Context7 pattern: Log request in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Updating profile:', {
          url: `${API_BASE_URL}/api/v1/auth/profile`,
          hasToken: !!token,
          dataKeys: Object.keys(data),
        });
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      // Context7 pattern: Handle non-OK responses
      if (!response.ok) {
        const errorText = await response.text();
        
        // Log each value separately to avoid serialization issues
        console.error('Profile update HTTP error:');
        console.error('Status:', response.status);
        console.error('Status Text:', response.statusText);
        console.error('Response Body:', errorText);

        try {
          const errorData = JSON.parse(errorText);
          return {
            success: false,
            message: errorData.message || `Server error: ${response.status}`,
            ...errorData
          };
        } catch (parseError) {
          return {
            success: false,
            message: `Server error: ${response.status} - ${errorText}`,
          };
        }
      }

      // Context7 pattern: Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Invalid response type:', contentType);
        return {
          success: false,
          message: 'Server returned an invalid response',
        };
      }

      const result: ProfileResponse = await response.json();

      // Context7 pattern: Log success in development
      if (process.env.NODE_ENV === 'development') {
        if (result.success) {
          console.log('Profile update successful');
        } else {
          console.error('Profile update failed:', {
            status: response.status,
            message: result.message,
            errors: (result as any).errors
          });
        }
      }

      if (result.success && result.user) {
        setUser(result.user);
      }

      return result;
    } catch (error) {
      console.error('Update profile network error:', error);
      return {
        success: false,
        message: 'Network error occurred during profile update',
      };
    }
  };

  const deleteAccount = async (data: DeleteAccountFormData): Promise<DeleteAccountResponse> => {
    try {
      if (!token) {
        return {
          success: false,
          message: 'Not authenticated',
        };
      }

      if (!data.confirmDeletion) {
        return {
          success: false,
          message: 'Please confirm account deletion',
        };
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/auth/delete-account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ password: data.password }),
      });

      const result: DeleteAccountResponse = await response.json();

      if (result.success) {
        // Clear all auth state
        setUser(null);
        setToken(null);
        localStorage.removeItem('auth-token');
        document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }

      return result;
    } catch (error) {
      console.error('Delete account error:', error);
      return {
        success: false,
        message: 'Network error occurred during account deletion',
      };
    }
  };

  // 2FA Methods

  const verify2FA = async (token: string, isBackupCode: boolean = false): Promise<AuthResponse> => {
    try {
      if (!pendingUserId) {
        return {
          success: false,
          message: 'No pending 2FA verification',
        };
      }

      const response = await twoFactorAPI.verify2FA({
        userId: pendingUserId,
        token,
        isBackupCode,
      });

      if (response.success && response.user && response.token) {
        setUser(response.user);
        setToken(response.token);
        localStorage.setItem('auth-token', response.token);
        
        // Set cookie
        document.cookie = `auth-token=${response.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
        
        // Clear 2FA state
        setRequires2FA(false);
        setPendingUserId(null);
      }

      return response;
    } catch (error) {
      console.error('Verify 2FA error:', error);
      return {
        success: false,
        message: 'Failed to verify 2FA code',
      };
    }
  };

  const get2FAStatus = async (): Promise<TwoFactorStatusResponse> => {
    try {
      return await twoFactorAPI.get2FAStatus();
    } catch (error) {
      console.error('Get 2FA status error:', error);
      return {
        success: false,
        error: 'Failed to get 2FA status',
      };
    }
  };

  const setup2FA = async (): Promise<TwoFactorSetupResponse> => {
    try {
      return await twoFactorAPI.setup2FA();
    } catch (error) {
      console.error('Setup 2FA error:', error);
      return {
        success: false,
        error: 'Failed to setup 2FA',
      };
    }
  };

  const enable2FA = async (
    secret: string,
    verificationToken: string,
    backupCodes: string[]
  ): Promise<AuthResponse> => {
    try {
      const response = await twoFactorAPI.enable2FA({
        secret,
        token: verificationToken,
        backupCodes,
      });

      return {
        success: response.success,
        message: response.message || response.error,
      };
    } catch (error) {
      console.error('Enable 2FA error:', error);
      return {
        success: false,
        message: 'Failed to enable 2FA',
      };
    }
  };

  const disable2FA = async (password: string): Promise<AuthResponse> => {
    try {
      const response = await twoFactorAPI.disable2FA({ password });

      return {
        success: response.success,
        message: response.message || response.error,
      };
    } catch (error) {
      console.error('Disable 2FA error:', error);
      return {
        success: false,
        message: 'Failed to disable 2FA',
      };
    }
  };

  const regenerateBackupCodes = async (
    password: string
  ): Promise<TwoFactorRegenerateCodesResponse> => {
    try {
      return await twoFactorAPI.regenerateBackupCodes({ password });
    } catch (error) {
      console.error('Regenerate backup codes error:', error);
      return {
        success: false,
        error: 'Failed to regenerate backup codes',
      };
    }
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    requires2FA,
    pendingUserId,
    login,
    register,
    logout,
    updateProfile,
    deleteAccount,
    isAuthenticated: !!user && !!token,
    // 2FA methods
    verify2FA,
    get2FAStatus,
    setup2FA,
    enable2FA,
    disable2FA,
    regenerateBackupCodes,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}