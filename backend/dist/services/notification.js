"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyWorkspaceMembers = exports.getUnreadNotificationCount = exports.markAllNotificationsAsRead = exports.markNotificationAsRead = exports.getUserNotifications = exports.createNotification = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const socket_1 = require("../socket");
// Create notification - Context7 pattern
const createNotification = async (data) => {
    const notification = await prisma_1.default.notification.create({
        data: {
            type: data.type,
            title: data.title,
            message: data.message,
            actorId: data.actorId,
            recipientId: data.recipientId,
            issueId: data.issueId,
            link: data.link,
            read: false,
        },
        include: {
            actor: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                },
            },
            issue: {
                select: {
                    id: true,
                    title: true,
                    status: true,
                },
            },
        },
    });
    // Emit Socket.IO event to notify user in real-time
    try {
        const io = (0, socket_1.getIO)();
        if (io) {
            io.to(data.recipientId).emit('notification', notification);
            console.log(`📬 Notification sent to user ${data.recipientId}:`, notification.title);
        }
    }
    catch (error) {
        console.error('Failed to emit notification event:', error);
        // Continue even if Socket.IO emission fails
    }
    return notification;
};
exports.createNotification = createNotification;
// Get notifications for user - Context7 pattern
const getUserNotifications = async (userId, limit = 50) => {
    const notifications = await prisma_1.default.notification.findMany({
        where: {
            recipientId: userId,
        },
        include: {
            actor: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                },
            },
            issue: {
                select: {
                    id: true,
                    title: true,
                    status: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
        take: limit,
    });
    return notifications;
};
exports.getUserNotifications = getUserNotifications;
// Mark notification as read - Context7 pattern
const markNotificationAsRead = async (notificationId, userId) => {
    // Verify notification belongs to user
    const notification = await prisma_1.default.notification.findFirst({
        where: {
            id: notificationId,
            recipientId: userId,
        },
    });
    if (!notification) {
        throw new Error('Notification not found');
    }
    const updatedNotification = await prisma_1.default.notification.update({
        where: { id: notificationId },
        data: { read: true },
    });
    return updatedNotification;
};
exports.markNotificationAsRead = markNotificationAsRead;
// Mark all notifications as read - Context7 pattern
const markAllNotificationsAsRead = async (userId) => {
    await prisma_1.default.notification.updateMany({
        where: {
            recipientId: userId,
            read: false,
        },
        data: {
            read: true,
        },
    });
    return { success: true, message: 'All notifications marked as read' };
};
exports.markAllNotificationsAsRead = markAllNotificationsAsRead;
// Get unread notification count - Context7 pattern
const getUnreadNotificationCount = async (userId) => {
    const count = await prisma_1.default.notification.count({
        where: {
            recipientId: userId,
            read: false,
        },
    });
    return count;
};
exports.getUnreadNotificationCount = getUnreadNotificationCount;
// Notify workspace members about issue operations - Context7 pattern
const notifyWorkspaceMembers = async (actorId, issueId, projectId, type, title, message) => {
    // Get all workspace members for the project
    const project = await prisma_1.default.project.findUnique({
        where: { id: projectId },
        include: {
            workspace: {
                include: {
                    members: {
                        where: {
                            userId: {
                                not: actorId, // Exclude the actor
                            },
                        },
                    },
                },
            },
        },
    });
    if (!project) {
        throw new Error('Project not found');
    }
    // Create notifications for all workspace members except the actor
    const notifications = await Promise.all(project.workspace.members.map((member) => (0, exports.createNotification)({
        type,
        title,
        message,
        actorId,
        recipientId: member.userId,
        issueId,
        link: `/issues/${issueId}`,
    })));
    return notifications;
};
exports.notifyWorkspaceMembers = notifyWorkspaceMembers;
//# sourceMappingURL=notification.js.map