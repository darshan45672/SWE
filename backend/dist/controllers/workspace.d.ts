import { Request, Response } from 'express';
/**
 * Create a new workspace - Context7 pattern
 * POST /api/workspaces
 */
export declare const createWorkspace: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Get all workspaces for the authenticated user - Context7 pattern
 * GET /api/workspaces
 */
export declare const getWorkspaces: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Get a specific workspace by ID - Context7 pattern
 * GET /api/workspaces/:id
 */
export declare const getWorkspaceById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Update a workspace - Context7 pattern
 * PUT /api/workspaces/:id
 */
export declare const updateWorkspace: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Delete a workspace - Context7 pattern
 * DELETE /api/workspaces/:id
 */
export declare const deleteWorkspace: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Set workspace as latest choice - Context7 pattern
 * PUT /api/workspaces/:id/set-latest
 */
export declare const setWorkspaceAsLatest: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Toggle workspace active status - Context7 pattern
 * PUT /api/workspaces/:id/toggle-active
 */
export declare const toggleWorkspaceActive: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=workspace.d.ts.map