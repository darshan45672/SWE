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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkspaceInvitations = exports.declineInvitation = exports.acceptInvitation = exports.getInvitationDetails = exports.inviteToWorkspace = void 0;
const crypto = __importStar(require("crypto"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const email_1 = require("../services/email");
/**
 * Generate an invitation token
 */
const generateInvitationToken = () => {
    return crypto.randomBytes(32).toString('hex');
};
/**
 * Send workspace invitation
 * POST /api/v1/workspaces/:workspaceId/invite
 */
const inviteToWorkspace = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const { email, role = 'MEMBER' } = req.body;
        const userId = req.user.userId;
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
        const workspace = await prisma_1.default.workspace.findUnique({
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
        const existingInvitation = await prisma_1.default.workspaceInvitation.findFirst({
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
        const inviter = await prisma_1.default.user.findUnique({
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
        const existingUser = await prisma_1.default.user.findUnique({
            where: { email },
            select: { id: true, email: true },
        });
        // Generate invitation token
        const token = generateInvitationToken();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        // Create invitation
        const invitation = await prisma_1.default.workspaceInvitation.create({
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
            await (0, email_1.sendWorkspaceInvitationEmail)(email, inviter.name, workspace.name, token, !existingUser // isNewUser
            );
        }
        catch (emailError) {
            console.error('Failed to send invitation email:', emailError);
            // Delete the invitation if email fails
            await prisma_1.default.workspaceInvitation.delete({
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
    }
    catch (error) {
        console.error('Invite to workspace error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send invitation',
        });
    }
};
exports.inviteToWorkspace = inviteToWorkspace;
/**
 * Get invitation details
 * GET /api/v1/invitations/:token
 */
const getInvitationDetails = async (req, res) => {
    try {
        const { token } = req.params;
        const invitation = await prisma_1.default.workspaceInvitation.findUnique({
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
            await prisma_1.default.workspaceInvitation.update({
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
    }
    catch (error) {
        console.error('Get invitation details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get invitation details',
        });
    }
};
exports.getInvitationDetails = getInvitationDetails;
/**
 * Accept workspace invitation
 * POST /api/v1/invitations/:token/accept
 */
const acceptInvitation = async (req, res) => {
    try {
        const { token } = req.params;
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }
        const invitation = await prisma_1.default.workspaceInvitation.findUnique({
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
            await prisma_1.default.workspaceInvitation.update({
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
        const user = await prisma_1.default.user.findUnique({
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
        const existingMember = await prisma_1.default.workspaceMember.findFirst({
            where: {
                userId,
                workspaceId: invitation.workspaceId,
            },
        });
        if (existingMember) {
            // Mark invitation as accepted anyway
            await prisma_1.default.workspaceInvitation.update({
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
        await prisma_1.default.$transaction([
            prisma_1.default.workspaceMember.create({
                data: {
                    userId,
                    workspaceId: invitation.workspaceId,
                    role: invitation.role,
                },
            }),
            prisma_1.default.workspaceInvitation.update({
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
    }
    catch (error) {
        console.error('Accept invitation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to accept invitation',
        });
    }
};
exports.acceptInvitation = acceptInvitation;
/**
 * Decline workspace invitation
 * POST /api/v1/invitations/:token/decline
 */
const declineInvitation = async (req, res) => {
    try {
        const { token } = req.params;
        const invitation = await prisma_1.default.workspaceInvitation.findUnique({
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
        await prisma_1.default.workspaceInvitation.update({
            where: { id: invitation.id },
            data: { status: 'DECLINED' },
        });
        res.status(200).json({
            success: true,
            message: 'Invitation declined',
        });
    }
    catch (error) {
        console.error('Decline invitation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to decline invitation',
        });
    }
};
exports.declineInvitation = declineInvitation;
/**
 * Get workspace invitations (for workspace admins)
 * GET /api/v1/workspaces/:workspaceId/invitations
 */
const getWorkspaceInvitations = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const userId = req.user.userId;
        // Check if user is a member with sufficient permissions
        const member = await prisma_1.default.workspaceMember.findFirst({
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
        const invitations = await prisma_1.default.workspaceInvitation.findMany({
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
    }
    catch (error) {
        console.error('Get workspace invitations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get workspace invitations',
        });
    }
};
exports.getWorkspaceInvitations = getWorkspaceInvitations;
//# sourceMappingURL=invitation.js.map