import { Request, Response } from 'express';
/**
 * Create a new project - Context7 pattern
 * POST /api/projects
 */
export declare const createProject: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Get all projects for a workspace - Context7 pattern
 * GET /api/projects/workspace/:workspaceId
 */
export declare const getProjectsByWorkspace: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Get a specific project by ID - Context7 pattern
 * GET /api/projects/:id
 */
export declare const getProjectById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Update a project - Context7 pattern
 * PUT /api/projects/:id
 */
export declare const updateProject: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Delete a project - Context7 pattern
 * DELETE /api/projects/:id
 */
export declare const deleteProject: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Set project as latest choice - Context7 pattern
 * PUT /api/projects/:id/set-latest
 */
export declare const setProjectAsLatest: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Toggle project active status - Context7 pattern
 * PUT /api/projects/:id/toggle-active
 */
export declare const toggleProjectActive: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=project.d.ts.map