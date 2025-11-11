"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkspaceMembers = exports.toggleWorkspaceActiveStatus = exports.setWorkspaceAsLatestChoice = exports.deleteWorkspace = exports.updateWorkspace = exports.getWorkspaceById = exports.getUserWorkspaces = exports.createWorkspace = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
/**
 * Create a new workspace - Context7 pattern
 * @param userId - ID of the user creating the workspace
 * @param data - Workspace creation data
 * @returns Created workspace with membership
 */
const createWorkspace = async (userId, data) => {
    try {
        // Check if user has any existing workspaces
        const existingWorkspaces = await prisma_1.default.workspace.findMany({
            where: {
                members: {
                    some: {
                        userId: userId,
                    },
                },
            },
        });
        // If this is the first workspace, set latestChoice to true
        const isFirstWorkspace = existingWorkspaces.length === 0;
        // If this is NOT the first workspace, set all other workspaces' latestChoice to false
        if (!isFirstWorkspace) {
            await prisma_1.default.workspace.updateMany({
                where: {
                    members: {
                        some: {
                            userId: userId,
                        },
                    },
                },
                data: {
                    latestChoice: false,
                },
            });
        }
        // Create workspace with the creator as OWNER
        const workspace = await prisma_1.default.workspace.create({
            data: {
                name: data.name,
                description: data.description,
                icon: data.icon || '🚀',
                color: data.color || '#3B82F6',
                isActive: true,
                latestChoice: isFirstWorkspace, // Set to true only for first workspace
                members: {
                    create: {
                        userId: userId,
                        role: 'OWNER',
                    },
                },
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                avatar: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        projects: true,
                        members: true,
                    },
                },
            },
        });
        return workspace;
    }
    catch (error) {
        console.error('Error creating workspace:', error);
        throw new Error('Failed to create workspace');
    }
};
exports.createWorkspace = createWorkspace;
/**
 * Get all workspaces for a user - Context7 pattern
 * @param userId - ID of the user
 * @returns Array of workspaces the user is a member of
 */
const getUserWorkspaces = async (userId) => {
    try {
        // Find all workspace memberships for the user
        const memberships = await prisma_1.default.workspaceMember.findMany({
            where: {
                userId: userId,
            },
            include: {
                workspace: {
                    include: {
                        members: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                        avatar: true,
                                    },
                                },
                            },
                        },
                        _count: {
                            select: {
                                projects: true,
                                members: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        // Extract workspaces from memberships
        const workspaces = memberships.map((membership) => membership.workspace);
        return workspaces;
    }
    catch (error) {
        console.error('Error fetching user workspaces:', error);
        throw new Error('Failed to fetch workspaces');
    }
};
exports.getUserWorkspaces = getUserWorkspaces;
/**
 * Get a specific workspace by ID - Context7 pattern
 * @param workspaceId - ID of the workspace
 * @param userId - ID of the user (for access control)
 * @returns Workspace details with members
 */
const getWorkspaceById = async (workspaceId, userId) => {
    try {
        // Check if user is a member of the workspace
        const membership = await prisma_1.default.workspaceMember.findFirst({
            where: {
                workspaceId: workspaceId,
                userId: userId,
            },
        });
        if (!membership) {
            return null;
        }
        // Fetch workspace details
        const workspace = await prisma_1.default.workspace.findUnique({
            where: {
                id: workspaceId,
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                avatar: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        projects: true,
                        members: true,
                    },
                },
            },
        });
        return workspace;
    }
    catch (error) {
        console.error('Error fetching workspace:', error);
        throw new Error('Failed to fetch workspace');
    }
};
exports.getWorkspaceById = getWorkspaceById;
/**
 * Update a workspace - Context7 pattern
 * @param workspaceId - ID of the workspace
 * @param userId - ID of the user (for access control)
 * @param data - Update data
 * @returns Updated workspace
 */
const updateWorkspace = async (workspaceId, userId, data) => {
    try {
        // Check if user is an OWNER or ADMIN
        const membership = await prisma_1.default.workspaceMember.findFirst({
            where: {
                workspaceId: workspaceId,
                userId: userId,
                role: {
                    in: ['OWNER', 'ADMIN'],
                },
            },
        });
        if (!membership) {
            return null;
        }
        // Update workspace
        const workspace = await prisma_1.default.workspace.update({
            where: {
                id: workspaceId,
            },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.icon !== undefined && { icon: data.icon }),
                ...(data.color !== undefined && { color: data.color }),
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                avatar: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        projects: true,
                        members: true,
                    },
                },
            },
        });
        return workspace;
    }
    catch (error) {
        console.error('Error updating workspace:', error);
        throw new Error('Failed to update workspace');
    }
};
exports.updateWorkspace = updateWorkspace;
/**
 * Delete a workspace - Context7 pattern
 * @param workspaceId - ID of the workspace
 * @param userId - ID of the user (for access control)
 * @returns Success status
 */
