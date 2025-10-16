import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as workspaceService from '../services/workspace';

/**
 * Create a new workspace - Context7 pattern
 * POST /api/workspaces
 */
export const createWorkspace = async (req: Request, res: Response) => {
  try {
    // Get user ID from authenticated request
    const userId = (req as any).user?.userId;
    
    console.log('Create workspace request:', { userId, body: req.body });
    
    if (!userId) {
      console.error('No user ID found in request');
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const { name, description, icon, color } = req.body;

    // Create workspace
    const workspace = await workspaceService.createWorkspace(userId, {
      name,
      description,
      icon,
      color,
    });

    console.log('Workspace created successfully:', workspace.id);

    return res.status(201).json({
      success: true,
      message: 'Workspace created successfully',
      data: workspace,
    });
  } catch (error) {
    console.error('Create workspace error:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create workspace',
    });
  }
};

/**
 * Get all workspaces for the authenticated user - Context7 pattern
 * GET /api/workspaces
 */
export const getWorkspaces = async (req: Request, res: Response) => {
  try {
    // Get user ID from authenticated request
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Fetch user's workspaces
    const workspaces = await workspaceService.getUserWorkspaces(userId);

    return res.status(200).json({
      success: true,
      data: workspaces,
    });
  } catch (error) {
    console.error('Get workspaces error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch workspaces',
    });
  }
};

/**
 * Get a specific workspace by ID - Context7 pattern
 * GET /api/workspaces/:id
 */
export const getWorkspaceById = async (req: Request, res: Response) => {
  try {
    // Get user ID from authenticated request
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const { id } = req.params;

    // Fetch workspace
    const workspace = await workspaceService.getWorkspaceById(id, userId);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found or access denied',
      });
    }

    return res.status(200).json({
      success: true,
      data: workspace,
    });
  } catch (error) {
    console.error('Get workspace error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch workspace',
    });
  }
};

/**
 * Update a workspace - Context7 pattern
 * PUT /api/workspaces/:id
 */
export const updateWorkspace = async (req: Request, res: Response) => {
  try {
    // Get user ID from authenticated request
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const { id } = req.params;
    const { name, description, icon, color } = req.body;

    // Update workspace
    const workspace = await workspaceService.updateWorkspace(id, userId, {
      name,
      description,
      icon,
      color,
    });

    if (!workspace) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only workspace owners and admins can update workspaces.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Workspace updated successfully',
      data: workspace,
    });
  } catch (error) {
    console.error('Update workspace error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update workspace',
    });
  }
};

/**
 * Delete a workspace - Context7 pattern
 * DELETE /api/workspaces/:id
 */
export const deleteWorkspace = async (req: Request, res: Response) => {
  try {
    // Get user ID from authenticated request
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const { id } = req.params;

    // Delete workspace
    const success = await workspaceService.deleteWorkspace(id, userId);

    if (!success) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only workspace owners can delete workspaces.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Workspace deleted successfully',
    });
  } catch (error) {
    console.error('Delete workspace error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete workspace',
    });
  }
};
