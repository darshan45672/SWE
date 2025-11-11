import { Request, Response } from 'express';
/**
 * Send workspace invitation
 * POST /api/v1/workspaces/:workspaceId/invite
 */
export declare const inviteToWorkspace: (req: Request, res: Response) => Promise<void>;
/**
 * Get invitation details
 * GET /api/v1/invitations/:token
 */
export declare const getInvitationDetails: (req: Request, res: Response) => Promise<void>;
/**
 * Accept workspace invitation
 * POST /api/v1/invitations/:token/accept
 */
export declare const acceptInvitation: (req: Request, res: Response) => Promise<void>;
/**
 * Decline workspace invitation
 * POST /api/v1/invitations/:token/decline
 */
export declare const declineInvitation: (req: Request, res: Response) => Promise<void>;
/**
 * Get workspace invitations (for workspace admins)
 * GET /api/v1/workspaces/:workspaceId/invitations
 */
export declare const getWorkspaceInvitations: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=invitation.d.ts.map