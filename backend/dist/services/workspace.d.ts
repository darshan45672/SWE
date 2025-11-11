import { Workspace, WorkspaceMember } from '@prisma/client';
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
export declare const createWorkspace: (userId: string, data: CreateWorkspaceData) => Promise<WorkspaceWithMembers>;
/**
 * Get all workspaces for a user - Context7 pattern
 * @param userId - ID of the user
 * @returns Array of workspaces the user is a member of
 */
export declare const getUserWorkspaces: (userId: string) => Promise<WorkspaceWithMembers[]>;
/**
 * Get a specific workspace by ID - Context7 pattern
 * @param workspaceId - ID of the workspace
 * @param userId - ID of the user (for access control)
 * @returns Workspace details with members
 */
export declare const getWorkspaceById: (workspaceId: string, userId: string) => Promise<WorkspaceWithMembers | null>;
/**
 * Update a workspace - Context7 pattern
 * @param workspaceId - ID of the workspace
 * @param userId - ID of the user (for access control)
 * @param data - Update data
 * @returns Updated workspace
 */
export declare const updateWorkspace: (workspaceId: string, userId: string, data: UpdateWorkspaceData) => Promise<WorkspaceWithMembers | null>;
/**
 * Delete a workspace - Context7 pattern
 * @param workspaceId - ID of the workspace
 * @param userId - ID of the user (for access control)
 * @returns Success status
 */
export declare const deleteWorkspace: (workspaceId: string, userId: string) => Promise<boolean>;
/**
 * Set workspace as latest choice - Context7 pattern
 * @param workspaceId - ID of the workspace to set as latest
 * @param userId - ID of the user
 * @returns Updated workspace
 */
export declare const setWorkspaceAsLatestChoice: (workspaceId: string, userId: string) => Promise<Workspace>;
/**
 * Toggle workspace active status - Context7 pattern
 * @param workspaceId - ID of the workspace
 * @param userId - ID of the user (must be OWNER)
 * @param isActive - New active status
 * @returns Updated workspace
 */
export declare const toggleWorkspaceActiveStatus: (workspaceId: string, userId: string, isActive: boolean) => Promise<Workspace>;
/**
 * Get workspace members - Context7 pattern
 * @param workspaceId - ID of the workspace
 * @param userId - ID of the requesting user
 * @returns List of workspace members with user details
 */
export declare const getWorkspaceMembers: (workspaceId: string, userId: string) => Promise<{
    role: import(".prisma/client").$Enums.WorkspaceRole;
    joinedAt: Date;
    name: string;
    id: string;
    email: string;
    avatar: string | null;
    bio: string | null;
    company: string | null;
    jobTitle: string | null;
}[]>;
//# sourceMappingURL=workspace.d.ts.map