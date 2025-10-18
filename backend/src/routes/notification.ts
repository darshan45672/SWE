import { Router } from 'express';
import { requireAuth } from '../auth/middleware';
import * as notificationController from '../controllers/notification';

const router = Router();

// All notification routes require authentication - Context7 pattern
router.use(requireAuth);

// GET /api/v1/notifications - Get user notifications
router.get('/', notificationController.getUserNotifications);

// GET /api/v1/notifications/unread-count - Get unread notification count
router.get('/unread-count', notificationController.getUnreadNotificationCount);

// PUT /api/v1/notifications/:id/read - Mark notification as read
router.put('/:id/read', notificationController.markNotificationAsRead);

// PUT /api/v1/notifications/read-all - Mark all notifications as read
router.put('/read-all', notificationController.markAllNotificationsAsRead);

export default router;
