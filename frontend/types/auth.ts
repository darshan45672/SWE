// Authentication type definitions

export interface SignInFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  // Basic Information
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  
  // Extended Profile Information (optional)
  avatar?: string;
  bio?: string;
  phone?: string;
  location?: string;
  website?: string;
  company?: string;
  jobTitle?: string;
  timezone?: string;
  language?: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
  token?: string;
}

export interface VerifyEmailFormData {
  code: string;
}

export interface UpdateProfileFormData {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export interface DeleteAccountFormData {
  password: string;
  confirmDeletion: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
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
  message?: string;
  error?: string;
  user?: User;
  token?: string;
}

export interface ProfileResponse {
  success: boolean;
  message?: string;
  error?: string;
  user?: User;
}

export interface DeleteAccountResponse {
  success: boolean;
  message?: string;
  error?: string;
}
