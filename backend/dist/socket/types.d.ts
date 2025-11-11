/**
 * Socket.IO TypeScript Type Definitions
 * Provides type-safe event handling for real-time chat
 */
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
export interface TypingData {
    userId: string;
    userName: string;
    projectId: string;
}
export interface UserPresenceData {
    userId: string;
    userName: string;
    projectId: string;
}
export interface NotificationData {
    id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    actorId: string;
    recipientId: string;
    issueId?: string | null;
    link?: string | null;
    createdAt: Date;
    updatedAt?: Date;
    actor: {
        id: string;
        name: string;
        email: string;
        avatar?: string | null;
    };
    issue?: {
        id: string;
        title: string;
        status: string;
    } | null;
}
export interface ServerToClientEvents {
    'message:new': (message: ChatMessageData) => void;
    'message:deleted': (messageId: string, projectId: string) => void;
    'user:typing': (data: TypingData) => void;
    'user:stop-typing': (data: TypingData) => void;
    'user:joined': (data: UserPresenceData) => void;
    'user:left': (data: UserPresenceData) => void;
    'ai:typing': (data: {
        projectId: string;
        isTyping: boolean;
    }) => void;
    'connection:success': (data: {
        userId: string;
        socketId: string;
    }) => void;
    'notification': (notification: NotificationData) => void;
    'error': (error: {
        message: string;
        code?: string;
    }) => void;
}
export interface ClientToServerEvents {
    'project:join': (projectId: string, callback?: (response: {
        success: boolean;
        error?: string;
    }) => void) => void;
    'project:leave': (projectId: string) => void;
    'message:send': (data: {
        projectId: string;
        content: string;
    }, callback?: (response: {
        success: boolean;
        message?: ChatMessageData;
        error?: string;
    }) => void) => void;
    'typing:start': (projectId: string) => void;
    'typing:stop': (projectId: string) => void;
}
export interface SocketData {
    userId: string;
    userEmail: string;
    userName: string;
    currentProjects: Set<string>;
}
export interface InterServerEvents {
    ping: () => void;
}
//# sourceMappingURL=types.d.ts.map