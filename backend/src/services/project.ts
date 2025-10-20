import prisma from '../lib/prisma';
import { Project } from '@prisma/client';

// Type definitions for project operations
export interface CreateProjectData {
  name: string;
  description?: string;
  workspaceId: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  isActive?: boolean;
}

/**
 * Create a new project - Context7 pattern
 * @param userId - ID of the user creating the project
 * @param data - Project creation data
 * @returns Created project
 */

export const createProject = async (
  userId: string,
  data: CreateProjectData
): Promise<Project> => {
  try {
    // Verify user is a member of the workspace
    const membership = await prisma.workspaceMember.findFirst({
      where: {
        userId: userId,
        workspaceId: data.workspaceId,
      },
    });

    if (!membership) {
      throw new Error('You are not a member of this workspace');
    }

    // Check if workspace has any existing projects
    const existingProjects = await prisma.project.findMany({
      where: {
        workspaceId: data.workspaceId,
      },
    });

    // If there are existing projects, set their latestChoice to false
    if (existingProjects.length > 0) {
      await prisma.project.updateMany({
        where: {
          workspaceId: data.workspaceId,
        },
        data: {
          latestChoice: false,
        },
      });
    }

    // Create project with isActive and latestChoice both set to true
    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        workspaceId: data.workspaceId,
        isActive: true,
        latestChoice: true, // Always set to true for new projects
      },
    });

    return project;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

/**
 * Get all projects for a workspace - Context7 pattern
 * @param workspaceId - ID of the workspace
 * @param userId - ID of the user (for access control)
 * @returns Array of projects in the workspace
 */
export const getProjectsByWorkspace = async (
  workspaceId: string,
  userId: string
): Promise<Project[]> => {
  try {
    // Verify user is a member of the workspace
    const membership = await prisma.workspaceMember.findFirst({
      where: {
        userId: userId,
        workspaceId: workspaceId,
      },
    });

    if (!membership) {
      return [];
    }

    // Fetch projects
    const projects = await prisma.project.findMany({
      where: {
        workspaceId: workspaceId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return projects;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw new Error('Failed to fetch projects');
  }
};

/**
 * Get a specific project by ID - Context7 pattern
 * @param projectId - ID of the project
 * @param userId - ID of the user (for access control)
 * @returns Project details
 */
export const getProjectById = async (
  projectId: string,
  userId: string
): Promise<Project | null> => {
  try {
    // Fetch project with workspace
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
      include: {
        workspace: {
          include: {
            members: {
              where: {
                userId: userId,
              },
            },
          },
        },
      },
    });

    // Check if user has access (is a member of the workspace)
    if (!project || project.workspace.members.length === 0) {
      return null;
    }

    return project;
  } catch (error) {
    console.error('Error fetching project:', error);
    throw new Error('Failed to fetch project');
  }
};

/**
 * Update a project - Context7 pattern
 * @param projectId - ID of the project
 * @param userId - ID of the user (for access control)
 * @param data - Update data
 * @returns Updated project
 */
export const updateProject = async (
  projectId: string,
  userId: string,
  data: UpdateProjectData
): Promise<Project | null> => {
  try {
    // Fetch project with workspace membership
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
      include: {
        workspace: {
          include: {
            members: {
              where: {
                userId: userId,
                role: {
                  in: ['OWNER', 'ADMIN', 'MEMBER'],
                },
              },
            },
          },
        },
      },
    });

    // Check if user has access
    if (!project || project.workspace.members.length === 0) {
      return null;
    }

    // Update project
    const updatedProject = await prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    return updatedProject;
  } catch (error) {
    console.error('Error updating project:', error);
    throw new Error('Failed to update project');
  }
};

/**
 * Delete a project - Context7 pattern
 * @param projectId - ID of the project
 * @param userId - ID of the user (for access control)
 * @returns Success status
 */
export const deleteProject = async (
  projectId: string,
  userId: string
): Promise<boolean> => {
  try {
    // Fetch project with workspace membership
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
      include: {
        workspace: {
          include: {
            members: {
              where: {
                userId: userId,
                role: {
                  in: ['OWNER', 'ADMIN'],
                },
              },
            },
          },
        },
      },
    });

    // Check if user has permission (OWNER or ADMIN only)
    if (!project || project.workspace.members.length === 0) {
      return false;
    }

    // Delete project
    await prisma.project.delete({
      where: {
        id: projectId,
      },
    });

    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    throw new Error('Failed to delete project');
  }
};

/**
 * Set project as latest choice - Context7 pattern
 * @param projectId - ID of the project to set as latest
 * @param userId - ID of the user
 * @returns Updated project
 */
export const setProjectAsLatestChoice = async (
  projectId: string,
  userId: string
): Promise<Project> => {
  try {
    // Fetch project with workspace membership
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
      include: {
        workspace: {
          include: {
            members: {
              where: {
                userId: userId,
              },
            },
          },
        },
      },
    });

    if (!project || project.workspace.members.length === 0) {
      throw new Error('Access denied: Not a member of this workspace');
    }

    // Set all projects in the workspace' latestChoice to false
    await prisma.project.updateMany({
      where: {
        workspaceId: project.workspaceId,
      },
      data: {
        latestChoice: false,
      },
    });

    // Set the selected project's latestChoice to true
    const updatedProject = await prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        latestChoice: true,
      },
    });

    return updatedProject;
  } catch (error) {
    console.error('Error setting project as latest choice:', error);
    throw new Error('Failed to update project choice');
  }
};

/**
 * Toggle project active status - Context7 pattern
 * @param projectId - ID of the project
 * @param userId - ID of the user (must be OWNER or ADMIN)
 * @param isActive - New active status
 * @returns Updated project
 */
export const toggleProjectActiveStatus = async (
  projectId: string,
  userId: string,
  isActive: boolean
): Promise<Project> => {
  try {
    // Fetch project with workspace membership
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
      include: {
        workspace: {
          include: {
            members: {
              where: {
                userId: userId,
                role: {
                  in: ['OWNER', 'ADMIN'],
                },
              },
            },
          },
        },
      },
    });

    if (!project || project.workspace.members.length === 0) {
      throw new Error('Access denied: Only owners and admins can change project status');
    }

    // Update project active status
    const updatedProject = await prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        isActive: isActive,
      },
    });

    return updatedProject;
  } catch (error) {
    console.error('Error toggling project active status:', error);
    throw new Error('Failed to update project status');
  }
};
