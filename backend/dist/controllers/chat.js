"use strict";
/**
 * Chat Controller
 * REST API endpoints for chat message management
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectMessages = getProjectMessages;
exports.deleteMessage = deleteMessage;
exports.getMessageCount = getMessageCount;
const prisma_1 = __importDefault(require("../lib/prisma"));
const socket_1 = require("../socket");
/**
 * Get messages for a specific project
 * GET /api/v1/chat/projects/:projectId/messages
 */
async function getProjectMessages(req, res) {
    try {
        const { projectId } = req.params;
        const { limit = 50, before } = req.query;
        // Verify user has access to this project
        const project = await prisma_1.default.project.findFirst({
            where: {
                id: projectId,
                workspace: {
                    members: {
                        some: {
                            userId: req.user.userId,
                        },
                    },
                },
            },
        });
        if (!project) {
            return res.status(404).json({
                error: 'Project not found or access denied',
            });
        }
        const queryOptions = {
            where: { projectId },
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
            orderBy: { createdAt: 'desc' },
            take: Math.min(Number(limit), 100), // Max 100 messages per request
        };
        // Pagination: get messages before a specific timestamp
        if (before) {
            queryOptions.where.createdAt = {
                lt: new Date(before),
            };
        }
        // Fetch messages
        const messages = (await prisma_1.default.message.findMany(queryOptions));
        // Format response
        const formattedMessages = messages.map((msg) => ({
            id: msg.id,
            content: msg.content,
            senderId: msg.senderId,
            sender: {
                id: msg.sender.id,
                name: msg.sender.name,
                email: msg.sender.email,
                avatar: msg.sender.avatar || undefined,
            },
            projectId: msg.projectId,
            isAIMessage: msg.isAIMessage,
            aiContext: msg.aiContext,
            parentMessageId: msg.parentMessageId,
            createdAt: msg.createdAt,
            updatedAt: msg.updatedAt,
        }));
        res.json({
            messages: formattedMessages.reverse(), // Return in chronological order
            hasMore: messages.length === Number(limit),
        });
    }
    catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
}
/**
 * Delete a message
 * DELETE /api/v1/chat/messages/:messageId
 * Only the sender can delete their own message
 */
async function deleteMessage(req, res) {
    try {
        const { messageId } = req.params;
        const userId = req.user.userId;
        // Find the message
        const message = await prisma_1.default.message.findUnique({
            where: { id: messageId },
            include: {
                project: {
                    include: {
                        workspace: {
                            include: {
                                members: {
                                    where: { userId },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }
        // Check if user is the sender or has admin rights
        const isOwner = message.senderId === userId;
        const workspaceMember = message.project.workspace.members[0];
        const isAdmin = workspaceMember &&
            (workspaceMember.role === 'OWNER' || workspaceMember.role === 'ADMIN');
        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                error: 'You do not have permission to delete this message',
            });
        }
        // Delete the message
        await prisma_1.default.message.delete({
            where: { id: messageId },
        });
        // Emit Socket.IO event to notify all users in the project
        (0, socket_1.emitMessageDeleted)(messageId, message.projectId);
        res.json({
            success: true,
            message: 'Message deleted successfully',
        });
    }
    catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ error: 'Failed to delete message' });
    }
}
/**
 * Get message count for a project
 * GET /api/v1/chat/projects/:projectId/count
 */
async function getMessageCount(req, res) {
    try {
        const { projectId } = req.params;
        // Verify user has access to this project
        const project = await prisma_1.default.project.findFirst({
            where: {
                id: projectId,
                workspace: {
                    members: {
                        some: {
                            userId: req.user.userId,
                        },
                    },
                },
            },
        });
        if (!project) {
            return res.status(404).json({
                error: 'Project not found or access denied',
            });
        }
        // Count messages
        const count = await prisma_1.default.message.count({
            where: { projectId },
        });
        res.json({ count });
    }
    catch (error) {
        console.error('Error counting messages:', error);
        res.status(500).json({ error: 'Failed to count messages' });
    }
}
//# sourceMappingURL=chat.js.map