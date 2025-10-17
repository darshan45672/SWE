import { Project } from '@prisma/client';
export interface CreateProjectData {
    name: string;
    description?: string;
    workspaceId: string;
}
export interface UpdateProjectData {
    name?: string;
    description?: string;
}
/**
 * Create a new project - Context7 pattern
 * @param userId - ID of the user creating the project
 * @param data - Project creation data
 * @returns Created project
 */
export declare const createProject: (userId: string, data: CreateProjectData) => Promise<Project>;
/**
 * Get all projects for a workspace - Context7 pattern
 * @param workspaceId - ID of the workspace
 * @param userId - ID of the user (for access control)
 * @returns Array of projects in the workspace
 */
export declare const getProjectsByWorkspace: (workspaceId: string, userId: string) => Promise<Project[]>;
/**
 * Get a specific project by ID - Context7 pattern
 * @param projectId - ID of the project
 * @param userId - ID of the user (for access control)
 * @returns Project details
 */
export declare const getProjectById: (projectId: string, userId: string) => Promise<Project | null>;
/**
 * Update a project - Context7 pattern
 * @param projectId - ID of the project
 * @param userId - ID of the user (for access control)
 * @param data - Update data
 * @returns Updated project
 */
export declare const updateProject: (projectId: string, userId: string, data: UpdateProjectData) => Promise<Project | null>;
/**
 * Delete a project - Context7 pattern
 * @param projectId - ID of the project
 * @param userId - ID of the user (for access control)
 * @returns Success status
 */
export declare const deleteProject: (projectId: string, userId: string) => Promise<boolean>;
/**
 * Set project as latest choice - Context7 pattern
 * @param projectId - ID of the project to set as latest
 * @param userId - ID of the user
 * @returns Updated project
 */
export declare const setProjectAsLatestChoice: (projectId: string, userId: string) => Promise<Project>;
/**
 * Toggle project active status - Context7 pattern
 * @param projectId - ID of the project
 * @param userId - ID of the user (must be OWNER or ADMIN)
 * @param isActive - New active status
 * @returns Updated project
 */
export declare const toggleProjectActiveStatus: (projectId: string, userId: string, isActive: boolean) => Promise<Project>;
//# sourceMappingURL=project.d.ts.map