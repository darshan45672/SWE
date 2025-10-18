import { Request, Response } from 'express';
import * as projectService from '../services/project';

/**
 * Create a new project - Context7 pattern
 * POST /api/projects
 */
export const createProject = async (req: Request, res: Response) => {
  try {
    // Get user ID from authenticated request
    const userId = (req as any).user?.userId;
    
    console.log('Create project request:', { userId, body: req.body });
    
    if (!userId) {
      console.error('No user ID found in request');
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const { name, description, workspaceId } = req.body;

    // Create project
    const project = await projectService.createProject(userId, {
      name,
      description,
      workspaceId,
    });

    console.log('Project created successfully:', project.id);

    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project,
    });
  } catch (error) {
    console.error('Create project error:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create project',
    });
  }
};

/**
 * Get all projects for a workspace - Context7 pattern
 * GET /api/projects/workspace/:workspaceId
 */
export const getProjectsByWorkspace = async (req: Request, res: Response) => {
  try {
    // Get user ID from authenticated request
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const { workspaceId } = req.params;

    // Fetch projects
    const projects = await projectService.getProjectsByWorkspace(workspaceId, userId);

    return res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error('Get projects error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
    });
  }
};

/**
 * Get a specific project by ID - Context7 pattern
 * GET /api/projects/:id
 */
export const getProjectById = async (req: Request, res: Response) => {
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

    // Fetch project
    const project = await projectService.getProjectById(id, userId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or access denied',
      });
    }

    return res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error('Get project error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch project',
    });
  }
};

/**
 * Update a project - Context7 pattern
 * PUT /api/projects/:id
 */
export const updateProject = async (req: Request, res: Response) => {
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
    const { name, description, isActive } = req.body;

    // Update project
    const project = await projectService.updateProject(id, userId, {
      name,
      description,
      isActive,
    });

    if (!project) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only workspace members can update projects.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project,
    });
  } catch (error) {
    console.error('Update project error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update project',
    });
  }
};

/**
 * Delete a project - Context7 pattern
 * DELETE /api/projects/:id
 */
export const deleteProject = async (req: Request, res: Response) => {
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

    // Delete project
    const success = await projectService.deleteProject(id, userId);

    if (!success) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only workspace owners and admins can delete projects.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    console.error('Delete project error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete project',
    });
  }
};

/**
 * Set project as latest choice - Context7 pattern
 * PUT /api/projects/:id/set-latest
 */
export const setProjectAsLatest = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const { id } = req.params;

    // Set project as latest choice
    const project = await projectService.setProjectAsLatestChoice(id, userId);

    return res.status(200).json({
      success: true,
      message: 'Project set as latest choice',
      data: project,
    });
  } catch (error) {
    console.error('Set project as latest error:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to set project as latest choice',
    });
  }
};

/**
 * Toggle project active status - Context7 pattern
 * PUT /api/projects/:id/toggle-active
 */
export const toggleProjectActive = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be a boolean value',
      });
    }

    // Toggle project active status
    const project = await projectService.toggleProjectActiveStatus(id, userId, isActive);

    return res.status(200).json({
      success: true,
      message: `Project ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: project,
    });
  } catch (error) {
    console.error('Toggle project active error:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to toggle project status',
    });
  }
};
