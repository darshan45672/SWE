/**
 * Socket.IO Server Configuration
 * Handles real-time chat functionality for project workspaces
 */

import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyToken, JwtPayload } from '../auth/jwt';
import prisma from '../lib/prisma';
import aiService, { AIService } from '../services/ai.js';
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
          select: { id: true, name: true, workspaceId: true },
        });

        if (!project) {
          callback?.({ success: false, error: 'Project not found or access denied' });
          return;
        }

        // Check if message mentions AI - DISABLED
        // const isAIMention = AIService.isAIMention(content);

        // Save user message to database
        const userMessage = await prisma.message.create({
          data: {
            content: content.trim(),
            senderId: socket.data.userId,
            projectId: projectId,
            isAIMessage: false,
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

        // Format user message data
        const userMessageData: ChatMessageData = {
          id: userMessage.id,
          content: userMessage.content,
          senderId: userMessage.senderId,
          sender: {
            id: userMessage.sender.id,
            name: userMessage.sender.name,
            email: userMessage.sender.email,
            avatar: userMessage.sender.avatar || undefined,
          },
          projectId: userMessage.projectId,
          isAIMessage: false,
          createdAt: userMessage.createdAt,
          updatedAt: userMessage.updatedAt,
        };

        // Broadcast user message to all users in the project room (including sender)
        io.to(`project:${projectId}`).emit('message:new', userMessageData);

        console.log(`💬 Message sent by ${socket.data.userName} in project ${projectId}`);

        callback?.({ success: true, message: userMessageData });

        /* AI FUNCTIONALITY DISABLED
        // Handle AI mention
        if (isAIMention && aiService.isAvailable()) {
          console.log(`🤖 AI mentioned by ${socket.data.userName}`);
          
          // Emit typing indicator for AI
          io.to(`project:${projectId}`).emit('ai:typing', {
            projectId,
            isTyping: true,
          });

          try {
            // Extract the actual message without @AI
            const aiQuery = AIService.extractMessage(content);

            // Generate AI response
            const aiResponse = await aiService.generateResponse({
              message: aiQuery,
              projectId: project.id,
              workspaceId: project.workspaceId,
              userId: socket.data.userId,
              userName: socket.data.userName,
            });

            // Save AI response to database
            const aiMessage = await prisma.message.create({
              data: {
                content: aiResponse.content,
                senderId: socket.data.userId, // AI uses the same user for tracking
                projectId: projectId,
                isAIMessage: true,
                aiContext: aiResponse.context,
                parentMessageId: userMessage.id,
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

            // Format AI message data
            const aiMessageData: ChatMessageData = {
              id: aiMessage.id,
              content: aiMessage.content,
              senderId: aiMessage.senderId,
              sender: {
                id: 'ai',
                name: 'AI Assistant',
                email: 'ai@assistant.com',
                avatar: undefined,
              },
              projectId: aiMessage.projectId,
              isAIMessage: true,
              aiContext: aiResponse.context,
              parentMessageId: userMessage.id,
              createdAt: aiMessage.createdAt,
              updatedAt: aiMessage.updatedAt,
            };

            // Stop typing indicator
            io.to(`project:${projectId}`).emit('ai:typing', {
              projectId,
              isTyping: false,
            });

            // Broadcast AI response
            io.to(`project:${projectId}`).emit('message:new', aiMessageData);

            console.log(`🤖 AI responded in project ${projectId}`);
          } catch (error) {
            console.error('Error generating AI response:', error);
            
            // Stop typing indicator
            io.to(`project:${projectId}`).emit('ai:typing', {
              projectId,
              isTyping: false,
            });

            // Send error message
            const errorMessage = await prisma.message.create({
              data: {
                content: 'Sorry, I encountered an error processing your request. Please try again.',
                senderId: socket.data.userId,
                projectId: projectId,
                isAIMessage: true,
                parentMessageId: userMessage.id,
              },
              include: {
                sender: {
                  select: { id: true, name: true, email: true, avatar: true },
                },
              },
            });

            const errorMessageData: ChatMessageData = {
              id: errorMessage.id,
              content: errorMessage.content,
              senderId: errorMessage.senderId,
              sender: {
                id: 'ai',
                name: 'AI Assistant',
                email: 'ai@assistant.com',
                avatar: undefined,
              },
              projectId: errorMessage.projectId,
              isAIMessage: true,
              parentMessageId: userMessage.id,
              createdAt: errorMessage.createdAt,
              updatedAt: errorMessage.updatedAt,
            };

            io.to(`project:${projectId}`).emit('message:new', errorMessageData);
          }
        } else if (isAIMention && !aiService.isAvailable()) {
          // AI service not available
          const notAvailableMessage = await prisma.message.create({
            data: {
              content: 'AI features are currently unavailable. Please contact your administrator to configure the AI service.',
              senderId: socket.data.userId,
              projectId: projectId,
              isAIMessage: true,
              parentMessageId: userMessage.id,
            },
            include: {
              sender: {
                select: { id: true, name: true, email: true, avatar: true },
              },
            },
          });

          const notAvailableMessageData: ChatMessageData = {
            id: notAvailableMessage.id,
            content: notAvailableMessage.content,
            senderId: notAvailableMessage.senderId,
            sender: {
              id: 'ai',
              name: 'AI Assistant',
              email: 'ai@assistant.com',
              avatar: undefined,
            },
            projectId: notAvailableMessage.projectId,
            isAIMessage: true,
            parentMessageId: userMessage.id,
            createdAt: notAvailableMessage.createdAt,
            updatedAt: notAvailableMessage.updatedAt,
          };

          io.to(`project:${projectId}`).emit('message:new', notAvailableMessageData);
        }
        */ // END AI FUNCTIONALITY DISABLED
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
