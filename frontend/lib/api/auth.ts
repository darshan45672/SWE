// Auth API functions - Context7 pattern
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UpdatePasswordResponse {
  success: boolean;
  message: string;
}

/**
 * Update user password
 * Context7 pattern: Secure password update with current password verification
 */
export async function updatePassword(
  data: UpdatePasswordData,
  token: string
): Promise<UpdatePasswordResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/password`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Failed to update password',
      };
    }

    return result;
  } catch (error) {
    console.error('Update password API error:', error);
    return {
      success: false,
      message: 'Network error. Please check your connection and try again.',
    };
  }
}

export interface ForgotPasswordData {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

/**
 * Request password reset
 * Context7 pattern: Send reset email without revealing if user exists (security)
 */
export async function forgotPassword(
  data: ForgotPasswordData
): Promise<ForgotPasswordResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Failed to send reset email',
      };
    }

    return result;
  } catch (error) {
    console.error('Forgot password API error:', error);
    return {
      success: false,
      message: 'Network error. Please check your connection and try again.',
    };
  }
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

/**
 * Reset password with token
 * Context7 pattern: Validate token and update password
 */
export async function resetPassword(
  data: ResetPasswordData
): Promise<ResetPasswordResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Failed to reset password',
      };
    }

    return result;
  } catch (error) {
    console.error('Reset password API error:', error);
    return {
      success: false,
      message: 'Network error. Please check your connection and try again.',
    };
  }
}
