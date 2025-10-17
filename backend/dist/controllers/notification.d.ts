import { Request, Response } from 'express';
export declare const getUserNotifications: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const markNotificationAsRead: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const markAllNotificationsAsRead: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getUnreadNotificationCount: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=notification.d.ts.map