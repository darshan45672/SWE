/**
 * Socket.IO Context Provider
 * Manages WebSocket connection with authentication for real-time chat
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './auth-context';

// Message type (matches backend)
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

// Typing indicator
export interface TypingUser {
  userId: string;
  userName: string;
}

// Socket context type
interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinProject: (projectId: string) => Promise<boolean>;
  leaveProject: (projectId: string) => void;
  sendMessage: (projectId: string, content: string) => Promise<boolean>;
  startTyping: (projectId: string) => void;
  stopTyping: (projectId: string) => void;
  onNewMessage: (callback: (message: ChatMessage) => void) => () => void;
  onMessageDeleted: (callback: (messageId: string, projectId: string) => void) => () => void;
  onUserTyping: (callback: (data: TypingUser & { projectId: string }) => void) => () => void;
  onUserStopTyping: (callback: (data: TypingUser & { projectId: string }) => void) => () => void;
  onUserJoined: (callback: (data: TypingUser & { projectId: string }) => void) => () => void;
  onUserLeft: (callback: (data: TypingUser & { projectId: string }) => void) => () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, token } = useAuth();

  // Initialize socket connection
  useEffect(() => {
    if (!user || !token) {
      // Disconnect if user logs out
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Create socket connection
    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
      auth: {
        token,
      },
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    // Connection events
    socketInstance.on('connect', () => {
      console.log('✅ Socket.IO connected:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Socket.IO disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connection:success', (data) => {
      console.log('🎉 Connection confirmed:', data);
    });

    socketInstance.on('error', (error) => {
      console.error('❌ Socket.IO error:', error);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('❌ Connection error:', error.message);
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, [user, token]);

  // Join a project room
  const joinProject = useCallback(
    (projectId: string): Promise<boolean> => {
      return new Promise((resolve) => {
        if (!socket || !isConnected) {
          console.warn('Socket not connected');
          resolve(false);
          return;
        }

        socket.emit('project:join', projectId, (response: { success: boolean; error?: string }) => {
          if (response.success) {
            console.log(`✅ Joined project: ${projectId}`);
            resolve(true);
          } else {
            console.error(`❌ Failed to join project: ${response.error}`);
            resolve(false);
          }
        });
      });
    },
    [socket, isConnected]
  );

  // Leave a project room
  const leaveProject = useCallback(
    (projectId: string) => {
      if (!socket || !isConnected) return;
      socket.emit('project:leave', projectId);
      console.log(`👋 Left project: ${projectId}`);
    },
    [socket, isConnected]
  );

  // Send a message
  const sendMessage = useCallback(
    (projectId: string, content: string): Promise<boolean> => {
      return new Promise((resolve) => {
        if (!socket || !isConnected) {
          console.warn('Socket not connected');
          resolve(false);
          return;
        }

        socket.emit(
          'message:send',
          { projectId, content },
          (response: { success: boolean; message?: ChatMessage; error?: string }) => {
            if (response.success) {
              console.log('✅ Message sent');
              resolve(true);
            } else {
              console.error(`❌ Failed to send message: ${response.error}`);
              resolve(false);
            }
          }
        );
      });
    },
    [socket, isConnected]
  );

  // Start typing indicator
  const startTyping = useCallback(
    (projectId: string) => {
      if (!socket || !isConnected) return;
      socket.emit('typing:start', projectId);
    },
    [socket, isConnected]
  );

  // Stop typing indicator
  const stopTyping = useCallback(
    (projectId: string) => {
      if (!socket || !isConnected) return;
      socket.emit('typing:stop', projectId);
    },
    [socket, isConnected]
  );

  // Event listeners
  const onNewMessage = useCallback(
    (callback: (message: ChatMessage) => void) => {
      if (!socket) return () => {};
      socket.on('message:new', callback);
      return () => {
        socket.off('message:new', callback);
      };
    },
    [socket]
  );

  const onMessageDeleted = useCallback(
    (callback: (messageId: string, projectId: string) => void) => {
      if (!socket) return () => {};
      socket.on('message:deleted', callback);
      return () => {
        socket.off('message:deleted', callback);
      };
    },
    [socket]
  );

  const onUserTyping = useCallback(
    (callback: (data: TypingUser & { projectId: string }) => void) => {
      if (!socket) return () => {};
      socket.on('user:typing', callback);
      return () => {
        socket.off('user:typing', callback);
      };
    },
    [socket]
  );

  const onUserStopTyping = useCallback(
    (callback: (data: TypingUser & { projectId: string }) => void) => {
      if (!socket) return () => {};
      socket.on('user:stop-typing', callback);
      return () => {
        socket.off('user:stop-typing', callback);
      };
    },
    [socket]
  );

  const onUserJoined = useCallback(
    (callback: (data: TypingUser & { projectId: string }) => void) => {
      if (!socket) return () => {};
      socket.on('user:joined', callback);
      return () => {
        socket.off('user:joined', callback);
      };
    },
    [socket]
  );

  const onUserLeft = useCallback(
    (callback: (data: TypingUser & { projectId: string }) => void) => {
      if (!socket) return () => {};
      socket.on('user:left', callback);
      return () => {
        socket.off('user:left', callback);
      };
    },
    [socket]
  );

  const value: SocketContextType = {
    socket,
    isConnected,
    joinProject,
    leaveProject,
    sendMessage,
    startTyping,
    stopTyping,
    onNewMessage,
    onMessageDeleted,
    onUserTyping,
    onUserStopTyping,
    onUserJoined,
    onUserLeft,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

// Hook to use socket context
export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
