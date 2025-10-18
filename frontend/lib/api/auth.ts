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
