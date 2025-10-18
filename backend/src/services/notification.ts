    import prisma from '../lib/prisma';
import { NotificationType } from '@prisma/client';
import { getIO } from '../socket';

// Types for Notification service - Context7 pattern
interface CreateNotificationData {
  type: NotificationType;
  title: string;
  message: string;
  actorId: string;
  recipientId: string;
  issueId?: string;
  link?: string;
}

// Create notification - Context7 pattern
export const createNotification = async (data: CreateNotificationData) => {
  const notification = await prisma.notification.create({
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
    const io = getIO();
    io.to(data.recipientId).emit('notification', notification);
    console.log(`📬 Notification sent to user ${data.recipientId}:`, notification.title);
  } catch (error) {
    console.error('Failed to emit notification event:', error);
  }

  return notification;
};

// Get notifications for user - Context7 pattern
export const getUserNotifications = async (userId: string, limit: number = 50) => {
  const notifications = await prisma.notification.findMany({
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

// Mark notification as read - Context7 pattern
export const markNotificationAsRead = async (notificationId: string, userId: string) => {
  // Verify notification belongs to user
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      recipientId: userId,
    },
  });

  if (!notification) {
    throw new Error('Notification not found');
  }

  const updatedNotification = await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });

  return updatedNotification;
};

// Mark all notifications as read - Context7 pattern
export const markAllNotificationsAsRead = async (userId: string) => {
  await prisma.notification.updateMany({
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

// Get unread notification count - Context7 pattern
export const getUnreadNotificationCount = async (userId: string) => {
  const count = await prisma.notification.count({
    where: {
      recipientId: userId,
      read: false,
    },
  });

  return count;
};

// Notify workspace members about issue operations - Context7 pattern
export const notifyWorkspaceMembers = async (
  actorId: string,
  issueId: string,
  projectId: string,
  type: NotificationType,
  title: string,
  message: string
) => {
  // Get all workspace members for the project
  const project = await prisma.project.findUnique({
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
  const notifications = await Promise.all(
    project.workspace.members.map((member) =>
      createNotification({
        type,
        title,
        message,
        actorId,
        recipientId: member.userId,
        issueId,
        link: `/issues/${issueId}`,
      })
    )
  );

  return notifications;
};
