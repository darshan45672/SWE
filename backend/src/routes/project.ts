import { Router } from 'express';
import * as projectController from '../controllers/project';
import * as projectValidators from '../validators/project';
import { handleValidationErrors } from '../validators/middleware';
import { requireAuth } from '../auth/middleware';

const router = Router();

// All project routes require authentication - Context7 security pattern
router.use(requireAuth);

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Private (workspace members)
 */
router.post(
  '/',
  projectValidators.createProjectValidation,
  handleValidationErrors,
  projectController.createProject
);

/**
 * @route   GET /api/projects/workspace/:workspaceId
 * @desc    Get all projects for a workspace
 * @access  Private (workspace members only)
 */
router.get(
  '/workspace/:workspaceId',
  projectValidators.getProjectsByWorkspaceValidation,
  handleValidationErrors,
  projectController.getProjectsByWorkspace
);

/**
 * @route   GET /api/projects/:id
 * @desc    Get a specific project by ID
 * @access  Private (workspace members only)
 */
router.get(
  '/:id',
  projectValidators.getProjectValidation,
  handleValidationErrors,
  projectController.getProjectById
);

/**
 * @route   PUT /api/projects/:id
 * @desc    Update a project
 * @access  Private (workspace members only)
 */
router.put(
  '/:id',
  projectValidators.updateProjectValidation,
  handleValidationErrors,
  projectController.updateProject
);

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete a project
 * @access  Private (workspace owners and admins only)
 */
router.delete(
  '/:id',
  projectValidators.deleteProjectValidation,
  handleValidationErrors,
  projectController.deleteProject
);

export default router;
