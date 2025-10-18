/**
 * Workspace Invitation API Functions
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

interface SendInvitationRequest {
  email: string;
  role: string; // "OWNER" | "ADMIN" | "MEMBER" | "VIEWER"
}

/**
 * Send invitation to join workspace
 * POST /api/v1/invitations/workspaces/:workspaceId/invite
 */
export async function sendInvitation(
  workspaceId: string,
  data: SendInvitationRequest
): Promise<ApiResponse> {
  try {
    const url = `${API_BASE_URL}/api/v1/invitations/workspaces/${workspaceId}/invite`;
    console.log("📤 Sending invitation to:", url, data);
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies for authentication
      body: JSON.stringify(data),
    });

    console.log("📥 Response status:", response.status);
    
    const result = await response.json();
    console.log("📥 Response body:", result);

    if (!response.ok) {
      return {
        success: false,
        message: result.message || "Failed to send invitation",
      };
    }

    return {
      success: true,
      message: result.message || "Invitation sent successfully",
      data: result.data,
    };
  } catch (error) {
    console.error("❌ Error sending invitation:", error);
    return {
      success: false,
      message: "Network error. Please try again.",
    };
  }
}