const deleteWorkspace = async (workspaceId, userId) => {
    try {
        // Check if user is an OWNER
        const membership = await prisma_1.default.workspaceMember.findFirst({
            where: {
                workspaceId: workspaceId,
                userId: userId,
                role: 'OWNER',
            },
        });
        if (!membership) {
            return false;
        }
        // Delete workspace (cascade will handle members and projects)
        await prisma_1.default.workspace.delete({
            where: {
                id: workspaceId,
            },
        });
        return true;
    }
    catch (error) {
        console.error('Error deleting workspace:', error);
        throw new Error('Failed to delete workspace');
    }
};
exports.deleteWorkspace = deleteWorkspace;
/**
 * Set workspace as latest choice - Context7 pattern
 * @param workspaceId - ID of the workspace to set as latest
 * @param userId - ID of the user
 * @returns Updated workspace
 */
const setWorkspaceAsLatestChoice = async (workspaceId, userId) => {
    try {
        // Verify user has access to this workspace
        const membership = await prisma_1.default.workspaceMember.findFirst({
            where: {
                workspaceId: workspaceId,
                userId: userId,
            },
        });
        if (!membership) {
            throw new Error('Access denied: Not a member of this workspace');
        }
        // Set all user's workspaces' latestChoice to false
        await prisma_1.default.workspace.updateMany({
            where: {
                members: {
                    some: {
                        userId: userId,
                    },
                },
            },
            data: {
                latestChoice: false,
            },
        });
        // Set the selected workspace's latestChoice to true
        const workspace = await prisma_1.default.workspace.update({
            where: {
                id: workspaceId,
            },
            data: {
                latestChoice: true,
            },
        });
        return workspace;
    }
    catch (error) {
        console.error('Error setting workspace as latest choice:', error);
        throw new Error('Failed to update workspace choice');
    }
};
exports.setWorkspaceAsLatestChoice = setWorkspaceAsLatestChoice;
/**
 * Toggle workspace active status - Context7 pattern
 * @param workspaceId - ID of the workspace
 * @param userId - ID of the user (must be OWNER)
 * @param isActive - New active status
 * @returns Updated workspace
 */
const toggleWorkspaceActiveStatus = async (workspaceId, userId, isActive) => {
    try {
        // Check if user is an OWNER
        const membership = await prisma_1.default.workspaceMember.findFirst({
            where: {
                workspaceId: workspaceId,
                userId: userId,
                role: 'OWNER',
            },
        });
        if (!membership) {
            throw new Error('Access denied: Only owners can change workspace status');
        }
        // Update workspace active status
        const workspace = await prisma_1.default.workspace.update({
            where: {
                id: workspaceId,
            },
            data: {
                isActive: isActive,
            },
        });
        return workspace;
    }
    catch (error) {
        console.error('Error toggling workspace active status:', error);
        throw new Error('Failed to update workspace status');
    }
};
exports.toggleWorkspaceActiveStatus = toggleWorkspaceActiveStatus;
/**
 * Get workspace members - Context7 pattern
 * @param workspaceId - ID of the workspace
 * @param userId - ID of the requesting user
 * @returns List of workspace members with user details
 */
const getWorkspaceMembers = async (workspaceId, userId) => {
    try {
        // Check if user is a member of the workspace
        const membership = await prisma_1.default.workspaceMember.findFirst({
            where: {
                workspaceId: workspaceId,
                userId: userId,
            },
        });
        if (!membership) {
            throw new Error('Access denied: You are not a member of this workspace');
        }
        // Get all workspace members with user details
        const members = await prisma_1.default.workspaceMember.findMany({
            where: {
                workspaceId: workspaceId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                        bio: true,
                        jobTitle: true,
                        company: true,
                    },
                },
            },
        });
        // Transform the data to return user details with role
        return members.map((member) => ({
            ...member.user,
            role: member.role,
            joinedAt: member.createdAt,
        }));
    }
    catch (error) {
        console.error('Error getting workspace members:', error);
        throw error;
    }
};
exports.getWorkspaceMembers = getWorkspaceMembers;
//# sourceMappingURL=workspace.js.map