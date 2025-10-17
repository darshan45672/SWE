import { Router } from 'express';
import { requireAuth } from '../auth/middleware';
import * as invitationController from '../controllers/invitation';

const router = Router();

/**
 * Invitation routes
 */

// Send workspace invitation (requires auth and permissions)
router.post(
  '/workspaces/:workspaceId/invite',
  requireAuth,
  invitationController.inviteToWorkspace
);

// Get invitation details (public - no auth required)
router.get(
  '/:token',
  invitationController.getInvitationDetails
);

// Accept invitation (requires auth)
router.post(
  '/:token/accept',
  requireAuth,
  invitationController.acceptInvitation
);

// Decline invitation (no auth required)
router.post(
  '/:token/decline',
  invitationController.declineInvitation
);

// Get workspace invitations (requires auth and permissions)
router.get(
  '/workspaces/:workspaceId',
  requireAuth,
  invitationController.getWorkspaceInvitations
);

export default router;
