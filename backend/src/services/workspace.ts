import prisma from '../lib/prisma';
import { Workspace, WorkspaceMember } from '@prisma/client';

// Type definitions for workspace operations
export interface CreateWorkspaceData {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface UpdateWorkspaceData {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface WorkspaceWithMembers extends Workspace {
  members: WorkspaceMember[];
  _count?: {
    projects: number;
    members: number;
  };
}

/**
 * Create a new workspace - Context7 pattern
 * @param userId - ID of the user creating the workspace
 * @param data - Workspace creation data
 * @returns Created workspace with membership
 */
export const createWorkspace = async (
  userId: string,
  data: CreateWorkspaceData
): Promise<WorkspaceWithMembers> => {
  try {
    // Create workspace with the creator as OWNER
    const workspace = await prisma.workspace.create({
      data: {
        name: data.name,
        description: data.description,
        icon: data.icon || '🚀',
        color: data.color || '#3B82F6',
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
  } catch (error) {
    console.error('Error creating workspace:', error);
    throw new Error('Failed to create workspace');
  }
};

/**
 * Get all workspaces for a user - Context7 pattern
 * @param userId - ID of the user
 * @returns Array of workspaces the user is a member of
 */
export const getUserWorkspaces = async (
  userId: string
): Promise<WorkspaceWithMembers[]> => {
  try {
    // Find all workspace memberships for the user
    const memberships = await prisma.workspaceMember.findMany({
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
  } catch (error) {
    console.error('Error fetching user workspaces:', error);
    throw new Error('Failed to fetch workspaces');
  }
};

/**
 * Get a specific workspace by ID - Context7 pattern
 * @param workspaceId - ID of the workspace
 * @param userId - ID of the user (for access control)
 * @returns Workspace details with members
 */
export const getWorkspaceById = async (
  workspaceId: string,
  userId: string
): Promise<WorkspaceWithMembers | null> => {
  try {
    // Check if user is a member of the workspace
    const membership = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: workspaceId,
        userId: userId,
      },
    });

    if (!membership) {
      return null;
    }

    // Fetch workspace details
    const workspace = await prisma.workspace.findUnique({
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
  } catch (error) {
    console.error('Error fetching workspace:', error);
    throw new Error('Failed to fetch workspace');
  }
};

/**
 * Update a workspace - Context7 pattern
 * @param workspaceId - ID of the workspace
 * @param userId - ID of the user (for access control)
 * @param data - Update data
 * @returns Updated workspace
 */
export const updateWorkspace = async (
  workspaceId: string,
  userId: string,
  data: UpdateWorkspaceData
): Promise<WorkspaceWithMembers | null> => {
  try {
    // Check if user is an OWNER or ADMIN
    const membership = await prisma.workspaceMember.findFirst({
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
    const workspace = await prisma.workspace.update({
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
  } catch (error) {
    console.error('Error updating workspace:', error);
    throw new Error('Failed to update workspace');
  }
};

/**
 * Delete a workspace - Context7 pattern
 * @param workspaceId - ID of the workspace
 * @param userId - ID of the user (for access control)
 * @returns Success status
 */
export const deleteWorkspace = async (
  workspaceId: string,
  userId: string
): Promise<boolean> => {
  try {
    // Check if user is an OWNER
    const membership = await prisma.workspaceMember.findFirst({
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
    await prisma.workspace.delete({
      where: {
        id: workspaceId,
      },
    });

    return true;
  } catch (error) {
    console.error('Error deleting workspace:', error);
    throw new Error('Failed to delete workspace');
  }
};
