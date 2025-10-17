/**
 * Socket.IO TypeScript Type Definitions
 * Provides type-safe event handling for real-time chat
 */

// Message data structure sent over Socket.IO
export interface ChatMessageData {
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
  isAIMessage?: boolean;
  aiContext?: any;
  parentMessageId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Typing indicator data
export interface TypingData {
  userId: string;
  userName: string;
  projectId: string;
}

// User joined/left project room data
export interface UserPresenceData {
  userId: string;
  userName: string;
  projectId: string;
}

// Events sent from server to client
export interface ServerToClientEvents {
  // New message received
  'message:new': (message: ChatMessageData) => void;
  
  // Message was deleted
  'message:deleted': (messageId: string, projectId: string) => void;
  
  // User started typing
  'user:typing': (data: TypingData) => void;
  
  // User stopped typing
  'user:stop-typing': (data: TypingData) => void;
  
  // User joined project room
  'user:joined': (data: UserPresenceData) => void;
  
  // User left project room
  'user:left': (data: UserPresenceData) => void;
  
  // AI is typing
  'ai:typing': (data: { projectId: string; isTyping: boolean }) => void;
  
  // Connection established confirmation
  'connection:success': (data: { userId: string; socketId: string }) => void;
  
  // Error occurred
  'error': (error: { message: string; code?: string }) => void;
}

// Events sent from client to server
export interface ClientToServerEvents {
  // Join a project room
  'project:join': (projectId: string, callback?: (response: { success: boolean; error?: string }) => void) => void;
  
  // Leave a project room
  'project:leave': (projectId: string) => void;
  
  // Send a message
  'message:send': (data: { projectId: string; content: string }, callback?: (response: { success: boolean; message?: ChatMessageData; error?: string }) => void) => void;
  
  // User is typing
  'typing:start': (projectId: string) => void;
  
  // User stopped typing
  'typing:stop': (projectId: string) => void;
}

// Data stored with each socket
export interface SocketData {
  userId: string;
  userEmail: string;
  userName: string;
  currentProjects: Set<string>; // Project IDs the user is currently in
}

// Inter-server events (for scaling with multiple servers)
export interface InterServerEvents {
  ping: () => void;
}
