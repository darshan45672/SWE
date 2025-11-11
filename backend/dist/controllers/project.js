"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleProjectActive = exports.setProjectAsLatest = exports.deleteProject = exports.updateProject = exports.getProjectById = exports.getProjectsByWorkspace = exports.createProject = void 0;
const projectService = __importStar(require("../services/project"));
/**
 * Create a new project - Context7 pattern
 * POST /api/projects
 */
const createProject = async (req, res) => {
    try {
        // Get user ID from authenticated request
        const userId = req.user?.userId;
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
    }
    catch (error) {
        console.error('Create project error:', error);
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to create project',
        });
    }
};
exports.createProject = createProject;
/**
 * Get all projects for a workspace - Context7 pattern
 * GET /api/projects/workspace/:workspaceId
 */
const getProjectsByWorkspace = async (req, res) => {
    try {
        // Get user ID from authenticated request
        const userId = req.user?.userId;
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
    }
    catch (error) {
        console.error('Get projects error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch projects',
        });
    }
};
exports.getProjectsByWorkspace = getProjectsByWorkspace;
/**
 * Get a specific project by ID - Context7 pattern
 * GET /api/projects/:id
 */
const getProjectById = async (req, res) => {
    try {
        // Get user ID from authenticated request
        const userId = req.user?.userId;
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
    }
    catch (error) {
        console.error('Get project error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch project',
        });
    }
};
exports.getProjectById = getProjectById;
/**
 * Update a project - Context7 pattern
 * PUT /api/projects/:id
 */
const updateProject = async (req, res) => {
    try {
        // Get user ID from authenticated request
        const userId = req.user?.userId;
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
    }
    catch (error) {
        console.error('Update project error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update project',
        });
    }
};
exports.updateProject = updateProject;
/**
 * Delete a project - Context7 pattern
 * DELETE /api/projects/:id
 */
const deleteProject = async (req, res) => {
    try {
        // Get user ID from authenticated request
        const userId = req.user?.userId;
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
    }
    catch (error) {
        console.error('Delete project error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete project',
        });
    }
};
exports.deleteProject = deleteProject;
/**
 * Set project as latest choice - Context7 pattern
 * PUT /api/projects/:id/set-latest
 */
const setProjectAsLatest = async (req, res) => {
    try {
        const userId = req.user?.userId;
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
    }
    catch (error) {
        console.error('Set project as latest error:', error);
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to set project as latest choice',
        });
    }
};
exports.setProjectAsLatest = setProjectAsLatest;
/**
 * Toggle project active status - Context7 pattern
 * PUT /api/projects/:id/toggle-active
 */
const toggleProjectActive = async (req, res) => {
    try {
        const userId = req.user?.userId;
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
    }
    catch (error) {
        console.error('Toggle project active error:', error);
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to toggle project status',
        });
    }
};
exports.toggleProjectActive = toggleProjectActive;
//# sourceMappingURL=project.js.map