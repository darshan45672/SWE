import { NotificationType } from '@prisma/client';
interface CreateNotificationData {
    type: NotificationType;
    title: string;
    message: string;
    actorId: string;
    recipientId: string;
    issueId?: string;
    link?: string;
}
export declare const createNotification: (data: CreateNotificationData) => Promise<{
    link: string | null;
    id: string;
    createdAt: Date;
    issueId: string | null;
    message: string;
    type: import(".prisma/client").$Enums.NotificationType;
    title: string;
    actorId: string;
    recipientId: string;
    read: boolean;
}>;
export declare const getUserNotifications: (userId: string, limit?: number) => Promise<({
    issue: {
        id: string;
        title: string;
        status: import(".prisma/client").$Enums.IssueStatus;
    } | null;
    actor: {
        name: string;
        id: string;
        email: string;
        avatar: string | null;
    };
} & {
    link: string | null;
    id: string;
    createdAt: Date;
    issueId: string | null;
    message: string;
    type: import(".prisma/client").$Enums.NotificationType;
    title: string;
    actorId: string;
    recipientId: string;
    read: boolean;
})[]>;
export declare const markNotificationAsRead: (notificationId: string, userId: string) => Promise<{
    link: string | null;
    id: string;
    createdAt: Date;
    issueId: string | null;
    message: string;
    type: import(".prisma/client").$Enums.NotificationType;
    title: string;
    actorId: string;
    recipientId: string;
    read: boolean;
}>;
export declare const markAllNotificationsAsRead: (userId: string) => Promise<{
    success: boolean;
    message: string;
}>;
export declare const getUnreadNotificationCount: (userId: string) => Promise<number>;
export declare const notifyWorkspaceMembers: (actorId: string, issueId: string, projectId: string, type: NotificationType, title: string, message: string) => Promise<{
    link: string | null;
    id: string;
    createdAt: Date;
    issueId: string | null;
    message: string;
    type: import(".prisma/client").$Enums.NotificationType;
    title: string;
    actorId: string;
    recipientId: string;
    read: boolean;
}[]>;
export {};
//# sourceMappingURL=notification.d.ts.map