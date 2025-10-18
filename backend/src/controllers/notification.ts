import { Request, Response } from 'express';
import * as notificationService from '../services/notification';
import { ApiResponse } from '../types/api';

// Get user notifications - Context7 pattern
export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      } as ApiResponse);
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const notifications = await notificationService.getUserNotifications(userId, limit);

    return res.status(200).json({
      success: true,
      data: notifications,
    } as ApiResponse);
  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get notifications',
    } as ApiResponse);
  }
};

// Mark notification as read - Context7 pattern
export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      } as ApiResponse);
    }

    const { id } = req.params;
    const notification = await notificationService.markNotificationAsRead(id, userId);

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification,
    } as ApiResponse);
  } catch (error) {
    console.error('Mark notification as read error:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to mark notification as read',
    } as ApiResponse);
  }
};

// Mark all notifications as read - Context7 pattern
export const markAllNotificationsAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      } as ApiResponse);
    }

    const result = await notificationService.markAllNotificationsAsRead(userId);

    return res.status(200).json({
      success: true,
      message: result.message,
    } as ApiResponse);
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to mark all notifications as read',
    } as ApiResponse);
  }
};

// Get unread notification count - Context7 pattern
export const getUnreadNotificationCount = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      } as ApiResponse);
    }

    const count = await notificationService.getUnreadNotificationCount(userId);

    return res.status(200).json({
      success: true,
      data: { count },
    } as ApiResponse);
  } catch (error) {
    console.error('Get unread notification count error:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get unread notification count',
    } as ApiResponse);
  }
};
