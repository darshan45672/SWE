"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleProjectActiveStatus = exports.setProjectAsLatestChoice = exports.deleteProject = exports.updateProject = exports.getProjectById = exports.getProjectsByWorkspace = exports.createProject = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
/**
 * Create a new project - Context7 pattern
 * @param userId - ID of the user creating the project
 * @param data - Project creation data
 * @returns Created project
 */
const createProject = async (userId, data) => {
    try {
        // Verify user is a member of the workspace
        const membership = await prisma_1.default.workspaceMember.findFirst({
            where: {
                userId: userId,
                workspaceId: data.workspaceId,
            },
        });
        if (!membership) {
            throw new Error('You are not a member of this workspace');
        }
        // Check if workspace has any existing projects
        const existingProjects = await prisma_1.default.project.findMany({
            where: {
                workspaceId: data.workspaceId,
            },
        });
        // If there are existing projects, set their latestChoice to false
        if (existingProjects.length > 0) {
            await prisma_1.default.project.updateMany({
                where: {
                    workspaceId: data.workspaceId,
                },
                data: {
                    latestChoice: false,
                },
            });
        }
        // Create project with isActive and latestChoice both set to true
        const project = await prisma_1.default.project.create({
            data: {
                name: data.name,
                description: data.description,
                workspaceId: data.workspaceId,
                isActive: true,
                latestChoice: true, // Always set to true for new projects
            },
        });
        return project;
    }
    catch (error) {
        console.error('Error creating project:', error);
        throw error;
    }
};
exports.createProject = createProject;
/**
 * Get all projects for a workspace - Context7 pattern
 * @param workspaceId - ID of the workspace
 * @param userId - ID of the user (for access control)
 * @returns Array of projects in the workspace
 */
const getProjectsByWorkspace = async (workspaceId, userId) => {
    try {
        // Verify user is a member of the workspace
        const membership = await prisma_1.default.workspaceMember.findFirst({
            where: {
                userId: userId,
                workspaceId: workspaceId,
            },
        });
        if (!membership) {
            return [];
        }
        // Fetch projects
        const projects = await prisma_1.default.project.findMany({
            where: {
                workspaceId: workspaceId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return projects;
    }
    catch (error) {
        console.error('Error fetching projects:', error);
        throw new Error('Failed to fetch projects');
    }
};
exports.getProjectsByWorkspace = getProjectsByWorkspace;
/**
 * Get a specific project by ID - Context7 pattern
 * @param projectId - ID of the project
 * @param userId - ID of the user (for access control)
 * @returns Project details
 */
const getProjectById = async (projectId, userId) => {
    try {
        // Fetch project with workspace
        const project = await prisma_1.default.project.findUnique({
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
    }
    catch (error) {
        console.error('Error fetching project:', error);
        throw new Error('Failed to fetch project');
    }
};
exports.getProjectById = getProjectById;
/**
 * Update a project - Context7 pattern
 * @param projectId - ID of the project
 * @param userId - ID of the user (for access control)
 * @param data - Update data
 * @returns Updated project
 */
const updateProject = async (projectId, userId, data) => {
    try {
        // Fetch project with workspace membership
        const project = await prisma_1.default.project.findUnique({
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
        const updatedProject = await prisma_1.default.project.update({
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
    }
    catch (error) {
        console.error('Error updating project:', error);
        throw new Error('Failed to update project');
    }
};
exports.updateProject = updateProject;
/**
 * Delete a project - Context7 pattern
 * @param projectId - ID of the project
 * @param userId - ID of the user (for access control)
 * @returns Success status
 */
const deleteProject = async (projectId, userId) => {
    try {
        // Fetch project with workspace membership
        const project = await prisma_1.default.project.findUnique({
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
        await prisma_1.default.project.delete({
            where: {
                id: projectId,
            },
        });
        return true;
    }
    catch (error) {
        console.error('Error deleting project:', error);
        throw new Error('Failed to delete project');
    }
};
exports.deleteProject = deleteProject;
/**
 * Set project as latest choice - Context7 pattern
 * @param projectId - ID of the project to set as latest
 * @param userId - ID of the user
 * @returns Updated project
 */
const setProjectAsLatestChoice = async (projectId, userId) => {
    try {
        // Fetch project with workspace membership
        const project = await prisma_1.default.project.findUnique({
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
        await prisma_1.default.project.updateMany({
            where: {
                workspaceId: project.workspaceId,
            },
            data: {
                latestChoice: false,
            },
        });
        // Set the selected project's latestChoice to true
        const updatedProject = await prisma_1.default.project.update({
            where: {
                id: projectId,
            },
            data: {
                latestChoice: true,
            },
        });
        return updatedProject;
    }
    catch (error) {
        console.error('Error setting project as latest choice:', error);
        throw new Error('Failed to update project choice');
    }
};
exports.setProjectAsLatestChoice = setProjectAsLatestChoice;
/**
 * Toggle project active status - Context7 pattern
 * @param projectId - ID of the project
 * @param userId - ID of the user (must be OWNER or ADMIN)
 * @param isActive - New active status
 * @returns Updated project
 */
const toggleProjectActiveStatus = async (projectId, userId, isActive) => {
    try {
        // Fetch project with workspace membership
        const project = await prisma_1.default.project.findUnique({
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
        const updatedProject = await prisma_1.default.project.update({
            where: {
                id: projectId,
            },
            data: {
                isActive: isActive,
            },
        });
        return updatedProject;
    }
    catch (error) {
        console.error('Error toggling project active status:', error);
        throw new Error('Failed to update project status');
    }
};
exports.toggleProjectActiveStatus = toggleProjectActiveStatus;
//# sourceMappingURL=project.js.map