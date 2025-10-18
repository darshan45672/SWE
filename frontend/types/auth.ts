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
  // Basic Information
  name?: string;
  email?: string;
  bio?: string;
  
  // Contact Information
  phone?: string;
  location?: string;
  website?: string;
  
  // Professional Information
  company?: string;
  jobTitle?: string;
  
  // Preferences
  timezone?: string;
  language?: string;
  
  // Password Update (optional)
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  
  // Avatar Update (optional)
  avatar?: string;
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
  // Email verification fields
  requiresVerification?: boolean;
  email?: string;
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

// Two-Factor Authentication types

export interface TwoFactorSetupData {
  secret: string;
  qrCode: string; // Data URL for QR code image
  backupCodes: string[];
}

export interface TwoFactorSetupResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: TwoFactorSetupData;
}

export interface TwoFactorEnableRequest {
  secret: string;
  token: string;
  backupCodes: string[];
}

export interface TwoFactorEnableResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface TwoFactorDisableRequest {
  password: string;
}

export interface TwoFactorDisableResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface TwoFactorVerifyRequest {
  userId: string;
  token: string;
  isBackupCode?: boolean;
}

export interface TwoFactorVerifyResponse {
  success: boolean;
  message?: string;
  error?: string;
  token?: string;
  user?: User;
}

export interface TwoFactorStatusResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    enabled: boolean;
  };
}

export interface TwoFactorRegenerateCodesRequest {
  password: string;
}

export interface TwoFactorRegenerateCodesResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    backupCodes: string[];
  };
}

// Extended AuthResponse for 2FA flow
export interface AuthResponseWith2FA extends AuthResponse {
  requires2FA?: boolean;
  userId?: string;
}
