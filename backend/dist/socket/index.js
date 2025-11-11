"use strict";
/**
 * Socket.IO Server Configuration
 * Handles real-time chat functionality for project workspaces
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSocket = initializeSocket;
exports.getIO = getIO;
exports.emitMessageDeleted = emitMessageDeleted;
const socket_io_1 = require("socket.io");
const jwt_1 = require("../auth/jwt");
const prisma_1 = __importDefault(require("../lib/prisma"));
const ai_js_1 = __importStar(require("../services/ai.js"));
let io;
/**
 * Initialize Socket.IO server with Express HTTP server
 */
function initializeSocket(httpServer) {
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true,
        },
        pingTimeout: 60000,
        pingInterval: 25000,
    });
    // Authentication middleware
    io.use(async (socket, next) => {
        try {
            // Extract token from handshake auth or cookie
            const token = socket.handshake.auth.token ||
                socket.handshake.headers.cookie
                    ?.split('; ')
                    .find((c) => c.startsWith('auth-token='))
                    ?.split('=')[1];
            if (!token) {
                return next(new Error('Authentication required'));
            }
            // Verify token
            const decoded = (0, jwt_1.verifyToken)(token);
            // Fetch user data
            const user = await prisma_1.default.user.findUnique({
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
            socket.data.currentProjects = new Set();
            next();
        }
        catch (error) {
            console.error('Socket authentication error:', error);
            next(new Error('Authentication failed'));
        }
    });
    // Connection handler
    io.on('connection', (socket) => {
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
                const workspace = await prisma_1.default.project.findFirst({
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
                console.log(`👤 ${socket.data.userName} joined project: ${workspace.name} (${projectId})`);
                // Notify others in the room
                socket.to(`project:${projectId}`).emit('user:joined', {
                    userId: socket.data.userId,
                    userName: socket.data.userName,
                    projectId,
                });
                callback?.({ success: true });
            }
            catch (error) {
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
                const project = await prisma_1.default.project.findFirst({
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
                // Check if message mentions AI
                const isAIMention = ai_js_1.AIService.isAIMention(content);
                // Save user message to database
                const userMessage = await prisma_1.default.message.create({
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
                const userMessageData = {
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
                // Handle AI mention
                if (isAIMention && ai_js_1.default.isAvailable()) {
                    console.log(`🤖 AI mentioned by ${socket.data.userName}`);
                    // Emit typing indicator for AI
                    io.to(`project:${projectId}`).emit('ai:typing', {
                        projectId,
                        isTyping: true,
                    });
                    try {
                        // Extract the actual message without @AI
                        const aiQuery = ai_js_1.AIService.extractMessage(content);
                        // Generate AI response
                        const aiResponse = await ai_js_1.default.generateResponse({
                            message: aiQuery,
                            projectId: project.id,
                            workspaceId: project.workspaceId,
                            userId: socket.data.userId,
                            userName: socket.data.userName,
                        });
                        // Save AI response to database
                        const aiMessage = await prisma_1.default.message.create({
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
                        const aiMessageData = {
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
                    }
                    catch (error) {
                        console.error('Error generating AI response:', error);
                        // Stop typing indicator
                        io.to(`project:${projectId}`).emit('ai:typing', {
                            projectId,
                            isTyping: false,
                        });
                        // Send error message
                        const errorMessage = await prisma_1.default.message.create({
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
                        const errorMessageData = {
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
                }
                else if (isAIMention && !ai_js_1.default.isAvailable()) {
                    // AI service not available
                    const notAvailableMessage = await prisma_1.default.message.create({
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
                    const notAvailableMessageData = {
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
            }
            catch (error) {
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
function getIO() {
    if (!io) {
        throw new Error('Socket.IO not initialized');
    }
    return io;
}
/**
 * Emit message deletion event
 * Called from REST API when a message is deleted
 */
function emitMessageDeleted(messageId, projectId) {
    if (io) {
        io.to(`project:${projectId}`).emit('message:deleted', messageId, projectId);
    }
}
//# sourceMappingURL=index.js.map