/**
 * Chat API Utilities
 * REST API functions for fetching and managing chat messages
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  sender: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FetchMessagesOptions {
  limit?: number;
  before?: string; // ISO timestamp
}

export interface FetchMessagesResponse {
  messages: ChatMessage[];
  hasMore: boolean;
}

/**
 * Fetch messages for a project
 */
export async function fetchProjectMessages(
  projectId: string,
  options: FetchMessagesOptions = {}
): Promise<FetchMessagesResponse> {
  try {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.before) params.append('before', options.before);

    const url = `${API_BASE_URL}/api/v1/chat/projects/${projectId}/messages${
      params.toString() ? `?${params.toString()}` : ''
    }`;

    const response = await fetch(url, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch messages: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Convert date strings to Date objects
    data.messages = data.messages.map((msg: any) => ({
      ...msg,
      createdAt: new Date(msg.createdAt),
      updatedAt: new Date(msg.updatedAt),
    }));

    return data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
}

/**
 * Delete a message
 */
export async function deleteMessage(messageId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/chat/messages/${messageId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete message');
    }
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
}

/**
 * Get message count for a project
 */
export async function getMessageCount(projectId: string): Promise<number> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/chat/projects/${projectId}/count`,
      {
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get message count: ${response.statusText}`);
    }

    const data = await response.json();
    return data.count;
  } catch (error) {
    console.error('Error getting message count:', error);
    throw error;
  }
}
