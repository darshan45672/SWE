import { Request, Response } from 'express';
import * as crypto from 'crypto';
import prisma from '../lib/prisma';
import { sendWorkspaceInvitationEmail } from '../services/email';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
  };
}

/**
 * Generate an invitation token
 */
const generateInvitationToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Send workspace invitation
 * POST /api/v1/workspaces/:workspaceId/invite
 */
export const inviteToWorkspace = async (req: Request, res: Response): Promise<void> => {
  try {
    const { workspaceId } = req.params;
    const { email, role = 'MEMBER' } = req.body;
    const userId = (req as AuthenticatedRequest).user.userId;

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email is required',
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
      return;
    }

    // Check if workspace exists
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        members: {
          include: {
            user: { select: { id: true, email: true } },
          },
        },
      },
    });

    if (!workspace) {
      res.status(404).json({
        success: false,
        message: 'Workspace not found',
      });
      return;
    }

    // Check if requester is a member with sufficient permissions (OWNER or ADMIN)
    const requesterMember = workspace.members.find((m) => m.userId === userId);
    if (!requesterMember || (requesterMember.role !== 'OWNER' && requesterMember.role !== 'ADMIN')) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to invite members to this workspace',
      });
      return;
    }

    // Check if user is already a member
    const existingMember = workspace.members.find((m) => m.user.email === email);
    if (existingMember) {
      res.status(400).json({
        success: false,
        message: 'User is already a member of this workspace',
      });
      return;
    }

    // Check if there's already a pending invitation for this email
    const existingInvitation = await prisma.workspaceInvitation.findFirst({
      where: {
        workspaceId,
        email,
        status: 'PENDING',
        expiresAt: { gt: new Date() },
      },
    });

    if (existingInvitation) {
      res.status(400).json({
        success: false,
        message: 'An invitation has already been sent to this email',
      });
      return;
    }

    // Get inviter details
    const inviter = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    if (!inviter) {
      res.status(404).json({
        success: false,
        message: 'Inviter not found',
      });
      return;
    }

    // Check if user exists in system
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    // Generate invitation token
    const token = generateInvitationToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create invitation
    const invitation = await prisma.workspaceInvitation.create({
      data: {
        workspaceId,
        email,
        role,
        token,
        invitedBy: userId,
        expiresAt,
        status: 'PENDING',
      },
    });

    // Send invitation email
    try {
      await sendWorkspaceInvitationEmail(
        email,
        inviter.name,
        workspace.name,
        token,
        !existingUser // isNewUser
      );
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
      // Delete the invitation if email fails
      await prisma.workspaceInvitation.delete({
        where: { id: invitation.id },
      });
      res.status(500).json({
        success: false,
        message: 'Failed to send invitation email',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Invitation sent successfully',
      data: {
        invitationId: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error) {
    console.error('Invite to workspace error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send invitation',
    });
  }
};

/**
 * Get invitation details
 * GET /api/v1/invitations/:token
 */
export const getInvitationDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    const invitation = await prisma.workspaceInvitation.findUnique({
      where: { token },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            description: true,
            icon: true,
            color: true,
          },
        },
        inviter: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!invitation) {
      res.status(404).json({
        success: false,
        message: 'Invitation not found',
      });
      return;
    }

    // Check if invitation has expired
    if (invitation.expiresAt < new Date()) {
      await prisma.workspaceInvitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' },
      });
      res.status(400).json({
        success: false,
        message: 'This invitation has expired',
        expired: true,
      });
      return;
    }

    // Check if invitation is not pending
    if (invitation.status !== 'PENDING') {
      res.status(400).json({
        success: false,
        message: `This invitation has already been ${invitation.status.toLowerCase()}`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        workspace: invitation.workspace,
        inviter: invitation.inviter,
        role: invitation.role,
        email: invitation.email,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error) {
    console.error('Get invitation details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get invitation details',
    });
  }
};

