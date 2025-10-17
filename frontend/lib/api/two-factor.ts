/**
 * Two-Factor Authentication API Service
 * Handles all 2FA-related API calls to the backend
 */

import type {
  TwoFactorSetupResponse,
  TwoFactorEnableRequest,
  TwoFactorEnableResponse,
  TwoFactorDisableRequest,
  TwoFactorDisableResponse,
  TwoFactorVerifyRequest,
  TwoFactorVerifyResponse,
  TwoFactorStatusResponse,
  TwoFactorRegenerateCodesRequest,
  TwoFactorRegenerateCodesResponse,
} from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Get authentication headers with token
 */
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('auth-token');
  if (!token) {
    console.warn('No auth token found in localStorage');
  }
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

/**
 * Get 2FA status for current user
 * GET /api/v1/2fa/status
 */
export async function get2FAStatus(): Promise<TwoFactorStatusResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/2fa/status`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to get 2FA status',
      };
    }

    return data;
  } catch (error) {
    console.error('Get 2FA status error:', error);
    return {
      success: false,
      error: 'Network error. Please try again.',
    };
  }
}

/**
 * Setup 2FA - Generate secret and QR code
 * POST /api/v1/2fa/setup
 */
export async function setup2FA(): Promise<TwoFactorSetupResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/2fa/setup`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to setup 2FA',
      };
    }

    return data;
  } catch (error) {
    console.error('Setup 2FA error:', error);
    return {
      success: false,
      error: 'Network error. Please try again.',
    };
  }
}

/**
 * Enable 2FA - Verify token and activate
 * POST /api/v1/2fa/enable
 */
export async function enable2FA(
  requestData: TwoFactorEnableRequest
): Promise<TwoFactorEnableResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/2fa/enable`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(requestData),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to enable 2FA',
      };
    }

    return data;
  } catch (error) {
    console.error('Enable 2FA error:', error);
    return {
      success: false,
      error: 'Network error. Please try again.',
    };
  }
}

/**
 * Disable 2FA - Requires password verification
 * POST /api/v1/2fa/disable
 */
export async function disable2FA(
  requestData: TwoFactorDisableRequest
): Promise<TwoFactorDisableResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/2fa/disable`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(requestData),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to disable 2FA',
      };
    }

    return data;
  } catch (error) {
    console.error('Disable 2FA error:', error);
    return {
      success: false,
      error: 'Network error. Please try again.',
    };
  }
}

/**
 * Verify 2FA code during login
 * POST /api/v1/2fa/verify
 */
export async function verify2FA(
  requestData: TwoFactorVerifyRequest
): Promise<TwoFactorVerifyResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/2fa/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Invalid verification code',
      };
    }

    return data;
  } catch (error) {
    console.error('Verify 2FA error:', error);
    return {
      success: false,
      error: 'Network error. Please try again.',
    };
  }
}

/**
 * Regenerate backup codes - Requires password verification
 * POST /api/v1/2fa/regenerate-backup-codes
 */
export async function regenerateBackupCodes(
  requestData: TwoFactorRegenerateCodesRequest
): Promise<TwoFactorRegenerateCodesResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/2fa/regenerate-backup-codes`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(requestData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to regenerate backup codes',
      };
    }

    return data;
  } catch (error) {
    console.error('Regenerate backup codes error:', error);
    return {
      success: false,
      error: 'Network error. Please try again.',
    };
  }
}
