'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  SignInFormData, 
  RegisterFormData,
  AuthResponse,
  ProfileResponse,
  DeleteAccountResponse,
  UpdateProfileFormData,
  DeleteAccountFormData
} from '@/types/auth';
import { User } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (data: RegisterFormData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfileFormData) => Promise<ProfileResponse>;
  deleteAccount: (data: DeleteAccountFormData) => Promise<DeleteAccountResponse>;
  isAuthenticated: boolean;
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

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    deleteAccount,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}