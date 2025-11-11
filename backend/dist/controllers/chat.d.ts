/**
 * Chat Controller
 * REST API endpoints for chat message management
 */
import { Response } from 'express';
import { AuthenticatedRequest } from '../auth/middleware';
/**
 * Get messages for a specific project
 * GET /api/v1/chat/projects/:projectId/messages
 */
export declare function getProjectMessages(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Delete a message
 * DELETE /api/v1/chat/messages/:messageId
 * Only the sender can delete their own message
 */
export declare function deleteMessage(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Get message count for a project
 * GET /api/v1/chat/projects/:projectId/count
 */
export declare function getMessageCount(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=chat.d.ts.map