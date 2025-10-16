'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  location?: string;
  website?: string;
  timezone?: string;
  language?: string;
  company?: string;
  jobTitle?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (email: string, name: string, password: string, confirmPassword: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<AuthResponse>;
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
          
          // Verify token with backend
          const response = await fetch(`${API_BASE_URL}/api/v1/auth/verify`, {
            headers: {
              'Authorization': `Bearer ${savedToken}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.user) {
              setUser(data.user);
            } else {
              // Token is invalid, clear it
              localStorage.removeItem('auth-token');
              setToken(null);
            }
          } else {
            // Token verification failed, clear it
            localStorage.removeItem('auth-token');
            setToken(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('auth-token');
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      console.log('🔐 Making login request to:', `${API_BASE_URL}/api/v1/auth/login`);
      console.log('📧 Email:', email);
      
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      console.log('📊 Login response status:', response.status);
      console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Login response error:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          const errorMessage = errorData.message || `Server error: ${response.status}`;
          
          // Context7-inspired error categorization
          if (response.status === 401) {
            console.error('🔒 Authentication failed - Invalid credentials');
          } else if (response.status >= 500) {
            console.error('🚨 Server error detected');
          } else {
            console.error('⚠️ Client error:', errorMessage);
          }
          
          return {
            success: false,
            message: errorMessage,
          };
        } catch (parseError) {
          console.error('💥 Failed to parse error response:', parseError);
          return {
            success: false,
            message: `Server error: ${response.status} - ${errorText}`,
          };
        }
      }

      const data: AuthResponse = await response.json();
      console.log('✅ Login response data:', { 
        success: data.success, 
        hasUser: !!data.user, 
        hasToken: !!data.token,
        message: data.message 
      });

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

  const register = async (
    email: string,
    name: string,
    password: string,
    confirmPassword: string
  ): Promise<AuthResponse> => {
    try {
      console.log('📝 Making registration request to:', `${API_BASE_URL}/api/v1/auth/register`);
      console.log('📋 Request data:', { email, name, password: '***', confirmPassword: '***' });
      
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, name, password, confirmPassword }),
      });

      console.log('📊 Registration response status:', response.status);
      console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Registration response error:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          const errorMessage = errorData.message || `Server error: ${response.status}`;
          
          // Context7-inspired error categorization for registration
          if (response.status === 400) {
            if (errorMessage.includes('already exists')) {
              console.error('👤 User already exists - suggesting login instead');
            } else {
              console.error('📝 Registration validation failed');
            }
          } else if (response.status >= 500) {
            console.error('🚨 Server error during registration');
          } else {
            console.error('⚠️ Registration client error:', errorMessage);
          }
          
          return {
            success: false,
            message: errorMessage,
          };
        } catch (parseError) {
          console.error('💥 Failed to parse registration error response:', parseError);
          return {
            success: false,
            message: `Server error: ${response.status} - ${errorText}`,
          };
        }
      }

      const data: AuthResponse = await response.json();
      console.log('✅ Registration response data:', { 
        success: data.success, 
        hasUser: !!data.user, 
        hasToken: !!data.token,
        message: data.message 
      });

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
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<AuthResponse> => {
    try {
      if (!token) {
        return {
          success: false,
          message: 'Not authenticated',
        };
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

      const result: AuthResponse = await response.json();

      if (result.success && result.user) {
        setUser(result.user);
      }

      return result;
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        message: 'Network error occurred during profile update',
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
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}