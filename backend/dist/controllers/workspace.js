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
exports.getWorkspaceMembers = exports.toggleWorkspaceActive = exports.setWorkspaceAsLatest = exports.deleteWorkspace = exports.updateWorkspace = exports.getWorkspaceById = exports.getWorkspaces = exports.createWorkspace = void 0;
const workspaceService = __importStar(require("../services/workspace"));
/**
 * Create a new workspace - Context7 pattern
 * POST /api/workspaces
 */
const createWorkspace = async (req, res) => {
    try {
        // Get user ID from authenticated request
        const userId = req.user?.userId;
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
    }
    catch (error) {
        console.error('Create workspace error:', error);
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to create workspace',
        });
    }
};
exports.createWorkspace = createWorkspace;
/**
 * Get all workspaces for the authenticated user - Context7 pattern
 * GET /api/workspaces
 */
const getWorkspaces = async (req, res) => {
    try {
        // Get user ID from authenticated request
        const userId = req.user?.userId;
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
    }
    catch (error) {
        console.error('Get workspaces error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch workspaces',
        });
    }
};
exports.getWorkspaces = getWorkspaces;
/**
 * Get a specific workspace by ID - Context7 pattern
 * GET /api/workspaces/:id
 */
const getWorkspaceById = async (req, res) => {
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
    }
    catch (error) {
        console.error('Get workspace error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch workspace',
        });
    }
};
exports.getWorkspaceById = getWorkspaceById;
/**
 * Update a workspace - Context7 pattern
 * PUT /api/workspaces/:id
 */
const updateWorkspace = async (req, res) => {
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
    }
    catch (error) {
        console.error('Update workspace error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update workspace',
        });
    }
};
exports.updateWorkspace = updateWorkspace;
/**
 * Delete a workspace - Context7 pattern
 * DELETE /api/workspaces/:id
 */
const deleteWorkspace = async (req, res) => {
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
    }
    catch (error) {
        console.error('Delete workspace error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete workspace',
        });
    }
};
exports.deleteWorkspace = deleteWorkspace;
/**
 * Set workspace as latest choice - Context7 pattern
 * PUT /api/workspaces/:id/set-latest
 */
const setWorkspaceAsLatest = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
        }
        const { id } = req.params;
        // Set workspace as latest choice
        const workspace = await workspaceService.setWorkspaceAsLatestChoice(id, userId);
        return res.status(200).json({
            success: true,
            message: 'Workspace set as latest choice',
            data: workspace,
        });
    }
    catch (error) {
        console.error('Set workspace as latest error:', error);
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to set workspace as latest choice',
        });
    }
};
exports.setWorkspaceAsLatest = setWorkspaceAsLatest;
/**
 * Toggle workspace active status - Context7 pattern
 * PUT /api/workspaces/:id/toggle-active
 */
const toggleWorkspaceActive = async (req, res) => {
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
        // Toggle workspace active status
        const workspace = await workspaceService.toggleWorkspaceActiveStatus(id, userId, isActive);
        return res.status(200).json({
            success: true,
            message: `Workspace ${isActive ? 'activated' : 'deactivated'} successfully`,
            data: workspace,
        });
    }
    catch (error) {
        console.error('Toggle workspace active error:', error);
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to toggle workspace status',
        });
    }
};
exports.toggleWorkspaceActive = toggleWorkspaceActive;
/**
 * Get workspace members - Context7 pattern
 * GET /api/workspaces/:id/members
 */
const getWorkspaceMembers = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
        }
        const { id } = req.params;
        // Get workspace members
        const members = await workspaceService.getWorkspaceMembers(id, userId);
        return res.status(200).json({
            success: true,
            data: members,
        });
    }
    catch (error) {
        console.error('Get workspace members error:', error);
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to get workspace members',
        });
    }
};
exports.getWorkspaceMembers = getWorkspaceMembers;
//# sourceMappingURL=workspace.js.map