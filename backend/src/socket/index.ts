/**
 * Socket.IO Server Configuration
 * Handles real-time chat functionality for project workspaces
 */

import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyToken, JwtPayload } from '../auth/jwt';
import prisma from '../lib/prisma';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
  ChatMessageData,
} from './types';

// Type-safe Socket.IO Server
export type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export type TypedServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

let io: TypedServer;

/**
 * Initialize Socket.IO server with Express HTTP server
 */
export function initializeSocket(httpServer: HttpServer): TypedServer {
  io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware
  io.use(async (socket: TypedSocket, next) => {
    try {
      // Extract token from handshake auth or cookie
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.cookie
          ?.split('; ')
          .find((c) => c.startsWith('auth-token='))
          ?.split('=')[1];

      if (!token) {
        return next(new Error('Authentication required'));
      }

      // Verify token
      const decoded: JwtPayload = verifyToken(token);

      // Fetch user data
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, name: true, emailVerified: true },
      });

      if (!user || !user.emailVerified) {
        return next(new Error('User not found or not verified'));
      }

      // Store user data in socket
      socket.data.userId = user.id;
      socket.data.userEmail = user.email;
      socket.data.userName = user.name;
      socket.data.currentProjects = new Set<string>();

      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', (socket: TypedSocket) => {
    console.log(`✅ User connected: ${socket.data.userName} (${socket.id})`);

    // Send connection confirmation
    socket.emit('connection:success', {
      userId: socket.data.userId,
      socketId: socket.id,
    });

    /**
     * Join a project room
     */
    socket.on('project:join', async (projectId, callback) => {
      try {
        // Verify user has access to this project
        const workspace = await prisma.project.findFirst({
          where: {
            id: projectId,
            workspace: {
              members: {
                some: {
                  userId: socket.data.userId,
                },
              },
            },
          },
          select: { id: true, name: true, workspaceId: true },
        });

        if (!workspace) {
          callback?.({ success: false, error: 'Project not found or access denied' });
          return;
        }

        // Join the project room
        await socket.join(`project:${projectId}`);
        socket.data.currentProjects.add(projectId);

        console.log(
          `👤 ${socket.data.userName} joined project: ${workspace.name} (${projectId})`
        );

        // Notify others in the room
        socket.to(`project:${projectId}`).emit('user:joined', {
          userId: socket.data.userId,
          userName: socket.data.userName,
          projectId,
        });

        callback?.({ success: true });
      } catch (error) {
        console.error('Error joining project:', error);
        callback?.({ success: false, error: 'Failed to join project' });
      }
    });

    /**
     * Leave a project room
     */
    socket.on('project:leave', (projectId) => {
      socket.leave(`project:${projectId}`);
      socket.data.currentProjects.delete(projectId);

      console.log(`👋 ${socket.data.userName} left project: ${projectId}`);

      // Notify others in the room
      socket.to(`project:${projectId}`).emit('user:left', {
        userId: socket.data.userId,
        userName: socket.data.userName,
        projectId,
      });
    });

    /**
     * Send a chat message
     */
    socket.on('message:send', async (data, callback) => {
      try {
        const { projectId, content } = data;

        // Validate input
        if (!content || content.trim().length === 0) {
          callback?.({ success: false, error: 'Message content is required' });
          return;
        }

        if (content.length > 5000) {
          callback?.({ success: false, error: 'Message too long (max 5000 characters)' });
          return;
        }

        // Verify user has access to project
        const project = await prisma.project.findFirst({
          where: {
            id: projectId,
            workspace: {
              members: {
                some: {
                  userId: socket.data.userId,
                },
              },
            },
          },
        });

        if (!project) {
          callback?.({ success: false, error: 'Project not found or access denied' });
          return;
        }

        // Save message to database
        const message = await prisma.message.create({
          data: {
            content: content.trim(),
            senderId: socket.data.userId,
            projectId: projectId,
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        });

        // Format message data
        const messageData: ChatMessageData = {
          id: message.id,
          content: message.content,
          senderId: message.senderId,
          sender: {
            id: message.sender.id,
            name: message.sender.name,
            email: message.sender.email,
            avatar: message.sender.avatar || undefined,
          },
          projectId: message.projectId,
          createdAt: message.createdAt,
          updatedAt: message.updatedAt,
        };

        // Broadcast to all users in the project room (including sender)
        io.to(`project:${projectId}`).emit('message:new', messageData);

        console.log(`💬 Message sent by ${socket.data.userName} in project ${projectId}`);

        callback?.({ success: true, message: messageData });
      } catch (error) {
        console.error('Error sending message:', error);
        callback?.({ success: false, error: 'Failed to send message' });
      }
    });

    /**
     * User started typing
     */
    socket.on('typing:start', (projectId) => {
      socket.to(`project:${projectId}`).emit('user:typing', {
        userId: socket.data.userId,
        userName: socket.data.userName,
        projectId,
      });
    });

    /**
     * User stopped typing
     */
    socket.on('typing:stop', (projectId) => {
      socket.to(`project:${projectId}`).emit('user:stop-typing', {
        userId: socket.data.userId,
        userName: socket.data.userName,
        projectId,
      });
    });

    /**
     * Handle disconnect
     */
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.data.userName} (${socket.id})`);

      // Notify all project rooms the user was in
      socket.data.currentProjects.forEach((projectId) => {
        socket.to(`project:${projectId}`).emit('user:left', {
          userId: socket.data.userId,
          userName: socket.data.userName,
          projectId,
        });
      });
    });
  });

  return io;
}

/**
 * Get Socket.IO server instance
 */
export function getIO(): TypedServer {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}

/**
 * Emit message deletion event
 * Called from REST API when a message is deleted
 */
export function emitMessageDeleted(messageId: string, projectId: string): void {
  if (io) {
    io.to(`project:${projectId}`).emit('message:deleted', messageId, projectId);
  }
}
