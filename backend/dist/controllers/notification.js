"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnreadNotificationCount = exports.markAllNotificationsAsRead = exports.markNotificationAsRead = exports.getUserNotifications = void 0;
const notificationService = __importStar(require("../services/notification"));
// Get user notifications - Context7 pattern
const getUserNotifications = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            });
        }
        const limit = req.query.limit ? parseInt(req.query.limit) : 50;
        const notifications = await notificationService.getUserNotifications(userId, limit);
        return res.status(200).json({
            success: true,
            data: notifications,
        });
    }
    catch (error) {
        console.error('Get notifications error:', error);
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to get notifications',
        });
    }
};
exports.getUserNotifications = getUserNotifications;
// Mark notification as read - Context7 pattern
const markNotificationAsRead = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            });
        }
        const { id } = req.params;
        const notification = await notificationService.markNotificationAsRead(id, userId);
        return res.status(200).json({
            success: true,
            message: 'Notification marked as read',
            data: notification,
        });
    }
    catch (error) {
        console.error('Mark notification as read error:', error);
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to mark notification as read',
        });
    }
};
exports.markNotificationAsRead = markNotificationAsRead;
// Mark all notifications as read - Context7 pattern
const markAllNotificationsAsRead = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            });
        }
        const result = await notificationService.markAllNotificationsAsRead(userId);
        return res.status(200).json({
            success: true,
            message: result.message,
        });
    }
    catch (error) {
        console.error('Mark all notifications as read error:', error);
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to mark all notifications as read',
        });
    }
};
exports.markAllNotificationsAsRead = markAllNotificationsAsRead;
// Get unread notification count - Context7 pattern
const getUnreadNotificationCount = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            });
        }
        const count = await notificationService.getUnreadNotificationCount(userId);
        return res.status(200).json({
            success: true,
            data: { count },
        });
    }
    catch (error) {
        console.error('Get unread notification count error:', error);
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to get unread notification count',
        });
    }
};
exports.getUnreadNotificationCount = getUnreadNotificationCount;
//# sourceMappingURL=notification.js.map