/**
 * Accept workspace invitation
 * POST /api/v1/invitations/:token/accept
 */
export const acceptInvitation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    const userId = (req as AuthenticatedRequest).user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const invitation = await prisma.workspaceInvitation.findUnique({
      where: { token },
      include: {
        workspace: true,
      },
    });

    if (!invitation) {
      res.status(404).json({
        success: false,
        message: 'Invitation not found',
      });
      return;
    }

    // Check if invitation has expired
    if (invitation.expiresAt < new Date()) {
      await prisma.workspaceInvitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' },
      });
      res.status(400).json({
        success: false,
        message: 'This invitation has expired',
      });
      return;
    }

    // Check if invitation is not pending
    if (invitation.status !== 'PENDING') {
      res.status(400).json({
        success: false,
        message: `This invitation has already been ${invitation.status.toLowerCase()}`,
      });
      return;
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, emailVerified: true },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Check if user's email matches invitation email
    if (user.email !== invitation.email) {
      res.status(403).json({
        success: false,
        message: 'This invitation was sent to a different email address',
      });
      return;
    }

    // Check if user's email is verified
    if (!user.emailVerified) {
      res.status(403).json({
        success: false,
        message: 'Please verify your email address before accepting invitations',
        requiresVerification: true,
      });
      return;
    }

    // Check if user is already a member
    const existingMember = await prisma.workspaceMember.findFirst({
      where: {
        userId,
        workspaceId: invitation.workspaceId,
      },
    });

    if (existingMember) {
      // Mark invitation as accepted anyway
      await prisma.workspaceInvitation.update({
        where: { id: invitation.id },
        data: { status: 'ACCEPTED' },
      });
      res.status(400).json({
        success: false,
        message: 'You are already a member of this workspace',
      });
      return;
    }

    // Add user to workspace and update invitation status
    await prisma.$transaction([
      prisma.workspaceMember.create({
        data: {
          userId,
          workspaceId: invitation.workspaceId,
          role: invitation.role,
        },
      }),
      prisma.workspaceInvitation.update({
        where: { id: invitation.id },
        data: { status: 'ACCEPTED' },
      }),
    ]);

    res.status(200).json({
      success: true,
      message: 'Successfully joined workspace',
      data: {
        workspace: invitation.workspace,
      },
    });
  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept invitation',
    });
  }
};

/**
 * Decline workspace invitation
 * POST /api/v1/invitations/:token/decline
 */
export const declineInvitation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    const invitation = await prisma.workspaceInvitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      res.status(404).json({
        success: false,
        message: 'Invitation not found',
      });
      return;
    }

    // Check if invitation is not pending
    if (invitation.status !== 'PENDING') {
      res.status(400).json({
        success: false,
        message: `This invitation has already been ${invitation.status.toLowerCase()}`,
      });
      return;
    }

    await prisma.workspaceInvitation.update({
      where: { id: invitation.id },
      data: { status: 'DECLINED' },
    });

    res.status(200).json({
      success: true,
      message: 'Invitation declined',
    });
  } catch (error) {
    console.error('Decline invitation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to decline invitation',
    });
  }
};

/**
 * Get workspace invitations (for workspace admins)
 * GET /api/v1/workspaces/:workspaceId/invitations
 */
export const getWorkspaceInvitations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { workspaceId } = req.params;
    const userId = (req as AuthenticatedRequest).user.userId;

    // Check if user is a member with sufficient permissions
    const member = await prisma.workspaceMember.findFirst({
      where: {
        userId,
        workspaceId,
      },
    });

    if (!member || (member.role !== 'OWNER' && member.role !== 'ADMIN')) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to view invitations for this workspace',
      });
      return;
    }

    const invitations = await prisma.workspaceInvitation.findMany({
      where: { workspaceId },
      include: {
        inviter: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: invitations,
    });
  } catch (error) {
    console.error('Get workspace invitations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get workspace invitations',
    });
  }
};
